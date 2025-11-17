/*-----------------------------------------------------------------------------------------------------
| @blocktype aiConfig
| @brief    Configuration constants for AI services and rate limits
| @param    --
| @return   Configuration object
-----------------------------------------------------------------------------------------------------*/

export const AIConfig = {
  // OpenRouter models
  LYRIC_MODEL: "deepseek/deepseek-chat-v3-0324",
  CHATBOT_MODEL: "deepseek/deepseek-chat-v3-0324",

  // Free user limits (per day)
  FREE_USER_LIMITS: {
    lyricsGeneration: 5,
    chatbotRequests: 10,
  },

  // Premium user limits
  PREMIUM_USER_LIMITS: {
    lyricsGeneration: 999999, // Unlimited
    chatbotRequests: 999999, // Unlimited
  },

  // API parameters
  LYRIC_GENERATION: {
    temperature: 0.8,
    max_tokens: 800,
  },

  CHATBOT: {
    temperature: 0.7,
    max_tokens: 500,
  },
};
