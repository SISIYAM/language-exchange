const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const profileRoutes = require("./routes/profileRoutes.js");
const memberRoutes = require("./routes/memberRoutes.js");
const partnerRoutes = require("./routes/partnerRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

dotenv.config();
const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  // Join a chat room
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.userId} joined chat: ${chatId}`);
  });

  // Leave a chat room
  socket.on("leave_chat", (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.userId} left chat: ${chatId}`);
  });

  // Handle new message
  socket.on("send_message", async (data) => {
    try {
      const { chatId, content } = data;

      // Emit the message to all users in the chat room
      io.to(chatId).emit("receive_message", {
        chatId,
        content,
        sender: socket.userId,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // Handle typing status
  socket.on("typing", (data) => {
    const { chatId, isTyping } = data;
    socket.to(chatId).emit("user_typing", {
      userId: socket.userId,
      isTyping,
    });
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });
});

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());

// Serve static files from the uploads directory with proper MIME types
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
        res.setHeader("Content-Type", "image/jpeg");
      } else if (filePath.endsWith(".png")) {
        res.setHeader("Content-Type", "image/png");
      } else if (filePath.endsWith(".gif")) {
        res.setHeader("Content-Type", "image/gif");
      }
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/chat", chatRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
