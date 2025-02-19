const axios = require("axios");

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
      image: article.urlToImage || "https://via.placeholder.com/300",
    }));

    res.json({ success: true, articles });
  } catch (error) {
    console.error("NewsAPI Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch news" });
  }
};

module.exports = { fetchNewsFromNewsAPI };
