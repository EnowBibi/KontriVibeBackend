/*-----------------------------------------------------------------------------------------------------
| @blocktype rateLimiter
| @brief    Utility functions for managing free user rate limits
| @param    --
| @return   Utility functions for rate limiting
-----------------------------------------------------------------------------------------------------*/

import UsageLimit from "../models/UsageLimit.js";

const FREE_LYRICS_LIMIT = 5; // 5 lyric generations per day
const FREE_CHATBOT_LIMIT = 10; // 10 chatbot requests per day
const PREMIUM_LYRICS_LIMIT = 999999; // Unlimited
const PREMIUM_CHATBOT_LIMIT = 999999; // Unlimited

/**
 * @brief Check if user has exceeded lyrics generation limit for the day
 * @param userId - User ID to check
 * @param isPremium - Whether user has premium subscription
 * @return Boolean indicating if limit exceeded
 */
export async function isLyricsLimitExceeded(userId, isPremium) {
  const limit = isPremium ? PREMIUM_LYRICS_LIMIT : FREE_LYRICS_LIMIT;

  let usageRecord = await UsageLimit.findOne({ userId });

  if (!usageRecord) {
    usageRecord = new UsageLimit({ userId });
    await usageRecord.save();
    return false;
  }

  // Reset daily counter if day has changed
  const now = new Date();
  const lastReset = new Date(usageRecord.lastLyricsReset);

  if (now.getDate() !== lastReset.getDate()) {
    usageRecord.lyricsGeneratedToday = 0;
    usageRecord.lastLyricsReset = now;
    await usageRecord.save();
    return false;
  }

  return usageRecord.lyricsGeneratedToday >= limit;
}

/**
 * @brief Check if user has exceeded chatbot request limit for the day
 * @param userId - User ID to check
 * @param isPremium - Whether user has premium subscription
 * @return Boolean indicating if limit exceeded
 */
export async function isChatbotLimitExceeded(userId, isPremium) {
  const limit = isPremium ? PREMIUM_CHATBOT_LIMIT : FREE_CHATBOT_LIMIT;

  let usageRecord = await UsageLimit.findOne({ userId });

  if (!usageRecord) {
    usageRecord = new UsageLimit({ userId });
    await usageRecord.save();
    return false;
  }

  // Reset daily counter if day has changed
  const now = new Date();
  const lastReset = new Date(usageRecord.lastChatbotReset);

  if (now.getDate() !== lastReset.getDate()) {
    usageRecord.chatbotRequestsToday = 0;
    usageRecord.lastChatbotReset = now;
    await usageRecord.save();
    return false;
  }

  return usageRecord.chatbotRequestsToday >= limit;
}

/**
 * @brief Increment lyrics usage counter for user
 * @param userId - User ID to update
 * @return Updated usage record
 */
export async function incrementLyricsUsage(userId) {
  let usageRecord = await UsageLimit.findOne({ userId });

  if (!usageRecord) {
    usageRecord = new UsageLimit({ userId });
  }

  usageRecord.lyricsGeneratedToday += 1;
  await usageRecord.save();
  return usageRecord;
}

/**
 * @brief Increment chatbot usage counter for user
 * @param userId - User ID to update
 * @return Updated usage record
 */
export async function incrementChatbotUsage(userId) {
  let usageRecord = await UsageLimit.findOne({ userId });

  if (!usageRecord) {
    usageRecord = new UsageLimit({ userId });
  }

  usageRecord.chatbotRequestsToday += 1;
  await usageRecord.save();
  return usageRecord;
}
