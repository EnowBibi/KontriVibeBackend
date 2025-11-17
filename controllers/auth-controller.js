import User from "../models/User.js";
import Post from "../models/Post.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { cloudinary, uploadImage } from "../config/cloudinary.js";
export const upload = uploadImage;



export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

     const profileImageUrl = req.file ? req.file.path : null;

        if (!profileImageUrl) {
      return res.status(400).json({ message: "Image is required" });
    }    

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "user",
      profileImageUrl: profileImageUrl
      
    });

    await newUser.save();
    console.info("User registration successful");

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("User Registration Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Sign JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
    });
  } catch (error) {
    console.log("User Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

let tokenBlacklist = [];

export const logoutUser = (req, res) => {
  const token = req.token; // Provided by authenticate middleware
  tokenBlacklist.push(token);

  res.json({ message: "Logged out successfully" });
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