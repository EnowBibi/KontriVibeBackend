import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

    if (role === "artist" && !stageName) {
      return res.status(400).json({
        success: false,
        message: "Stage name is required for artists",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "user",
      stageName: role === "artist" ? stageName.trim() : null,
      profileImageUrl: req.file ? req.file.path : null, // optional now
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        stageName: newUser.stageName,
        profileImageUrl: newUser.profileImageUrl,
      },
    });

    console.info(`[Registration] User created: ${newUser.email}`);
  } catch (error) {
    console.error("[Registration Error]", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to register user",
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

    // Update user profile image
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImageUrl: req.file.path },
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
      profileImageUrl: updatedUser.profileImageUrl,
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

// Export tokenBlacklist for middleware to check
export { tokenBlacklist };
