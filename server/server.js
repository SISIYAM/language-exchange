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
const newsRoutes = require("./routes/newsRoutes.js");
const subscriptionRoutes = require("./routes/subscription");
const chatRoutes = require("./routes/chatRoutes");
const http = require("http");
const { Server } = require("socket.io");
const { scheduleEmails } = require("./services/emailService");

dotenv.config();
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  path: "/socket.io/",
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Store online users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle user joining
  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("User added to online users:", userId, "Socket ID:", socket.id);
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
  });

  // Handle new message
  socket.on("sendMessage", (data) => {
    console.log("Message received:", data);
    try {
      const receiverSocketId = onlineUsers.get(data.receiverId);
      const messageData = {
        ...data,
        timestamp: new Date().toISOString(),
      };

      // Send to receiver if they're online
      if (receiverSocketId) {
        console.log("Sending message to receiver:", receiverSocketId);
        io.to(receiverSocketId).emit("receiveMessage", messageData);
      }

      // Send confirmation back to sender
      socket.emit("messageSent", messageData);
    } catch (error) {
      console.error("Error broadcasting message:", error);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Find and remove the disconnected user
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log("Removed user from online users:", userId);
        io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
        io.emit("userOffline", userId);
        break;
      }
    }
  });
});

// Stripe webhook endpoint needs raw body
app.post(
  "/api/subscription/webhook",
  express.raw({ type: "application/json" })
);

// Regular middleware for other routes
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["set-cookie"],
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
app.use("/api/news", newsRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/chat", chatRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    // Start the email service
    scheduleEmails();
    console.log("Email service started");

    // Start the server
    const PORT = process.env.PORT;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log(err));
