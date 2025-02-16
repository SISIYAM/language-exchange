const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getNews } = require("../controllers/newsController");

// Get news articles
router.get("/", authMiddleware, getNews); //🔒 Protected Route

module.exports = router;
