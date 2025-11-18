import mongoose from "mongoose";

const { Schema, model } = mongoose;

const LikeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contentId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    contentType: {
      type: String,
      enum: ["song", "repost", "entry"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a user from liking the same content more than once
LikeSchema.index(
  { userId: 1, contentId: 1, contentType: 1 },
  { unique: true }
);

export default model("Like", LikeSchema);
