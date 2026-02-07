import { Server } from "socket.io";

let io;

export const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a specific blog room
    socket.on("joinBlog", (blogId) => {
      socket.join(`blog-${blogId}`);
      console.log(`User ${socket.id} joined blog-${blogId}`);
    });

    // Leave a blog room
    socket.on("leaveBlog", (blogId) => {
      socket.leave(`blog-${blogId}`);
      console.log(`User ${socket.id} left blog-${blogId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

// Helper functions to emit events
export const emitNewComment = (blogId, comment) => {
  if (io) {
    io.to(`blog-${blogId}`).emit("newComment", comment);
  }
};

export const emitCommentUpdate = (blogId, comment) => {
  if (io) {
    io.to(`blog-${blogId}`).emit("commentUpdated", comment);
  }
};

export const emitCommentDelete = (blogId, commentId) => {
  if (io) {
    io.to(`blog-${blogId}`).emit("commentDeleted", { commentId });
  }
};
