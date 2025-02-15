const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Member = require("../models/Members");
const Profile = require("../models/Profile");

// @route   POST /api/members
// @desc    Create a member profile
// @access  Private (only logged-in users)
router.post("/", protect, async (req, res) => {
  const { description, country, speaks, learns, image } = req.body;

  try {
    const existingMember = await Member.findOne({ user: req.user._id });

    if (existingMember) {
      return res.status(400).json({ message: "Member profile already exists" });
    }

    const newMember = new Member({
      user: req.user._id, // Associate member with the logged-in user
      name: req.user.name, // Get name from User model
      description,
      country,
      speaks,
      learns,
      image,
      status: "offline", // Default status
    });

    await newMember.save();
    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/members
// @desc    Get all members
// @access  Public
router.get("/", async (req, res) => {
  try {
    const members = await Member.find()
      .populate("user", "name email")
      .populate("profile")
      .select("-__v")
      .lean();

    // Add the full profile picture URL for each member
    const membersWithUrls = members.map((member) => ({
      ...member,
      profilePicture: member.profilePicture
        ? `http://localhost:8080${member.profilePicture}`
        : "/default-avatar.png",
    }));

    res.json(membersWithUrls);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/members/search
// @desc    Search members by name, description, or languages
// @access  Public
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    const searchRegex = new RegExp(query, "i");

    const members = await Member.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { "speaks.language": searchRegex },
        { "learns.language": searchRegex },
      ],
    })
      .populate("user", "name email")
      .select("-__v")
      .lean();

    // Add the full profile picture URL for each member
    const membersWithUrls = members.map((member) => ({
      ...member,
      profilePicture: member.profilePicture
        ? `http://localhost:8080${member.profilePicture}`
        : "/default-avatar.png",
    }));

    res.json(membersWithUrls);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/members/nearby
// @desc    Get members by location
// @access  Private
router.get("/nearby", protect, async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 100 } = req.query;

    const members = await Member.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance) * 1000, // Convert km to meters
        },
      },
    })
      .populate("user", "name email")
      .select("-__v");

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/members/:id
// @desc    Get member by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate("user", "name email")
      .select("-__v");

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/members/:id
// @desc    Update member
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Check if the user owns this member profile
    if (member.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate("user", "name email");

    res.json(updatedMember);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/all/member", async (req, res) => {
  try {
    const profiles = await Profile.find().select("-__v").lean();

    const profilesWithUrls = profiles.map((profile) => ({
      ...profile,
      profilePicture: profile.profilePicture
        ? `http://localhost:8080${profile.profilePicture}`
        : "/default-avatar.png",
    }));

    // Send the response
    res.status(200).json(profilesWithUrls);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
