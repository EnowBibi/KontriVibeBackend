// models/Post.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const postSchema = new Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mediaUrl: String, // optional image/video/audio
    mediaType: {
      type: String,
      enum: ["image", "video", "audio", "none"],
      default: "none",
    },
    visibility: {
      type: String,
      enum: ["public", "private", "followersOnly"],
      default: "public",
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    relatedSongId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      default: null,
    },
    relatedChallengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      default: null,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // automatically adds createdAt & updatedAt
  }
);

const Post = model("Post", postSchema);

export default Post;
