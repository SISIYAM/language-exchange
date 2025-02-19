// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// Route to get all chats
router.get("/", auth, chatController.getAllChats);

// Route to search users
router.get("/users/search", auth, chatController.searchUsers);

// Route to get chat users
router.get("/users/:userId", auth, chatController.getChatUsers);

// Route to send a message (with file upload support)
router.post("/send", auth, upload.single("file"), chatController.sendMessage);

// Route to start a chat with a partner
router.post("/start", auth, chatController.startChatWithPartner);

// Route to get conversation history
router.get(
  "/conversation/:userId1/:userId2",
  auth,
  chatController.getConversationHistory
);

// Route to get chats by matchId
router.get("/match/:matchId", auth, chatController.getChatsByMatch);

module.exports = router;
