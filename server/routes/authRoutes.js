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

// @route   POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { name, email, password, country, dob, tandemID } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      const token = generateToken(res, user._id);
      console.log("Creating profile with userId:", user._id);

      // Create profile
      const newProfile = new Profile({
        userId: user._id,
        name: user.name,
        tandemID,
        dateOfBirth: dob,
        location: country,
        description: "",
        speaks: [], // No need for .split(",")
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
        topics: [""],
        showLocation: true,
        showTandemID: true,
        notifications: true,
        profilePicture: null,
      });

      await newProfile.save();
      console.log("Profile created successfully");

      // Create member profile
      const newMember = new Member({
        user: user._id, // Associate member with the created user
        name: user.name, // Get name from User model
        description: newProfile.description,
        country,
        speaks: newProfile.speaks, // Use directly
        learns: newProfile.learns, // Use directly
        image: null,
        status: "offline", // Default status
      });

      await newMember.save(); // Save member AFTER creating it

      res.status(201).json({
        message: "User registered successfully",
        user: {
          name: user.name,
          email: user.email,
          tandemID: newProfile.tandemID,
          dob: newProfile.dateOfBirth,
          country: newProfile.location, // Include country in response
        },
        token,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Signup Error:", error);
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

// @route   POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
