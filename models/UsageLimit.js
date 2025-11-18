import mongoose from "mongoose";

const usageLimitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    lyricsGeneratedToday: {
      type: Number,
      default: 0,
    },
    chatbotRequestsToday: {
      type: Number,
      default: 0,
    },
    lastLyricsReset: {
      type: Date,
      default: Date.now,
    },
    lastChatbotReset: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const UsageLimit = mongoose.model("UsageLimit", usageLimitSchema);

export default UsageLimit;
