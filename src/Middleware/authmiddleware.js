import User from "../Model/userSchema.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
  try {
    //gettoken from HTTP -only cookie
    const token = req.cookies?.AUTH_COOKIE;
    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    //verify token
    const decoded = jwt.verify(token, process.env.APP_SECRET);
    //check user still exits

    const user = await User.findById(decoded.id).select("_id role");

    if (!user) {
      return res
        .status(401)
        .json({ error: "Unauthorized", message: "user not found" });
    }

    //Attach user info request
    req.userId = user._id;
    req.userRole = user.role;
    console.log("ROLE:", req.userRole);
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired token",
    });
  }
};
