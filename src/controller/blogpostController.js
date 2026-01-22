import { count } from "console";
import Blog from "../Model/blogpostSchema.js";

// create  blog Post
export const createBlog = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const author = req.userId;
    // find if there is duplicate blog
    const Blog_exit = await Blog.findOne({ title }); // findOne function to serach if there is any existing blog

    if (Blog_exit) {
      return res.status(409).json({
        error: "conflict",
        message: "Blog with this title already exists",
      });
    }
    // if not create the new blog
    const new_Blog = await Blog.create({
      title,
      content,
      tags,
      author: req.userId,
    });
    res.status(201).json(new_Blog);
  } catch (error) {
    // any error
    console.log(error);
    res.status(500).json({
      error: "Internal Server error",
      message: "Failed to create blog",
    });
  }
};

// Update blog post
export const updateBlog = async (req, res) => {
  try {
    if ("author" in req.body) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Author cannot be updated",
      });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.blog._id, req.body, {
      new: true,
      runValidators: true,
    }).populate("author", "username email");

    res.status(200).json({
      message: "Blog updated successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "InternalServerError",
      message: "Failed to update blog",
    });
  }
};

//Delete
export const deleteBlog = async (req, res) => {
  try {
    await req.blog.deleteOne();

    res.status(200).json({
      message: "Blog successfully deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "InternalServerError",
      message: "Failed to delete blog",
    });
  }
};

// // get the single blog
// export const getBlogID = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const blog = await Blog.findById(id).populate(
//       "author",
//       "username email role",
//     );

//     if (!blog) {
//       return res.status(404).json({
//         error: "NOT FOUND",
//         message: "blog Not found",
//       });
//     }
//     res.status(200).json({
//       success: true,
//       blog,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       error: "InternalServerError",
//       message: "Failed to fetch blog",
//     });
//   }
// };

// //Get all Blogs
// export const getAllBlogs = async (req, res) => {
//   try {
//     const blogs = await Blog.find()
//       .sort({ createdDate: -1 })
//       .populate("author", "username email role");

//     res.status(200).json({
//       count: blogs.length,
//       blogs,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: "InternalServerError",
//       message: "Failed to fetch blogs",
//     });
//   }
// };

// Get all blogs with search + pagination
export const getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Search condition
    const query = search ? { title: { $regex: search, $options: "i" } } : {};

    // Get blogs
    const blogs = await Blog.find(query)
      .sort({ createdDate: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate("author", "username email role");

    // Total count for pagination
    const totalBlogs = await Blog.countDocuments(query);

    return res.status(200).json({
      success: true,
      pagination: {
        totalBlogs,
        totalPages: Math.ceil(totalBlogs / limitNumber),
        currentPage: pageNumber,
        limit: limitNumber,
      },
      blogs,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "InternalServerError",
      message: "Failed to fetch blogs",
    });
  }
};
