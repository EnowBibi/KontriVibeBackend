import User from "../models/User.js";
import Post from "../models/Post.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { cloudinary, uploadImage } from "../config/cloudinary.js";
export const upload = uploadImage;



/*-----------------------------------------------------------------------------------------------------
| @function registerUser
| @brief    Registers a new user with profile image, handles both regular users and artists
| @param    req.body: { fullName, email, password, role, stageName? }
|           req.file: profile image from multer
| @return   201 with success message on success, 400/500 on error
-----------------------------------------------------------------------------------------------------*/
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role, stageName } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "user",
      stageName: role === "artist" ? stageName.trim() : null,
      profileImage: null,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error("Registration Error", error);
    res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};

/*-----------------------------------------------------------------------------------------------------
| @function verifyCode
| @brief    Placeholder function - email verification no longer required
| @param    --
| @return   --
-----------------------------------------------------------------------------------------------------*/
// If keeping for backward compatibility, it returns a success response.
export const verifyCode = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Email verification is no longer required",
    });
  } catch (error) {
    console.error("Verify Error", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: req.file.path },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      profileImageUrl: updatedUser.profileImage,
    });
  } catch (error) {
    console.error("[Upload Profile Picture Error]", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload profile picture",
    });
  }
};

/*-----------------------------------------------------------------------------------------------------
| @function loginUser
| @brief    Authenticates user with email and password, returns JWT token
| @param    req.body: { email, password }
| @return   200 with token and user data on success, 401/500 on error
-----------------------------------------------------------------------------------------------------*/
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        stageName: user.stageName || null,
        profileImageUrl: user.profileImageUrl,
      },
    });

    console.info(`[Login] User authenticated: ${user.email}`);
  } catch (error) {
    console.error("[Login Error]", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/*-----------------------------------------------------------------------------------------------------
| @function logoutUser
| @brief    Logs out user by adding token to blacklist
| @param    req.headers: authorization token
| @return   200 with success message
-----------------------------------------------------------------------------------------------------*/
let tokenBlacklist = [];

export const logoutUser = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    tokenBlacklist.push(token);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });

    console.info("[Logout] User logged out");
  } catch (error) {
    console.error("[Logout Error]", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
};

export const createPost = async (req, res) => {
  try {
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    // Destructure with fallback to empty string / default
    const {
      content = "",
      visibility = "public",
      relatedSongId = null,
      relatedChallengeId = null,
      aiGenerated = false,
    } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Post content is required" });
    }

    // Multer + Cloudinary stores uploaded file info in req.file
    const mediaUrl = req.file ? req.file.path : null;
    const mediaType = req.file ? req.file.mimetype.split("/")[0] : "none"; // image/video/audio

    const newPost = new Post({
      authorId: req.user?.userId, // from authenticate middleware
      content,
      mediaUrl,
      mediaType,
      visibility,
      relatedSongId,
      relatedChallengeId,
      aiGenerated,
      timestamp: new Date(),
    });

    const savedPost = await newPost.save();

    console.info("Post created successfully");

    res.status(201).json({
      message: "Post created successfully",
      post: savedPost,
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ message: "Server error while creating post" });
  }
};
