import Comment from "../Model/ComentSchema.js";
import Blog from "../Model/blogpostSchema.js";

// Create comment
export const createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { blogId } = req.params;

    if (!text) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Comment text is required",
      });
    }

    // Check blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        error: "NotFound",
        message: "Blog not found",
      });
    }

    const comment = await Comment.create({
      text,
      commenter: req.userId,
      blogPost: blogId,
    });

    return res.status(201).json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "InternalServerError",
      message: "Failed to create comment",
    });
  }
};

// Get comments for a blog
export const getCommentsByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    const comments = await Comment.find({ blogPost: blogId })
      .sort({ createdAt: -1 })
      .populate("commenter", "username email");

    return res.status(200).json({
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "InternalServerError",
      message: "Failed to fetch comments",
    });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        error: "NotFound",
        message: "Comment not found",
      });
    }

    const isAdmin = req.userRole === "admin";
    const isOwner = comment.commenter.toString() === req.userId.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You can only edit your own comment",
      });
    }

    comment.text = req.body.text || comment.text;
    await comment.save();

    return res.status(200).json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "InternalServerError",
      message: "Failed to update comment",
    });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        error: "NotFound",
        message: "Comment not found",
      });
    }

    const isAdmin = req.userRole === "admin";
    const isOwner = comment.commenter.toString() === req.userId.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You can only delete your own comment",
      });
    }

    await comment.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "InternalServerError",
      message: "Failed to delete comment",
    });
  }
};
