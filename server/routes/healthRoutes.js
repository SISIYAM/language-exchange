const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getHealthTip } = require("../controllers/healthController");

// Route to fetch nutritional data
router.get("/daily", authMiddleware, getHealthTip);

module.exports = router;
