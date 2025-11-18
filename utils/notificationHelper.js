/*-----------------------------------------------------------------------------------------------------
| @blocktype notificationHelper
| @brief    Helper functions for generating and managing notifications across the system
| @param    User ID, notification type, and related data
| @return   Saved notification document with push notification sent
-----------------------------------------------------------------------------------------------------*/

import Notification from "../models/Notification.js";
import PushToken from "../models/PushToken.js";
import { sendPushNotification } from "./firebaseAdmin.js";

/**
 * @brief Create and send notification with automatic push delivery
 * @param userId - Target user ID
 * @param type - Notification type (payment_success, subscription_renewed, etc.)
 * @param title - Notification title
 * @param message - Notification message
 * @param data - Optional metadata and content links
 * @return Saved notification with push delivery status
 */
export async function createNotification(
  userId,
  type,
  title,
  message,
  data = {}
) {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data,
    });

    const savedNotification = await notification.save();

    // Attempt to send push notification
    await sendPushNotificationToUser(userId, title, message, data);

    return { success: true, notification: savedNotification };
  } catch (error) {
    console.error("Notification creation error:", error);
    throw error;
  }
}

/**
 * @brief Send push notification to user via all registered FCM tokens
 * @param userId - Target user ID
 * @param title - Push notification title
 * @param message - Push notification body
 * @param data - Custom data payload
 * @return Array of push notification results
 */
export async function sendPushNotificationToUser(
  userId,
  title,
  message,
  data = {}
) {
  try {
    // Fetch all active push tokens for user
    const pushTokens = await PushToken.find({
      userId,
      isActive: true,
    });

    if (pushTokens.length === 0) {
      console.log(`No active push tokens for user ${userId}`);
      return [];
    }

    const results = [];

    for (const tokenDoc of pushTokens) {
      try {
        const result = await sendPushNotification(
          tokenDoc.token,
          title,
          message,
          {
            userId: userId.toString(),
            ...data,
          }
        );
        results.push({ token: tokenDoc.token, result });
        tokenDoc.lastUsedAt = new Date();
        await tokenDoc.save();
      } catch (error) {
        if (error.code === "messaging/invalid-registration-token") {
          // Token is invalid, mark as inactive
          tokenDoc.isActive = false;
          await tokenDoc.save();
        }
        console.error(`Failed to send to token ${tokenDoc.token}:`, error);
        results.push({ token: tokenDoc.token, error: error.message });
      }
    }

    return results;
  } catch (error) {
    console.error("Push notification dispatch error:", error);
    throw error;
  }
}

/**
 * @brief Helper for payment success notifications
 */
export async function notifyPaymentSuccess(userId, subscriptionDetails) {
  return createNotification(
    userId,
    "payment_success",
    "Payment Successful",
    `Your subscription to ${subscriptionDetails.planName} has been activated`,
    {
      relatedContentId: subscriptionDetails.subscriptionId,
      metadata: subscriptionDetails,
    }
  );
}

/**
 * @brief Helper for subscription expiry reminders
 */
export async function notifySubscriptionExpiring(userId, daysRemaining) {
  return createNotification(
    userId,
    "subscription_expiring",
    "Subscription Expiring Soon",
    `Your premium subscription expires in ${daysRemaining} days. Renew now to continue enjoying unlimited features.`,
    { daysRemaining }
  );
}

/**
 * @brief Helper for AI credit limit warnings
 */
export async function notifyAICreditLimit(userId, remainingRequests) {
  return createNotification(
    userId,
    "ai_credit_limit",
    "AI Credit Limit Reached",
    `You've reached your daily AI generation limit (${remainingRequests} remaining). Upgrade to premium for unlimited access.`,
    { remainingRequests }
  );
}

/**
 * @brief Helper for new feature announcements
 */
export async function notifyNewFeature(userId, featureName, description) {
  return createNotification(
    userId,
    "new_feature",
    `New Feature: ${featureName}`,
    description,
    { featureName }
  );
}
