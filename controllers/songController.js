// controllers/songController.js
import Song from "../models/Song.js";

export const uploadSong = async (req, res) => {
  try {
    const { title, genre, mood, description, durationSec } = req.body;
    const artistId = req.user?.userId;

    // Check for files
    const coverImage = req.files?.["coverImage"]?.[0]?.path || null;
    const audioUrl = req.files?.["audioFile"]?.[0]?.path || null;

    if (!title || !audioUrl || !artistId) {
      return res
        .status(400)
        .json({ error: "Title, audio file, and artistId are required" });
    }

    const song = new Song({
      artistId,
      title,
      coverImage,
      audioUrl, // Cloudinary (or storage) URL from the uploaded file
      genre,
      mood,
      description,
      durationSec: durationSec || 0,
    });

    await song.save();
    res.status(201).json({ message: "Song uploaded successfully", song });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
// Get all songs
export const getAllSongs = async (req, res) => {
  try {
    const { page = 1, limit = 10, genre, approved } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (genre) query.genre = genre;
    if (approved !== undefined) query.isApproved = approved === "true";

    const songs = await Song.find(query)
      .populate("artistId", "fullName email profileImageUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Song.countDocuments(query);

    res.json({
      songs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get song by ID
export const getSongById = async (req, res) => {
  try {
    const { id } = req.params;
    const song = await Song.findById(id).populate(
      "artistId",
      "fullName email profileImageUrl"
    );
    if (!song) return res.status(404).json({ error: "Song not found" });
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update song
export const updateSong = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const song = await Song.findById(id);

    if (!song) return res.status(404).json({ error: "Song not found" });
    if (song.artistId.toString() !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    const { title, genre, mood, description, durationSec, snippetUrl } =
      req.body;

    if (title) song.title = title;
    if (genre) song.genre = genre;
    if (mood) song.mood = mood;
    if (description) song.description = description;
    if (durationSec) song.durationSec = durationSec;
    if (snippetUrl) song.snippetUrl = snippetUrl;
    if (req.file) song.coverImage = req.file.path;

    await song.save();
    res.json({ message: "Song updated successfully", song });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete song
export const deleteSong = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const song = await Song.findById(id);
    if (!song) return res.status(404).json({ error: "Song not found" });
    if (song.artistId.toString() !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    await Song.findByIdAndDelete(id);
    res.json({ message: "Song deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Record a stream
export const streamSong = async (req, res) => {
  try {
    const { id } = req.params;
    const song = await Song.findByIdAndUpdate(
      id,
      { $inc: { streamsCount: 1 } },
      { new: true }
    );
    if (!song) return res.status(404).json({ error: "Song not found" });
    res.json({ message: "Stream recorded", streamsCount: song.streamsCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get songs by artist
export const getSongsByArtist = async (req, res) => {
  try {
    const { artistId } = req.params;
    const { approved } = req.query;

    const query = { artistId };
    if (approved !== undefined) query.isApproved = approved === "true";

    const songs = await Song.find(query)
      .populate("artistId", "fullName email profileImageUrl")
      .sort({ createdAt: -1 });

    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search songs
export const searchSongs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q)
      return res.status(400).json({ error: "Query parameter 'q' is required" });

    const songs = await Song.find({ title: { $regex: q, $options: "i" } })
      .populate("artistId", "fullName email profileImageUrl")
      .sort({ createdAt: -1 });

    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
