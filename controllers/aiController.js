/*-----------------------------------------------------------------------------------------------------
| @blocktype aiController
| @brief    Handles AI-powered features including lyric generation and chatbot responses
| @param    Express request and response objects
| @return   JSON responses with generated content or error messages
-----------------------------------------------------------------------------------------------------*/

import User from "../models/User.js";
import AIContent from "../models/AIContent.js";
import openRouter from "../utils/openRouterClient.js";
import {
  isLyricsLimitExceeded,
  incrementLyricsUsage,
} from "../utils/rateLimiter.js";

export async function generateLyrics(req, res) {
  try {
    console.log("[v0] req.user:", req.user); // debug log to check if req.user exists

    const { theme, mood, genre } = req.body;
    const userId = req.user?.userId;

    console.log("[v0] userId:", userId); // debug log to verify userId extraction

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User ID not found in token. Please login again.",
      });
    }

    if (!theme || !mood || !genre) {
      return res
        .status(400)
        .json({ error: "Theme, mood, and genre are required" });
    }

    // Fetch user and check premium status
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check rate limit for free users
    const limitExceeded = await isLyricsLimitExceeded(userId, user.isPremium);
    if (limitExceeded) {
      return res.status(429).json({
        error: "Daily lyric generation limit exceeded",
        message: user.isPremium
          ? "Unexpected error. Contact support."
          : "Free users limited to 5 lyric generations per day. Upgrade to premium for unlimited access.",
        limit: user.isPremium ? "unlimited" : "5/day",
      });
    }

    // Create prompt for OpenRouter
    const prompt = `Generate creative, original African music lyrics in English.
Theme: ${theme}
Mood: ${mood}
Genre: ${genre}

Requirements:
- Write 2-3 verses with a chorus
- Use culturally relevant metaphors and language
- Make it inspiring and authentic to African artists
- No explicit content

Return only the lyrics, formatted clearly with verse and chorus labels.`;

    const response = await openRouter.chat.send({
      model: "deepseek/deepseek-chat-v3-0324",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const generatedLyrics = response.choices[0].message.content;

    console.log("[v0] AIContent model:", AIContent); // debug log to check if model is defined

    let aiContent;
    try {
      aiContent = new AIContent({
        userId,
        type: "lyrics",
        inputPrompt: `Theme: ${theme}, Mood: ${mood}, Genre: ${genre}`,
        outputText: generatedLyrics,
        tokensUsed: response.usage?.total_tokens || 0,
      });
      await aiContent.save();
    } catch (saveError) {
      console.error("[v0] Error saving AIContent:", saveError);
      // Continue without saving AIContent if it fails
    }

    // Increment usage counter
    await incrementLyricsUsage(userId);

    return res.status(200).json({
      success: true,
      lyrics: generatedLyrics,
      contentId: aiContent?._id || null,
      tokensUsed: response.usage?.total_tokens || 0,
    });
  } catch (error) {
    console.error("[v0] Lyric generation error:", error);
    console.error("[v0] Error stack:", error.stack); // add stack trace for debugging

    if (error.status === 429) {
      return res.status(429).json({
        error: "API rate limit exceeded",
        message:
          "Service temporarily unavailable. Please try again in a moment.",
      });
    }

    if (error.status === 401) {
      return res.status(500).json({
        error: "Authentication error with AI service",
        message: "Unable to process request. Contact support.",
      });
    }

    return res.status(500).json({
      error: "Failed to generate lyrics",
      message: error.message || "An unexpected error occurred",
    });
  }
}
/**
 * @brief Handle chatbot requests for copyright guidance and music advice
 * @param req.body.message - User question or prompt
 * @param req.body.context - Optional context about user's music situation
 * @return Chatbot response as JSON or error message
 */
