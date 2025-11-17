import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "user",
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