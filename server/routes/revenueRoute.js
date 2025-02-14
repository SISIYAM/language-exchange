// routes/revenueRoute.js

const express = require("express");
const {
  updateRevenueContribution,
} = require("../controllers/revenueController");
const router = express.Router();

// Route to update revenue contribution
router.post("/update-revenue", updateRevenueContribution);

module.exports = router;
