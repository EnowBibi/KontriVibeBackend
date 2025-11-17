import express from "express";
import { registerUser, loginUser, logoutUser, createPost } from "../controllers/auth-controller.js";
import { uploadImage } from "../config/cloudinary.js";

const router = express.Router();

router.post("/register", uploadImage.single("profileImage"), registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/post", uploadImage.single("image"), createPost);

export default router;
