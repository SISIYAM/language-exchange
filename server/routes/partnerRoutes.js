const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { searchPartner } = require("../controllers/partnerController");

// Route to fetch nutritional data
router.get("/search", searchPartner);

module.exports = router;
