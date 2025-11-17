import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    contentType: {
      type: String,
      enum: ["song", "repost", "entry"],
      required: true,
    },
  },
  { timestamps: true }
);

// prevent same user liking same item twice
LikeSchema.index({ userId: 1, contentId: 1 }, { unique: true });

export default mongoose.model("Like", LikeSchema);
