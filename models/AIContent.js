import mongoose from "mongoose";

const aiContentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["lyrics", "chatbot", "audio"],
      required: true,
    },
    inputPrompt: {
      type: String,
      required: true,
    },
    outputText: {
      type: String,
      required: true,
    },
    outputUrl: {
      type: String,
      default: null,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const AIContent = mongoose.model("AIContent", aiContentSchema);

export default AIContent;
