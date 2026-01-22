import Blog from "../Model/blogpostSchema.js";

export const isBlogOwnerOrAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        error: "NotFound",
        message: "Blog not found",
      });
    }

    const isAdmin = req.userRole === "admin";
    const isOwner = blog.author.toString() === req.userId.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You can only modify your own blog",
      });
    }

    // attach blog to request to avoid re-fetching
    req.blog = blog;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "InternalServerError",
      message: "Authorization failed",
    });
  }
};
