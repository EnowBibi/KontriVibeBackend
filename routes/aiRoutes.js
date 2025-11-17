/*-----------------------------------------------------------------------------------------------------
| @blocktype aiRoutes
| @brief    Defines all AI-related API endpoints for lyric generation, chatbot, and content history
| @param    Express app instance
| @return   --
-----------------------------------------------------------------------------------------------------*/

import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  generateLyrics,
  chatbotResponse,
  getAIContentHistory,
  getUsageStats,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/lyrics/generate", authenticate, generateLyrics);

router.post("/chatbot", authenticate, chatbotResponse);

router.get("/history", authenticate, getAIContentHistory);

router.get("/usage-stats", authenticate, getUsageStats);

export default router;
