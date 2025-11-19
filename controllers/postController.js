import Post from "../models/Post.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

/*-----------------------------------------------------------------------------------------------------
| @blocktype createPost
| @brief    Creates a new post with optional media upload to Cloudinary
| @param    req - Express request object containing userId, post content, and optional file
| @param    res - Express response object
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
export const createPost = async (req, res) => {
  try {
    const {
      authorId,
      content,
      visibility,
      relatedSongId,
      relatedChallengeId,
      aiGenerated,
    } = req.body;

    if (!authorId || !content) {
      return res.status(400).json({
        success: false,
        message: "Author ID and content are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid author ID format",
      });
    }

    let mediaUrl = null;
    let mediaType = "none";

    if (req.file) {
      mediaUrl = req.file.path;
      const fileType = req.file.mimetype.split("/")[0];
      if (["image", "video", "audio"].includes(fileType)) {
        mediaType = fileType;
      }
    }

    const postData = {
      authorId: new mongoose.Types.ObjectId(authorId),
      content,
      mediaUrl,
      mediaType,
      visibility: visibility || "public",
      aiGenerated: aiGenerated || false,
      likesCount: 0,
      commentsCount: 0,
    };

    if (relatedSongId && mongoose.Types.ObjectId.isValid(relatedSongId)) {
      postData.relatedSongId = new mongoose.Types.ObjectId(relatedSongId);
    }

    if (relatedChallengeId && mongoose.Types.ObjectId.isValid(relatedChallengeId)) {
      postData.relatedChallengeId = new mongoose.Types.ObjectId(relatedChallengeId);
    }

    // FIXED: create the post properly
    const savedPost = await Post.create(postData);

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: savedPost,
    });

  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create post",
      error: error.message,
    });
  }
};


/*-----------------------------------------------------------------------------------------------------
| @blocktype getPostById
| @brief    Retrieves a single post by ID with author details
| @param    req - Express request object containing post ID in params
| @param    res - Express response object
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate(
      "authorId",
      "name profilePicture username"
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch post",
      error: error.message,
    });
  }
};

/*-----------------------------------------------------------------------------------------------------
| @blocktype getAllPosts
| @brief    Retrieves all public posts with pagination and filtering
| @param    req - Express request object containing query params (page, limit, visibility)
| @param    res - Express response object
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
export const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, visibility = "public" } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ visibility })
      .populate("authorId", "name profilePicture username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({ visibility });

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: error.message,
    });
  }
};

/*-----------------------------------------------------------------------------------------------------
| @blocktype getUserPosts
| @brief    Retrieves all posts created by a specific user
| @param    req - Express request object containing userId in params and query options
| @param    res - Express response object
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ authorId: userId })
      .populate("authorId", "name profilePicture username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({ authorId: userId });

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user posts",
      error: error.message,
    });
  }
};

/*-----------------------------------------------------------------------------------------------------
| @blocktype updatePost
| @brief    Updates post content, visibility, or media with optional new media upload
| @param    req - Express request object containing post ID and updated fields
| @param    res - Express response object
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, visibility } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (content) post.content = content;
    if (visibility) post.visibility = visibility;

    if (req.file) {
      // Delete old media from Cloudinary if it exists
      if (post.mediaUrl) {
        try {
          const publicId = post.mediaUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`kontrivibe/posts/${publicId}`);
        } catch (deleteError) {
          console.error("Error deleting old media:", deleteError);
          // Continue anyway, don't fail the update
        }
      }

      // Set new media URL from CloudinaryStorage
      post.mediaUrl = req.file.path;
      const fileType = req.file.mimetype.split("/")[0];
      post.mediaType = ["image", "video", "audio"].includes(fileType)
        ? fileType
        : "none";
    }

    const updatedPost = await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update post",
      error: error.message,
    });
  }
};

/*-----------------------------------------------------------------------------------------------------
| @blocktype deletePost
| @brief    Deletes a post and its associated media from Cloudinary
| @param    req - Express request object containing post ID in params
| @param    res - Express response object
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.mediaUrl) {
      try {
        const publicId = post.mediaUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`kontrivibe/posts/${publicId}`);
      } catch (deleteError) {
        console.error("Error deleting media:", deleteError);
        // Continue with post deletion anyway
      }
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete post",
      error: error.message,
    });
  }
};

/*-----------------------------------------------------------------------------------------------------
| @blocktype likePost
| @brief    Increments the like count for a post
| @param    req - Express request object containing post ID
| @param    res - Express response object
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Post liked successfully",
      data: post,
    });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to like post",
      error: error.message,
    });
  }
};

/*-----------------------------------------------------------------------------------------------------
| @blocktype unlikePost
| @brief    Decrements the like count for a post
| @param    req - Express request object containing post ID
| @param    res - Express response object
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
export const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: -1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Post unliked successfully",
      data: post,
    });
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unlike post",
      error: error.message,
    });
  }
};

/*-----------------------------------------------------------------------------------------------------
| @blocktype getPostsByChallenge
| @brief    Retrieves all posts associated with a specific challenge
| @param    req - Express request object containing challenge ID and pagination options
| @param    res - Express response object
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
export const getPostsByChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ relatedChallengeId: challengeId })
      .populate("authorId", "name profilePicture username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({
      relatedChallengeId: challengeId,
    });

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching challenge posts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch challenge posts",
      error: error.message,
    });
  }
};

/*-----------------------------------------------------------------------------------------------------
| @blocktype getPostsBySong
| @brief    Retrieves all posts associated with a specific song
| @param    req - Express request object containing song ID and pagination options
| @param    res - Express response object
| @return   -- 
-----------------------------------------------------------------------------------------------------*/
export const getPostsBySong = async (req, res) => {
  try {
    const { songId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ relatedSongId: songId })
      .populate("authorId", "name profilePicture username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({ relatedSongId: songId });

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching song posts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch song posts",
      error: error.message,
    });
  }
};
