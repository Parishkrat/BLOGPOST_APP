import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tags: [String],

  createdDate: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Blog", blogPostSchema);
