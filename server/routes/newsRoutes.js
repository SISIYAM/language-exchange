const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { fetchNewsFromNewsAPI } = require("../controllers/newsController");

// Route to fetch nutritional data
router.get("/", fetchNewsFromNewsAPI);

module.exports = router;
