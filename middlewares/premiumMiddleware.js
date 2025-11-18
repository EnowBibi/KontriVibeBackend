export const checkSongAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Import Song model
    const { default: Song } = await import("../models/Song.js");
    const { default: User } = await import("../models/User.js");

    const song = await Song.findById(id);
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    // If song is free, anyone can access it
    if (song.accessLevel === "free") {
      return next();
    }

    // If song is premium, only premium users can access it
    if (song.accessLevel === "premium") {
      if (!userId) {
        return res.status(401).json({ error: "Authentication required for premium songs" });
      }

      const user = await User.findById(userId);
      if (!user?.isPremium) {
        return res.status(403).json({ error: "Premium subscription required to access this song" });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const checkUploadPermission = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required to upload songs" });
    }

    const { default: User } = await import("../models/User.js");
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Allow all authenticated users to upload (but set accessLevel based on premium status)
    req.user.isPremium = user.isPremium;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
