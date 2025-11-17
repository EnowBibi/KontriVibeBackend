import mongoose from "mongoose";

const RepostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },
    songId: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true },

    repostUrl: String,
    shareableLinkToken: { type: String, unique: true },

    streams: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

RepostSchema.index({ shareableLinkToken: 1 });

export default mongoose.model("Repost", RepostSchema);
