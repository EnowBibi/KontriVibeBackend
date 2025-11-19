import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  createPost,
} from "../controllers/authController.js";
import { uploadPost } from "../config/cloudinary.js";
import { uploadProfilePicture } from "../controllers/authController.js";
const router = express.Router();
router.post("/register", registerUser);
router.post(
  "/upload-profile-picture",
  uploadPost.single("profileImage"),
  uploadProfilePicture
);
router.post("/login", loginUser); // FIXED
router.post("/logout", logoutUser);
router.post("/post", uploadPost.single("image"), createPost);

export default router;
