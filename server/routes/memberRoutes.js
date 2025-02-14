const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Member = require("../models/Members");

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

// Get all members
router.get("/", async (req, res) => {
  try {
    const { search, country, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (country) query.country = country;
    if (status) query.status = status;

    const members = await Member.find(query);
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single member
router.get("/:id", async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
