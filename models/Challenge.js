import mongoose from "mongoose";

const ChallengeSchema = new mongoose.Schema(
  {
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    songId: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true },

    title: { type: String, required: true },
    description: String,
    rewardDescription: String,
    rules: String,

    startDate: Date,
    endDate: Date,

    participantsCount: { type: Number, default: 0 },

    leaderboard: {
      type: Array,
      default: [], // optional cached leaderboard
    },
  },
  { timestamps: true }
);

export default mongoose.model("Challenge", ChallengeSchema);
