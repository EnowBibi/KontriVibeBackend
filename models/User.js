import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "artist", "admin"],
      default: "user",
    },
    stageName: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    // Removed: verificationCode, verificationCodeExpires
    // isVerified is now always true by default

    preferences: {
      genres: [String],
      moods: [String],
      vibes: [String],
    },
    followers: {
      type: Number,
      default: 0,
    },
    following: {
      type: Number,
      default: 0,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumExpiresAt: {
      type: Date,
      default: null,
    },
    notifications: [
      {
        message: String,
        type: String,
        isRead: {
          type: Boolean,
          default: false,
        },
        relatedContentId: mongoose.Schema.Types.ObjectId,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
