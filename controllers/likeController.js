import Like from "../models/Like.js";

// Toggle Like (Add or Remove)
export const toggleLike = async (req, res) => {
  const { userId, contentId, contentType } = req.body;

  if (!userId || !contentId || !contentType) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if user already liked this specific content
    const existing = await Like.findOne({ userId, contentId, contentType });

    if (existing) {
      await existing.deleteOne();
      return res.json({
        message: "Like removed",
        liked: false,
      });
    }

    // Create new like
    const like = await Like.create({ userId, contentId, contentType });

    return res.json({
      message: "Like added",
      liked: true,
      like,
    });

  } catch (err) {
    console.error("Toggle Like Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get total number of user interactions
export const getUserInteractions = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const likesCount = await Like.countDocuments({ userId });

    return res.json({
      userId,
      likesCount,
    });

  } catch (err) {
    console.error("Get Interactions Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
