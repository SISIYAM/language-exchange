const { default: axios } = require("axios");

async function getNewsByCategory(category = 'general', page = 1, limit = 10) {
    const API_KEY = 'ee4qUuLaI66yr4dYKT-axMNMBdpPJNW7XPTw6zOPd9MancQ0'; // Replace with your actual Currents API key
    const API_URL = 'https://api.currentsapi.services/v1/latest-news';

    try {
        const response = await axios.get(API_URL, {
            params: {
                apiKey: API_KEY,
                category: category,
                language: 'en', // You can specify language if needed
                page: page,
                limit: limit
            },
        });

        // Log all articles to inspect data structure
        console.log('All articles:', response.data.news);

        // Filter articles to include those with both description and image URL
        const articles = response.data.news.filter(article => 
            article.description && article.image
        );

        // Log filtered articles for further inspection
        console.log('Filtered articles with description and image:', articles);

        return articles || [];
    } catch (error) {
        console.error('Error fetching news:', error.message);
        return [];
    }
}

// Call the function with pagination parameters
getNewsByCategory('environment', 1, 50);
