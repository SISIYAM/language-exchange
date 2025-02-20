const express = require("express");
const Profile = require("../models/Profile.js");
const User = require("../models/User.js");
const Member = require("../models/Members.js");
const Subscription = require("../models/Subscription.js");
const { protect } = require("../middleware/authMiddleware.js");
const upload = require("../config/multerConfig.js");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

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

router.get("/my/profile", protect, async (req, res) => {
  try {
    console.log("Fetching profile for user ID:", req.user._id);

    let profile = await Profile.findOne({ userId: req.user._id });

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
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Find the user to follow
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the current user's profile
    const currentUserProfile = await Profile.findOne({ userId: req.user._id });
    if (!currentUserProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Find the target user's profile
    const targetUserProfile = await Profile.findOne({ userId: req.params.id });
    if (!targetUserProfile) {
      return res.status(404).json({ message: "Target user profile not found" });
    }

    // Check if already following the user
    if (currentUserProfile.following.includes(req.params.id)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Check if the user is blocked
    if (currentUserProfile.blocked.includes(req.params.id)) {
      return res.status(400).json({ message: "Cannot follow a blocked user" });
    }

    // Add to following list for current user
    currentUserProfile.following.push(req.params.id);
    await currentUserProfile.save();

    // Add to followers list for target user
    targetUserProfile.followers.push(req.user._id);
    await targetUserProfile.save();

    res.json({ message: "Followed successfully" });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/profile/unfollow/:id
// @desc    Unfollow a user
// @access  Private
router.post("/unfollow/:id", protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    // Find the user to unfollow
    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the current user's profile
    const currentUserProfile = await Profile.findOne({ userId: req.user._id });
    if (!currentUserProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Find the target user's profile
    const targetUserProfile = await Profile.findOne({ userId: req.params.id });
    if (!targetUserProfile) {
      return res.status(404).json({ message: "Target user profile not found" });
    }

    // Check if not following the user
    if (!currentUserProfile.following.includes(req.params.id)) {
      return res.status(400).json({ message: "Not following this user" });
    }

    // Remove from following list for current user
    currentUserProfile.following = currentUserProfile.following.filter(
      (id) => id.toString() !== req.params.id
    );
    await currentUserProfile.save();

    // Remove from followers list for target user
    targetUserProfile.followers = targetUserProfile.followers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await targetUserProfile.save();

    res.json({ message: "Unfollowed successfully" });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/profile/blocked
// @desc    Get blocked users
// @access  Private
router.get("/blocked", protect, async (req, res) => {
  try {
    console.log("Fetching blocked users for user:", req.user._id);

    // Find the current user's profile
    const currentUserProfile = await Profile.findOne({ userId: req.user._id });

    if (!currentUserProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (
      !currentUserProfile.blocked ||
      currentUserProfile.blocked.length === 0
    ) {
      return res.json([]);
    }

    // Get the profiles for all blocked users
    const blockedProfiles = await Profile.find({
      userId: { $in: currentUserProfile.blocked },
    });

    // Map the blocked profiles to the required format
    const blockedUsers = blockedProfiles.map((profile) => ({
      userId: profile.userId,
      name: profile.name || "Anonymous User",
      tandemID: profile.tandemID || "unknown",
      profilePicture: profile.profilePicture,
      _id: profile._id,
    }));

    res.json(blockedUsers);
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    res.status(500).json({
      message: "Server error",
      error: error.toString(),
      stack: error.stack,
    });
  }
});

// Update the existing block route
router.post("/block/:id", protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    // Find the user to block
    const userToBlock = await User.findById(req.params.id);
    if (!userToBlock) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the current user's profile
    const currentUserProfile = await Profile.findOne({ userId: req.user._id });
    if (!currentUserProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Find the target user's profile
    const targetUserProfile = await Profile.findOne({ userId: req.params.id });
    if (!targetUserProfile) {
      return res.status(404).json({ message: "Target user profile not found" });
    }

    // Check if already blocked
    if (currentUserProfile.blocked.includes(req.params.id)) {
      return res.status(400).json({ message: "User is already blocked" });
    }

    // Add to blocked list
    currentUserProfile.blocked.push(req.params.id);

    // Remove from following/followers if exists
    currentUserProfile.following = currentUserProfile.following.filter(
      (id) => id.toString() !== req.params.id
    );
    currentUserProfile.followers = currentUserProfile.followers.filter(
      (id) => id.toString() !== req.params.id
    );
    await currentUserProfile.save();

    // Remove from the other user's following/followers lists
    targetUserProfile.following = targetUserProfile.following.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    targetUserProfile.followers = targetUserProfile.followers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await targetUserProfile.save();

    res.json({ message: "User blocked successfully" });
  } catch (error) {
    console.error("Block error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update the existing unblock route
router.post("/unblock/:id", protect, async (req, res) => {
  try {
    // Find the user to unblock
    const userToUnblock = await User.findById(req.params.id);
    if (!userToUnblock) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the current user's profile
    const currentUserProfile = await Profile.findOne({ userId: req.user._id });
    if (!currentUserProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Check if not blocked
    if (!currentUserProfile.blocked.includes(req.params.id)) {
      return res.status(400).json({ message: "User is not blocked" });
    }

    // Remove from blocked list
    currentUserProfile.blocked = currentUserProfile.blocked.filter(
      (id) => id.toString() !== req.params.id
    );
    await currentUserProfile.save();

    res.json({ message: "User unblocked successfully" });
  } catch (error) {
    console.error("Unblock error:", error);
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

// @route   GET /api/profile/followers
// @desc    Get users who follow the current user
// @access  Private
router.get("/followers", protect, async (req, res) => {
  try {
    console.log("Fetching followers for user:", req.user._id);

    // Find the current user's profile
    const currentUserProfile = await Profile.findOne({ userId: req.user._id });

    if (!currentUserProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    console.log(
      "Found profile, followers array:",
      currentUserProfile.followers
    );

    if (
      !currentUserProfile.followers ||
      currentUserProfile.followers.length === 0
    ) {
      return res.json([]);
    }

    // Get the profiles for all followers directly using their ObjectIds
    const followerProfiles = await Profile.find({
      userId: { $in: currentUserProfile.followers },
    });

    console.log("Found follower profiles:", followerProfiles);

    // Map the follower profiles to the required format
    const followers = followerProfiles.map((profile) => ({
      userId: profile.userId,
      name: profile.name || "Anonymous User",
      tandemID: profile.tandemID || "unknown",
      profilePicture: profile.profilePicture,
      _id: profile._id,
    }));

    console.log("Formatted followers:", followers);
    res.json(followers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({
      message: "Server error",
      error: error.toString(),
      stack: error.stack,
    });
  }
});

// @route   GET /api/profile/premium-users
// @desc    Get all premium users
// @access  Private
router.get("/premium-users", protect, async (req, res) => {
  try {
    // Get all premium subscriptions
    const premiumSubscriptions = await Subscription.find({ status: "premium" });

    if (!premiumSubscriptions.length) {
      return res.json([]);
    }

    // Get user IDs from premium subscriptions and convert to ObjectIds
    const premiumUserIds = premiumSubscriptions.map(
      (sub) => new mongoose.Types.ObjectId(sub.userId)
    );
    console.log("Premium User IDs:", premiumUserIds);

    // Get profiles of premium users
    const premiumProfiles = await Profile.find({
      $and: [
        { userId: { $in: premiumUserIds } },
        { userId: { $ne: new mongoose.Types.ObjectId(req.user._id) } },
      ],
    })
      .limit(6)
      .lean();

    console.log("Found premium profiles:", premiumProfiles.length);

    res.json(premiumProfiles);
  } catch (error) {
    console.error("Error fetching premium users:", error);
    res.status(500).json({
      message: "Error fetching premium users",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Move this route AFTER the /premium-users route
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(userId);
    // Fetch the profile by userId
    const profile = await Profile.findOne({ userId: userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Return the profile and member data
    res.json({
      profile,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// fetch all profiles
router.get("/all/members", protect, async (req, res) => {
  try {
    // Get the current user's profile to check blocked users
    const currentUserProfile = await Profile.findOne({ userId: req.user._id });
    const blockedUsers = currentUserProfile ? currentUserProfile.blocked : [];

    // Fetch all profiles except blocked users and the current user
    const profiles = await Profile.find({
      userId: {
        $nin: [...blockedUsers, req.user._id],
      },
    })
      .select("-__v")
      .lean();

    res.status(200).json(profiles);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/profile/upload-photos
// @desc    Upload multiple photos
// @access  Private
router.post(
  "/upload-photos",
  protect,
  upload.array("photos", 5), // Allow up to 5 photos
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Convert file paths to URL paths
      const photoUrls = req.files.map((file) => {
        const relativePath = path
          .relative(path.join(__dirname, ".."), file.path)
          .replace(/\\/g, "/");
        return `/uploads/profilePictures/${path.basename(file.path)}`;
      });

      // Update the profile with the new photo URLs
      const profile = await Profile.findOne({ userId: req.user._id });

      if (!profile) {
        // If profile not found, delete the uploaded files
        req.files.forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (unlinkError) {
            console.error("Error deleting file:", unlinkError);
          }
        });
        return res.status(404).json({ message: "Profile not found" });
      }

      // Add new photos to the existing photos array
      profile.photos = [...profile.photos, ...photoUrls];
      await profile.save();

      res.json({
        message: "Photos uploaded successfully",
        photos: profile.photos,
      });
    } catch (error) {
      // If there's an error, try to delete the uploaded files
      if (req.files) {
        req.files.forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (unlinkError) {
            console.error("Error deleting file:", unlinkError);
          }
        });
      }

      console.error("Photos upload error:", error);
      res.status(500).json({ message: "Error uploading photos" });
    }
  }
);

// @route   DELETE /api/profile/photos/:photoIndex
// @desc    Delete a photo
// @access  Private
router.delete("/photos/:photoIndex", protect, async (req, res) => {
  try {
    const photoIndex = parseInt(req.params.photoIndex);
    const profile = await Profile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (photoIndex < 0 || photoIndex >= profile.photos.length) {
      return res.status(400).json({ message: "Invalid photo index" });
    }

    // Get the photo URL to delete
    const photoUrl = profile.photos[photoIndex];

    // Remove the photo from the array
    profile.photos.splice(photoIndex, 1);
    await profile.save();

    // Delete the actual file
    const filePath = path.join(__dirname, "..", photoUrl);
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.error("Error deleting file:", unlinkError);
    }

    res.json({
      message: "Photo deleted successfully",
      photos: profile.photos,
    });
  } catch (error) {
    console.error("Photo deletion error:", error);
    res.status(500).json({ message: "Error deleting photo" });
  }
});

module.exports = router;
