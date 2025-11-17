import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyCode,
} from "../controllers/auth-controller.js";
import { uploadImage } from "../config/cloudinary.js";
import { uploadProfilePicture } from "../controllers/auth-controller.js";
const router = express.Router();
router.post("/register", registerUser);
router.post("/verify", verifyCode);
router.post(
  "/upload-profile-picture",
  uploadImage.single("profileImage"),
  uploadProfilePicture
);
router.post("/login", loginUser); // FIXED
router.post("/logout", logoutUser);

export default router;
