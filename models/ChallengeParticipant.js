import mongoose from "mongoose";

const ChallengeParticipantSchema = new mongoose.Schema(
  {
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    entryType: { type: String, enum: ["repost", "video", "content"], required: true },
    entryUrl: String,
    repostLink: String,

    totalLikes: { type: Number, default: 0 },
    totalStreams: { type: Nsumber, default: 0 },
  },
  { timestamps: true }
);

ChallengeParticipantSchema.index({ challengeId: 1, userId: 1 });

export default mongoose.model("ChallengeParticipant", ChallengeParticipantSchema);
