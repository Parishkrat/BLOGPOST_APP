import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controller/UserController.js";

const UserRoute = express.Router();

UserRoute.post("/register", registerUser);
UserRoute.post("/login", loginUser);
UserRoute.post("/logout", logoutUser);

export default UserRoute;
