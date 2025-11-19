import express from "express";
import {
  uploadSong,
  getAllSongs,
  getSongById,
  updateSong,
  deleteSong,
  streamSong,
  getSongsByArtist,
  searchSongs,
} from "../controllers/songController.js";
import { uploadPost } from "../config/cloudinary.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { checkSongAccess } from "../middlewares/premiumMiddleware.js";

const router = express.Router();

// Update the middleware to accept fields
router.post(
  "/upload",
  authenticate,
  uploadPost.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "audioFile", maxCount: 1 },
  ]),
  uploadSong
);
// Get all songs (public)
router.get("/", authenticate, getAllSongs);

// Search songs
router.get("/search", searchSongs);

// Get specific song
router.get("/:id", getSongById);

// Record a stream (requires auth)
router.post("/:id/stream", authenticate, streamSong);

// Get songs by artist
router.get("/artist/:artistId", getSongsByArtist);

// Update song (requires auth & ownership)
router.put("/:id", authenticate, uploadPost.single("coverImage"), updateSong);

// Delete song (requires auth & ownership)
router.delete("/:id", authenticate, deleteSong);

export default router;
