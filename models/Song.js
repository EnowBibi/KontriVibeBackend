import mongoose from "mongoose";

const SongSchema = new mongoose.Schema(
  {
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    coverImage: String,
    audioUrl: { type: String, required: true },
    snippetUrl: String,

    genre: String,
    mood: String,
    description: String,

    durationSec: Number,

    streamsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },

    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Song", SongSchema);
