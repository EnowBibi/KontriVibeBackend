import Comment from "../models/Comment.js";

// Create comment
export const createComment = async (req, res) => {
  const { userId, contentId, text } = req.body;
  try {
    const comment = new Comment({ userId, contentId, text });
    await comment.save();
    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get comments by contentId
export const getCommentsByContent = async (req, res) => {
  const { contentId } = req.params;
  try {
    const comments = await Comment.find({ contentId }).populate("userId", "fullName");
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
