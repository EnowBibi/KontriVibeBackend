import express from "express";
import { createComment, getCommentsByContent } from "../controllers/commentController.js";

const router = express.Router();

router.post("/", createComment);
router.get("/:contentId", getCommentsByContent);

export default router;
