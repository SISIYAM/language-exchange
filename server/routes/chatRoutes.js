// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware"); // Assuming you have auth middleware to validate JWT

// Route to get all chats
router.get("/", authMiddleware, chatController.getAllChats);

// Route to send a message
router.post("/send", authMiddleware, chatController.sendMessage);

// Route to start a chat with a partner
router.post("/start", authMiddleware, chatController.startChatWithPartner);

// Route to get chats by matchId
router.get("/match/:matchId", authMiddleware, chatController.getChatsByMatch);

module.exports = router;
