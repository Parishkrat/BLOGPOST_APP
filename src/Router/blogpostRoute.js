import express from "express";
import {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
} from "../controller/blogpostController.js";
import { isAuthenticated } from "../Middleware/authmiddleware.js";
import { authorizeRoles } from "../Middleware/roleMiddleware.js";
import { isBlogOwnerOrAdmin } from "../Middleware/blogpostmiddleware.js";

const blogRoute = express.Router();

blogRoute.post(
  "/blogpost",
  isAuthenticated,
  authorizeRoles("admin", "creator"),
  createBlog,
);
blogRoute.put(
  "/blogpost/:id",
  isAuthenticated,
  authorizeRoles("admin", "creator"),
  isBlogOwnerOrAdmin,
  updateBlog,
);
blogRoute.delete(
  "/blogpost/:id",
  isAuthenticated,
  authorizeRoles("admin", "creator"),
  isBlogOwnerOrAdmin,
  deleteBlog,
);
blogRoute.get("/blogpost", getAllBlogs);

export default blogRoute;
