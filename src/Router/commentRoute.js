import express from "express";
import {
  createComment,
  getCommentsByBlog,
  updateComment,
  deleteComment,
} from "../controller/commentController.js";
import { isAuthenticated } from "../Middleware/authmiddleware.js";

const commentRoute = express.Router();

commentRoute.post("/blogs/:blogId/comments", isAuthenticated, createComment);

commentRoute.get("/blogs/:blogId/comments", getCommentsByBlog);

commentRoute.put("/comments/:id", isAuthenticated, updateComment);

commentRoute.delete("/comments/:id", isAuthenticated, deleteComment);

export default commentRoute;
