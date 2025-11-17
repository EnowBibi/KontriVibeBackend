/*-----------------------------------------------------------------------------------------------------
| @blocktype Notification
| @brief    MongoDB model for managing user notifications and notification history
| @param    NotificationSchema properties
| @return   Mongoose model for Notification collection
-----------------------------------------------------------------------------------------------------*/

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "payment_success",
        "payment_failed",
        "subscription_expiring",
        "subscription_renewed",
        "new_feature",
        "music_release",
        "follower_update",
        "system_alert",
        "ai_credit_limit",
      ],
      default: "system_alert",
    },
    data: {
      relatedContentId: mongoose.Schema.Types.ObjectId,
      relatedLink: String,
      metadata: mongoose.Schema.Types.Mixed,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    pushSent: {
      type: Boolean,
      default: false,
    },
    pushTokens: [String],
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      index: true,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
