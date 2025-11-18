import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

CommentSchema.index({ contentId: 1 });

export default mongoose.model("Comment", CommentSchema);
