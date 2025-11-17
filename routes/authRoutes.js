import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/auth-controller.js";
import { uploadImage } from "../config/cloudinary.js"; // ✅ import uploadImage

const router = express.Router();

router.post("/register", uploadImage.single("profileImage"), registerUser);
router.post("/login", loginUser); // FIXED
router.post("/logout", logoutUser);

export default router;
