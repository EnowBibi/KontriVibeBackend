import express from "express";
import { toggleLike, getUserInteractions } from "../controllers/likeController.js";

const router = express.Router();

router.post("/toggle", toggleLike);
router.get("/interactions/:userId", getUserInteractions);

export default router;
