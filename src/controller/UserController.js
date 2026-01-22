import bcrypt from "bcrypt";
import User from "../Model/userSchema.js";
import jwt from "jsonwebtoken";
import { z } from "zod";

//zod Schema

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /(?=.*[A-Za-z])(?=.*\d)/,
      "Password must contain at least 1 letter and 1 number",
    ),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email fromat"),
  password: z.string().min(1, "Password is required"),
});

//JWT
const generateToken = (userId) => {
  if (!process.env.APP_SECRET) {
    throw new Error("JWT secret not defined");
  }

  return jwt.sign({ id: userId }, process.env.APP_SECRET, { expiresIn: "1h" });
};

// Register user
export const registerUser = async (req, res) => {
  try {
    // zod validation
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => issue.message)
        .join(", ");

      return res.status(422).json({
        error: "ValidationError",
        message,
      });
    }

    const { username, email, password } = parsed.data;
    // find if user exsit
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: "Conflict",
        message: "Email already registered",
      });
    }
    //hashpassword
    const hashedPassword = await bcrypt.hash(password, 10);
    //create user
    const user = await User.create({
      username,
      email,
      authentication: { password: hashedPassword },
    });
    //save user with response
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "InternalServerError",
      message: "Failed to register user",
    });
  }
};

//Login

export const loginUser = async (req, res) => {
  try {
    // zod validation
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => issue.message)
        .join(",");

      return res.status(422).json({
        error: "ValidationError",
        message,
      });
    }

    const { email, password } = parsed.data;
    //  find if user exist
    const user = await User.findOne({ email }).select(
      "+authentication.password",
    );
    // user dosen't exist
    if (!user) {
      return res
        .status(401)
        .json({ error: "unauthorized", message: "Invalid email or password" });
    }
    //compare
    const passwordValid = await bcrypt.compare(
      password,
      user.authentication.password,
    );

    if (!passwordValid) {
      return res
        .status(401)
        .json({ error: "unauthorized", message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    //store token in db
    user.authentication.access_token = token;
    await user.save();

    // HTTP-only cookie
    res.cookie("AUTH_COOKIE", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "InternalServerError",
      message: "Login failed",
    });
  }
};

//LOGOUT USER

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("AUTH_COOKIE");

    if (req.userId) {
      await User.findByIdAndUpdate(req.userId, {
        "authentication.access_token": null,
      });
    }

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "InternalServerError",
      message: "Logout failed",
    });
  }
};
