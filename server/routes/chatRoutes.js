// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const User = require("../models/User");
const Profile = require("../models/Profile");
const { protect } = require("../middleware/authMiddleware");

// @route   POST /api/chat
// @desc    Create or access a chat
// @access  Private
router.post("/", protect, async (req, res) => {
  const { userId } = req.body;

  try {
    console.log("Chat creation request:", {
      userId,
      currentUser: req.user._id,
    });

    if (!userId) {
      console.log("Missing userId in request");
      return res.status(400).json({ message: "UserId is required" });
    }

    // Verify the user exists
    const user = await User.findById(userId);
    console.log("Target user found:", user ? "Yes" : "No");

    if (!user) {
      console.log("User not found with ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Check if chat exists
    console.log("Checking for existing chat between users");
    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: {
        $all: [req.user._id, userId],
        $size: 2,
      },
    });

    console.log("Existing chat found:", chat ? "Yes" : "No");

    if (chat) {
      // Get profiles for participants
      const participantsWithProfiles = await Promise.all(
        chat.participants.map(async (participantId) => {
          const user = await User.findById(participantId).select("name email");
          const profile = await Profile.findOne({
            userId: participantId,
          }).select("profilePicture");
          return {
            ...user.toObject(),
            profile: profile || null,
          };
        })
      );

      chat = chat.toObject();
      chat.participants = participantsWithProfiles;

      return res.json(chat);
    }

    console.log("Creating new chat");
    // If chat doesn't exist, create new chat
    const newChat = new Chat({
      participants: [req.user._id, userId],
      isGroupChat: false,
    });

    await newChat.save();
    console.log("New chat saved:", newChat._id);

    // Get profiles for participants
    const participantsWithProfiles = await Promise.all(
      newChat.participants.map(async (participantId) => {
        const user = await User.findById(participantId).select("name email");
        const profile = await Profile.findOne({ userId: participantId }).select(
          "profilePicture"
        );
        return {
          ...user.toObject(),
          profile: profile || null,
        };
      })
    );

    const chatObj = newChat.toObject();
    chatObj.participants = participantsWithProfiles;

    res.status(201).json(chatObj);
  } catch (error) {
    console.error("Chat creation error details:", {
      error: error.message,
      stack: error.stack,
      userId: req.body.userId,
      currentUser: req.user._id,
    });
    res.status(500).json({
      message: "Failed to create chat",
      details: error.message,
    });
  }
});

// @route   GET /api/chat
// @desc    Get all chats for a user
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    }).sort({ updatedAt: -1 });

    // Get profiles for all chats
    const populatedChats = await Promise.all(
      chats.map(async (chat) => {
        const chatObj = chat.toObject();

        // Get profiles for participants
        chatObj.participants = await Promise.all(
          chat.participants.map(async (participantId) => {
            const user = await User.findById(participantId).select(
              "name email"
            );
            const profile = await Profile.findOne({
              userId: participantId,
            }).select("profilePicture");
            return {
              ...user.toObject(),
              profile: profile || null,
            };
          })
        );

        return chatObj;
      })
    );

    res.json(populatedChats);
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/chat/:chatId
// @desc    Get chat by ID
// @access  Private
router.get("/:chatId", protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate("participants", "name email profilePicture")
      .populate("messages.sender", "name email profilePicture");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is a participant
    if (
      !chat.participants.some(
        (p) => p._id.toString() === req.user._id.toString()
      )
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/chat/:chatId/message
// @desc    Send a message in a chat
// @access  Private
router.post("/:chatId/message", protect, async (req, res) => {
  const { content } = req.body;

  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is a participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const message = {
      sender: req.user._id,
      content,
      readBy: [req.user._id],
    };

    chat.messages.push(message);
    chat.lastMessage = message;
    await chat.save();

    const populatedChat = await Chat.findById(chat._id)
      .populate("participants", "name email profilePicture")
      .populate("messages.sender", "name email profilePicture")
      .populate("lastMessage.sender", "name email profilePicture");

    res.json(populatedChat);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/chat/group
// @desc    Create a group chat
// @access  Private
router.post("/group", protect, async (req, res) => {
  const { name, participants } = req.body;

  try {
    // Add current user to participants
    const allParticipants = [...participants, req.user._id];

    const groupChat = new Chat({
      groupName: name,
      participants: allParticipants,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    await groupChat.save();
    const populatedChat = await Chat.findById(groupChat._id).populate(
      "participants",
      "name email profilePicture"
    );

    res.status(201).json(populatedChat);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/chat/:chatId/read
// @desc    Mark messages as read
// @access  Private
router.put("/:chatId/read", protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Update readBy for all messages not read by the user
    chat.messages.forEach((message) => {
      if (!message.readBy.includes(req.user._id)) {
        message.readBy.push(req.user._id);
      }
    });

    await chat.save();
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
