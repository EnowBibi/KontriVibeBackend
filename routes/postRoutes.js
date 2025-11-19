import express from "express";
import multer from "multer";
import {
  createPost,
  getPostById,
  getAllPosts,
  getUserPosts,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getPostsByChallenge,
  getPostsBySong,
} from "../controllers/postController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { uploadPost } from "../config/cloudinary.js";
const router = express.Router();

/*-----------------------------------------------------------------------------------------------------
| @blocktype Multer Configuration
| @brief    Configures multer for temporary file storage with file type filtering
| @param    -- 
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow image, video, and audio files
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/quicktime",
    "audio/mpeg",
    "audio/wav",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images, videos, and audio files are allowed."
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

/*-----------------------------------------------------------------------------------------------------
| @blocktype POST /api/posts
| @brief    Creates a new post with optional media upload
| @param    -- 
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
router.post("/", authenticate, uploadPost.single("media"), createPost);

/*-----------------------------------------------------------------------------------------------------
| @blocktype GET /api/posts/:postId
| @brief    Retrieves a specific post by ID
| @param    -- 
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
router.get("/:postId", getPostById);

/*-----------------------------------------------------------------------------------------------------
| @blocktype GET /api/posts
| @brief    Retrieves all public posts with pagination
| @param    -- 
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
router.get("/", getAllPosts);

/*-----------------------------------------------------------------------------------------------------
| @blocktype GET /api/posts/user/:userId
| @brief    Retrieves all posts by a specific user
| @param    -- 
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
router.get("/user/:userId", getUserPosts);

/*-----------------------------------------------------------------------------------------------------
| @blocktype PUT /api/posts/:postId
| @brief    Updates post content and/or media
| @param    -- 
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
router.put("/:postId", authenticate, uploadPost.single("media"), updatePost);

/*-----------------------------------------------------------------------------------------------------
| @blocktype DELETE /api/posts/:postId
| @brief    Deletes a post and its associated media
| @param    -- 
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
router.delete("/:postId", authenticate, deletePost);

/*-----------------------------------------------------------------------------------------------------
| @blocktype PUT /api/posts/:postId/like
| @brief    Likes a post
| @param    -- 
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
router.put("/:postId/like", authenticate, likePost);

/*-----------------------------------------------------------------------------------------------------
| @blocktype PUT /api/posts/:postId/unlike
| @brief    Unlikes a post
| @param    -- 
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
router.put("/:postId/unlike", authenticate, unlikePost);

/*-----------------------------------------------------------------------------------------------------
| @blocktype GET /api/posts/challenge/:challengeId
| @brief    Retrieves all posts associated with a specific challenge
| @param    -- 
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
router.get("/challenge/:challengeId", getPostsByChallenge);

/*-----------------------------------------------------------------------------------------------------
| @blocktype GET /api/posts/song/:songId
| @brief    Retrieves all posts associated with a specific song
| @param    -- 
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
router.get("/song/:songId", getPostsBySong);

export default router;
