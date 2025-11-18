import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  createPost,
} from "../controllers/authController.js";
import { uploadImage } from "../config/cloudinary.js";
import { uploadProfilePicture } from "../controllers/authController.js";
const router = express.Router();
router.post("/register", registerUser);
router.post(
  "/upload-profile-picture",
  uploadImage.single("profileImage"),
  uploadProfilePicture
);
router.post("/login", loginUser); // FIXED
router.post("/logout", logoutUser);
router.post("/post", uploadImage.single("image"), createPost);

export default router;