export async function chatbotResponse(req, res) {
  try {
    const { message, context } = req.body;
    const userId = req.user.userId;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Fetch user and check premium status
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check rate limit for free users
    const limitExceeded = await isChatbotLimitExceeded(userId, user.isPremium);
    if (limitExceeded) {
      return res.status(429).json({
        error: "Daily chatbot request limit exceeded",
        message: user.isPremium
          ? "Unexpected error. Contact support."
          : "Free users limited to 10 chatbot requests per day. Upgrade to premium for unlimited access.",
        limit: user.isPremium ? "unlimited" : "10/day",
      });
    }

    const systemPrompt = `You are KontriVibe's AI Assistant, an expert in African music rights, copyright protection, and artist empowerment.
Your role is to help artists and music creators in Africa:
- Understand copyright and licensing
- Distribute music safely without piracy risks
- Learn legal ways to promote and monetize their work
- Navigate music publishing and rights management
- Avoid common copyright violations

Be conversational, supportive, and practical. Focus on solutions that help African artists thrive.
If asked about unrelated topics, politely redirect to music and copyright topics.`;

    let fullPrompt = message;
    if (context) {
      fullPrompt = `Context about my music situation: ${context}\n\nMy question: ${message}`;
    }

    // Call OpenRouter API for chatbot response
    const response = await openRouter.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: fullPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const chatbotMessage = response.choices[0].message.content;

    const aiContent = new AIContent({
      userId,
      type: "chatbot",
      inputPrompt: fullPrompt,
      outputText: chatbotMessage,
      tokensUsed: response.usage?.total_tokens || 0,
    });
    await aiContent.save();

    // Increment usage counter
    await incrementChatbotUsage(userId);

    return res.status(200).json({
      success: true,
      response: chatbotMessage,
      contentId: aiContent._id,
      tokensUsed: response.usage?.total_tokens || 0,
    });
  } catch (error) {
    console.error("[v0] Chatbot error:", error);

    if (error.status === 429) {
      return res.status(429).json({
        error: "API rate limit exceeded",
        message:
          "Service temporarily unavailable. Please try again in a moment.",
      });
    }

    if (error.status === 401) {
      return res.status(500).json({
        error: "Authentication error with AI service",
        message: "Unable to process request. Contact support.",
      });
    }

    return res.status(500).json({
      error: "Failed to get chatbot response",
      message: error.message || "An unexpected error occurred",
    });
  }
}

/**
 * @brief Retrieve user's AI content history
 * @param req.query.type - Optional filter by content type (lyrics, chatbot, audio)
 * @param req.query.limit - Number of records to return (default: 20)
 * @return Array of user's AI content history
 */
export async function getAIContentHistory(req, res) {
  try {
    const { type, limit = 20 } = req.query;
    const userId = req.user.userId;

    const query = { userId };
    if (type && ["lyrics", "chatbot", "audio"].includes(type)) {
      query.type = type;
    }

    const history = await AIContent.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .lean();

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error("[v0] Fetch history error:", error);
    return res.status(500).json({
      error: "Failed to fetch AI content history",
      message: error.message || "An unexpected error occurred",
    });
  }
}

/**
 * @brief Get user's current usage limits and remaining requests
 * @param req - Express request object
 * @return Current usage stats and limits
 */
export async function getUsageStats(req, res) {
  try {
    const userId = req.user.userId;

    // Fetch user details
    const user = await User.findById(userId).select("isPremium");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const UsageLimit = (await import("../models/UsageLimit.js")).default;
    const usageRecord = await UsageLimit.findOne({ userId });

    const lyricsLimit = user.isPremium ? 999999 : 5;
    const chatbotLimit = user.isPremium ? 999999 : 10;

    const lyricsUsed = usageRecord?.lyricsGeneratedToday || 0;
    const chatbotUsed = usageRecord?.chatbotRequestsToday || 0;

    return res.status(200).json({
      success: true,
      isPremium: user.isPremium,
      lyrics: {
        limit: lyricsLimit,
        used: lyricsUsed,
        remaining: Math.max(0, lyricsLimit - lyricsUsed),
      },
      chatbot: {
        limit: chatbotLimit,
        used: chatbotUsed,
        remaining: Math.max(0, chatbotLimit - chatbotUsed),
      },
    });
  } catch (error) {
    console.error("[v0] Usage stats error:", error);
    return res.status(500).json({
      error: "Failed to fetch usage statistics",
      message: error.message || "An unexpected error occurred",
    });
  }
}
