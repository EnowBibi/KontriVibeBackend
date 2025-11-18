/*-----------------------------------------------------------------------------------------------------
| @blocktype PushToken
| @brief    Model for storing and managing Firebase Cloud Messaging (FCM) tokens for React Native
| @param    PushTokenSchema properties
| @return   Mongoose model for PushToken collection
-----------------------------------------------------------------------------------------------------*/

import mongoose from "mongoose";

const pushTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    deviceType: {
      type: String,
      enum: ["ios", "android", "web"],
      required: true,
    },
    deviceId: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

const PushToken = mongoose.model("PushToken", pushTokenSchema);

export default PushToken;
