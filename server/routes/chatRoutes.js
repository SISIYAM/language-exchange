// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const Profile = require("../models/Profile");

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

// route for get profile picture
router.get("/profile-picture/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const profile = await Profile.findOne({ userId });
    if (profile) {
      res.json(profile.profilePicture);
    }
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
