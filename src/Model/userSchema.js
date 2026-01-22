import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
  },
  authentication: {
    password: {
      type: String,
      required: true,
      select: false, // IMPORTANT: hide password by default,
    },

    access_token: {
      type: String,
      select: false,
    },
  },
  role: {
    type: String,
    enum: ["admin", "creator"],
    default: "creator",
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("User", UserSchema);
