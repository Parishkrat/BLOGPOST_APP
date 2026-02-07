import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import blogRoute from "./Router/blogpostRoute.js";
import UserRoute from "./Router/UserRoute.js";
import cookieParser from "cookie-parser";
import commentRoute from "./Router/commentRoute.js";
import { createServer } from "http";
import { initializeWebSocket } from "./websocket.js";

const app = express();
const httpServer = createServer(app);

dotenv.config();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const Port = process.env.PORT || 8000;
const Mongo_db = process.env.MONGODB_URL;

mongoose
  .connect(Mongo_db)
  .then(() => {
    //Initialize webSocket
    initializeWebSocket(httpServer);

    httpServer.listen(Port, () => {
      console.log(`Port is running from server ${Port}`);
      console.log(`WebSocket server is ready`);
    });

    console.log("MOngodb is connected");
  })
  .catch((error) => {
    console.log(error);
  });

app.use("/api", blogRoute);
app.use("/api", UserRoute);
app.use("/api", commentRoute);
