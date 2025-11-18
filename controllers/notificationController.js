/*-----------------------------------------------------------------------------------------------------
| @blocktype notificationController
| @brief    Handles notification endpoints: fetching, marking read, registering push tokens
| @param    Express request and response objects
| @return   JSON responses with notification data or status updates
-----------------------------------------------------------------------------------------------------*/

import Notification from "../models/Notification.js";
import PushToken from "../models/PushToken.js";

/**
 * @brief Fetch all notifications for authenticated user with pagination
 * @param req.query.limit - Number of notifications per page (default: 20)
 * @param req.query.skip - Number of notifications to skip (default: 0)
 * @param req.query.unreadOnly - Boolean to fetch only unread (optional)
 * @return Array of notifications with total count
 */
export async function getNotifications(req, res) {
  try {
    const { limit = 20, skip = 0, unreadOnly = false } = req.query;
    const userId = req.user.id;

    const query = { userId };
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip, 10))
      .limit(parseInt(limit, 10))
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        limit: parseInt(limit, 10),
        skip: parseInt(skip, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return res.status(500).json({
      error: "Failed to fetch notifications",
      message: error.message,
    });
  }
}

/**
 * @brief Mark single notification as read
 * @param req.params.notificationId - ID of notification to mark as read
 * @return Updated notification object
 */
export async function markNotificationAsRead(req, res) {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json({
      error: "Failed to mark notification as read",
      message: error.message,
    });
  }
}

/**
 * @brief Mark all notifications as read for user
 * @param req - Express request object
 * @return Count of notifications updated
 */
export async function markAllNotificationsAsRead(req, res) {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    return res.status(500).json({
      error: "Failed to mark all notifications as read",
      message: error.message,
    });
  }
}

/**
 * @brief Register Firebase Cloud Messaging (FCM) token from React Native client
 * @param req.body.token - FCM token from device
 * @param req.body.deviceType - Device OS (ios, android)
 * @param req.body.deviceId - Optional unique device identifier
 * @return Saved push token document
 */
export async function registerPushToken(req, res) {
  try {
    const { token, deviceType, deviceId } = req.body;
    const userId = req.user.id;

    if (!token || !deviceType) {
      return res.status(400).json({
        error: "Missing required fields: token, deviceType",
      });
    }

    if (!["ios", "android", "web"].includes(deviceType)) {
      return res.status(400).json({
        error: "Invalid deviceType. Must be ios, android, or web",
      });
    }

    // Check if token already exists and update
    let pushToken = await PushToken.findOneAndUpdate(
      { token },
      {
        userId,
        deviceType,
        deviceId,
        isActive: true,
        lastUsedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    return res.status(201).json({
      success: true,
      message: "Push token registered successfully",
      data: pushToken,
    });
  } catch (error) {
    console.error("Register push token error:", error);
    return res.status(500).json({
      error: "Failed to register push token",
      message: error.message,
    });
  }
}

/**
 * @brief Unregister/deactivate FCM token when user logs out
 * @param req.body.token - FCM token to deactivate
 * @return Success message
 */
export async function unregisterPushToken(req, res) {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    await PushToken.findOneAndUpdate(
      { token, userId },
      { isActive: false },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Push token unregistered successfully",
    });
  } catch (error) {
    console.error("Unregister push token error:", error);
    return res.status(500).json({
      error: "Failed to unregister push token",
      message: error.message,
    });
  }
}

/**
 * @brief Delete notification by ID
 * @param req.params.notificationId - ID of notification to delete
 * @return Success message
 */
export async function deleteNotification(req, res) {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const result = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!result) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    return res.status(500).json({
      error: "Failed to delete notification",
      message: error.message,
    });
  }
}
