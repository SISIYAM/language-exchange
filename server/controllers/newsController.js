const axios = require("axios");
const User = require("../models/User"); // Import User Model

// Fetch News from NewsAPI
const fetchNewsFromNewsAPI = async (req, res) => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?language=en&apiKey=${process.env.NEWS_API_KEY}`
    );

    const articles = response.data.articles.map((article) => ({
      title: article.title || "No Title",
      description: article.description || "No Description",
      url: article.url || "#",
      source: article.source?.name || "Unknown",
    }));

    res.json({ success: true, articles });
  } catch (error) {
    console.error("NewsAPI Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch news" });
  }
};

// ✅ Correct Export Syntax
module.exports = { fetchNewsFromNewsAPI };
