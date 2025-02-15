const express = require("express");
const Profile = require("../models/Profile.js");
const User = require("../models/User.js");
const Member = require("../models/Members.js");
const { protect } = require("../middleware/authMiddleware.js");
const upload = require("../config/multerConfig.js");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// @route   POST /api/profile
// @desc    Create a new profile
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const existingProfile = await Profile.findOne({ userId: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const profile = new Profile({
      userId: req.user._id,
      name: req.user.name,
      tandemID: req.user.tandemID || `user_${req.user._id}`,
      dateOfBirth: req.body.dateOfBirth || null,
      location: req.body.location || "",
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

    const savedProfile = await profile.save();

    // Create a member record if it doesn't exist
    const existingMember = await Member.findOne({ user: req.user._id });
    if (!existingMember) {
      const member = new Member({
        user: req.user._id,
        name: req.user.name,
        description: "",
        speaks: [],
        learns: [],
      });
      await member.save();
    }

    res.status(201).json(savedProfile);
  } catch (error) {
    console.error("Profile creation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    console.log("Fetching profile for user ID:", req.user._id);

    let profile = await Profile.findOne({ userId: req.user._id });

    // If profile doesn't exist, create one
    if (!profile) {
      profile = await new Profile({
        userId: req.user._id,
        name: req.user.name,
        tandemID: req.user.tandemID || `user_${req.user._id}`,
        dateOfBirth: null,
        location: "",
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
      }).save();

      // Create a member record if it doesn't exist
      const existingMember = await Member.findOne({ user: req.user._id });
      if (!existingMember) {
        const member = new Member({
          user: req.user._id,
          name: req.user.name,
          description: "",
          speaks: [],
          learns: [],
        });
        await member.save();
      }
    }

    res.json(profile);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/profile/me
// @desc    Update user profile
// @access  Private
router.put("/me", protect, async (req, res) => {
  try {
    // Update Profile
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { ...req.body },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Update the related Member
    const member = await Member.findOneAndUpdate(
      { user: req.user._id },
      {
        name: req.body.name,
        description: req.body.description,
        speaks: req.body.speaks,
        learns: req.body.learns,
      },
      { new: true }
    );

    // Return updated profile and member data
    res.json({
      profile,
      member: member || null,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/profile/follow/:id
// @desc    Follow a user
// @access  Private
router.post("/follow/:id", protect, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUserProfile = await Profile.findOne({ user: req.user._id });
    if (currentUserProfile.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    currentUserProfile.following.push(userToFollow._id);
    await currentUserProfile.save();
    res.json({ message: "Followed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/profile/unfollow/:id
// @desc    Unfollow a user
// @access  Private
router.post("/unfollow/:id", protect, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUserProfile = await Profile.findOne({ user: req.user._id });
    if (!currentUserProfile.following.includes(userToUnfollow._id)) {
      return res.status(400).json({ message: "Not following this user" });
    }

    currentUserProfile.following.pull(userToUnfollow._id);
    await currentUserProfile.save();
    res.json({ message: "Unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/profile/block/:id
// @desc    Block a user
// @access  Private
router.post("/block/:id", protect, async (req, res) => {
  try {
    const userToBlock = await User.findById(req.params.id);
    if (!userToBlock) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUserProfile = await Profile.findOne({ user: req.user._id });
    if (currentUserProfile.blocked.includes(userToBlock._id)) {
      return res.status(400).json({ message: "Already blocked this user" });
    }

    currentUserProfile.blocked.push(userToBlock._id);
    await currentUserProfile.save();
    res.json({ message: "Blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/profile/unblock/:id
// @desc    Unblock a user
// @access  Private
router.post("/unblock/:id", protect, async (req, res) => {
  try {
    const userToUnblock = await User.findById(req.params.id);
    if (!userToUnblock) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUserProfile = await Profile.findOne({ user: req.user._id });
    if (!currentUserProfile.blocked.includes(userToUnblock._id)) {
      return res.status(400).json({ message: "User not blocked" });
    }

    currentUserProfile.blocked.pull(userToUnblock._id);
    await currentUserProfile.save();
    res.json({ message: "Unblocked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/profile/enable-notifications
// @desc    Enable notifications
// @access  Private
router.post("/enable-notifications", protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    profile.notificationsEnabled = true;
    await profile.save();
    res.json({ message: "Notifications enabled" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/profile/disable-notifications
// @desc    Disable notifications
// @access  Private
router.post("/disable-notifications", protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    profile.notificationsEnabled = false;
    await profile.save();
    res.json({ message: "Notifications disabled" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/profile/upload-picture
// @desc    Upload profile picture
// @access  Private
router.post(
  "/upload-picture",
  protect,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Convert file path to URL path
      const relativePath = path
        .relative(path.join(__dirname, ".."), req.file.path)
        .replace(/\\/g, "/");

      const imageUrl = `/uploads/profilePictures/${path.basename(
        req.file.path
      )}`;

      // Update the profile with the new image URL
      const profile = await Profile.findOneAndUpdate(
        { userId: req.user._id },
        { profilePicture: imageUrl },
        { new: true }
      );

      if (!profile) {
        // If profile not found, delete the uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json({
        message: "Profile picture uploaded successfully",
        imageUrl: imageUrl,
      });
    } catch (error) {
      // If there's an error, try to delete the uploaded file
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting file:", unlinkError);
        }
      }

      console.error("Profile picture upload error:", error);
      res.status(500).json({ message: "Error uploading profile picture" });
    }
  }
);

router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(userId);
    // Fetch the profile by userId
    const profile = await Profile.findOne({ userId: userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Fetch the related member by userId
    const member = await Member.findOne({ user: userId });

    // Return the profile and member data
    res.json({
      profile,
      member: member || null,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
