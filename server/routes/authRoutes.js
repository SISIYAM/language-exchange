const express = require("express");
const User = require("../models/User.js");
const Member = require("../models/Members.js");
const Profile = require("../models/Profile.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { protect } = require("../middleware/authMiddleware.js");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

// Generate JWT Token
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, dateOfBirth, location, tandemID } = req.body;
    console.log(req.body);
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if tandemID is already taken
    const tandemIDExists = await Profile.findOne({ tandemID });
    if (tandemIDExists) {
      return res.status(400).json({ message: "Tandem ID is already taken" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      dateOfBirth,
      location,
    });

    // Create profile for the user
    const profile = await Profile.create({
      userId: user._id,
      name: user.name,
      tandemID: tandemID, // Use the user-provided tandemID
      dateOfBirth: dateOfBirth,
      location: location,
      description: "",
      speaks: [],
      learns: [],
      about: "",
      partnerPreference: "",
      learningGoals: "",
      nativeLanguage: "",
      fluentLanguage: "",
      learningLanguage: "",
      translateLanguage: "",
      communication: "Not set",
      timeCommitment: "Not set",
      learningSchedule: "Not set",
      correctionPreference: "Not set",
      topics: ["Life"],
      showLocation: true,
      showTandemID: true,
      notifications: true,
      profilePicture: "",
    });

    // Generate JWT token
    const token = generateToken(res, user._id);

    // Send response with token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      location: user.location,
      tandemID: profile.tandemID, // Include tandemID in response
      token, // Token is sent in the response
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(res, user._id);
      res.json({ user, token });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/auth/verify/me
router.get("/verify/me", protect, async (req, res) => {
  res.json(req.user);
});

// Verify login status
router.get("/verify/login", protect, async (req, res) => {
  try {
    // If the protect middleware passes, the user is authenticated
    res.status(200).json({
      success: true,
      user: req.user, // User data from the protect middleware
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out successfully" });
});

// @route   DELETE /api/auth/delete-account
// @desc    Delete user account and all associated data
// @access  Private
router.delete("/delete-account", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete user's profile
    await Profile.findOneAndDelete({ userId: userId });

    // Delete user's member data
    await Member.findOneAndDelete({ user: userId });

    // Delete user's chat data (assuming you have a Chat model)
    // await Chat.deleteMany({ $or: [{ sender: userId }] });

    // Delete user's subscription data (assuming you have a Subscription model)
    // await Subscription.findOneAndDelete({ userId: userId });

    // Finally, delete the user
    await User.findByIdAndDelete(userId);

    // Clear the authentication cookie
    res.cookie("token", "", { httpOnly: true, expires: new Date(0) });

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).json({ message: "Failed to delete account" });
  }
});

module.exports = router;
