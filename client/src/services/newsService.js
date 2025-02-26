import axios from "axios";

// API Keys
const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
const GUARDIAN_API_KEY = process.env.NEXT_PUBLIC_GUARDIAN_API_KEY;
const MEDIASTACK_API_KEY = process.env.NEXT_PUBLIC_MEDIASTACK_API_KEY;
const NUTRITIONIX_APP_ID = process.env.NEXT_PUBLIC_NUTRITIONIX_APP_ID;
const NUTRITIONIX_API_KEY = process.env.NEXT_PUBLIC_NUTRITIONIX_API_KEY;

// Base URLs for different news APIs
const NEWS_API_URL = "https://newsapi.org/v2";
const GUARDIAN_API_URL = "https://content.guardianapis.com";
const MEDIASTACK_API_URL = "http://api.mediastack.com/v1";
const NUTRITIONIX_API_URL = "https://trackapi.nutritionix.com/v2";

// Health and wellness topics for Nutritionix
const HEALTH_TOPICS = [
  {
    query: "healthy breakfast ideas",
    title: "Healthy Breakfast Ideas for a Nutritious Start",
    category: "Meal Planning",
  },
  {
    query: "post workout nutrition",
    title: "Post-Workout Nutrition Guide",
    category: "Fitness Nutrition",
  },
  {
    query: "protein rich foods vegetarian",
    title: "Plant-Based Protein Sources",
    category: "Vegetarian Nutrition",
  },
  {
    query: "weight loss foods",
    title: "Nutritious Foods for Weight Management",
    category: "Weight Management",
  },
  {
    query: "energy boosting snacks",
    title: "Healthy Snacks for Energy",
    category: "Snack Ideas",
  },
  {
    query: "anti inflammatory foods",
    title: "Anti-Inflammatory Foods Guide",
    category: "Wellness",
  },
  {
    query: "meal prep healthy",
    title: "Healthy Meal Prep Guide",
    category: "Meal Planning",
  },
  {
    query: "superfoods list",
    title: "Essential Superfoods for Optimal Health",
    category: "Nutrition Basics",
  },
];

// Fetch nutrition and health content from Nutritionix
const fetchNutritionContent = async () => {
  try {
    // Fetch nutrition information for various health topics
    const nutritionArticles = await Promise.all(
      HEALTH_TOPICS.map(async (topic) => {
        try {
          const response = await axios.post(
            `${NUTRITIONIX_API_URL}/natural/nutrients`,
            {
              query: topic.query,
            },
            {
              headers: {
                "x-app-id": NUTRITIONIX_APP_ID,
                "x-app-key": NUTRITIONIX_API_KEY,
                "Content-Type": "application/json",
              },
            }
          );

          // Generate article content from nutrition data
          const foods = response.data.foods;
          let description = "Discover the nutritional benefits of ";
          description += foods.map((food) => food.food_name).join(", ") + ". ";
          description +=
            "Learn about calories, proteins, and essential nutrients for a healthier lifestyle.";

          // Create an article-like structure
          return {
            title: topic.title,
            description: description,
            image:
              foods[0]?.photo?.thumb ||
              "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
            url: "#",
            source: "Nutritionix Health Tips",
            category: "Healthy Living",
            publishedAt: new Date().toISOString(),
            nutritionInfo: foods.map((food) => ({
              name: food.food_name,
              calories: food.nf_calories,
              protein: food.nf_protein,
              carbs: food.nf_total_carbohydrate,
              fats: food.nf_total_fat,
            })),
          };
        } catch (error) {
          console.error(
            `Error fetching nutrition data for ${topic.query}:`,
            error
          );
          return null;
        }
      })
    );

    // Filter out any failed requests
    return nutritionArticles.filter((article) => article !== null);
  } catch (error) {
    console.error("Error fetching nutrition content:", error);
    return [];
  }
};

// Category-specific query parameters for each API
const CATEGORY_QUERIES = {
  "Environment Protection": {
    newsApi: "environment OR climate OR conservation",
    guardian: "environment/climate-change OR environment/conservation",
    mediastack: "environment,climate,conservation,wildlife",
    sections: "environment",
    keywords: [
      "environment",
      "climate",
      "conservation",
      "ecosystem",
      "wildlife",
    ],
  },
  "Green Initiatives": {
    newsApi: "renewable energy OR sustainable OR green technology",
    guardian: "environment/renewable-energy OR environment/green-living",
    mediastack: "renewable,sustainable,green-technology,eco-friendly",
    sections: "environment",
    keywords: ["renewable", "sustainable", "green", "eco-friendly"],
  },
  "Language and Culture": {
    newsApi: "language OR culture OR linguistics",
    guardian: "culture OR education/languages",
    mediastack: "language,culture,linguistics,heritage",
    sections: "culture",
    keywords: ["language", "culture", "linguistics", "heritage"],
  },
  "Healthy Living": {
    newsApi: "health OR wellness OR fitness",
    guardian: "lifeandstyle/health-and-wellbeing",
    mediastack: "health,wellness,fitness,nutrition",
    sections: "lifestyle",
    keywords: ["health", "wellness", "fitness", "nutrition"],
  },
  "Science & Technology": {
    newsApi: "technology OR science OR innovation",
    guardian: "technology OR science",
    mediastack: "technology,science,innovation,ai",
    sections: "technology",
    keywords: ["technology", "science", "innovation", "ai"],
  },
  "Community Stories": {
    newsApi: "community OR local news OR social impact",
    guardian: "society OR community",
    mediastack: "community,local,social-impact",
    sections: "society",
    keywords: ["community", "local", "social impact"],
  },
  "Global Awareness": {
    newsApi: "global issues OR climate change OR social justice",
    guardian: "world OR global-development",
    mediastack: "global-issues,climate-change,social-justice",
    sections: "world",
    keywords: ["global", "international", "world", "social justice"],
  },
};

// Fetch from MediaStack API
const fetchFromMediaStack = async (category) => {
  try {
    const keywords = CATEGORY_QUERIES[category]?.mediastack || category;
    const response = await axios.get(`${MEDIASTACK_API_URL}/news`, {
      params: {
        access_key: MEDIASTACK_API_KEY,
        keywords: keywords,
        languages: "en",
        limit: 10,
        sort: "published_desc",
      },
    });

    return response.data.data.map((article) => ({
      title: article.title,
      description: article.description,
      image: article.image,
      url: article.url,
      source: article.source,
      category: category,
      publishedAt: article.published_at,
    }));
  } catch (error) {
    console.error("Error fetching from MediaStack API:", error);
    return [];
  }
};

// Enhanced article categorization
const categorizeSingleArticle = (article, defaultCategory) => {
  const content = `${article.title} ${article.description}`.toLowerCase();

  for (const [category, queryData] of Object.entries(CATEGORY_QUERIES)) {
    if (
      queryData.keywords.some((keyword) =>
        content.includes(keyword.toLowerCase())
      )
    ) {
      return category;
    }
  }
  return defaultCategory;
};

// Fetch from News API
const fetchFromNewsApi = async (category) => {
  try {
    const query = CATEGORY_QUERIES[category]?.newsApi || category;
    const response = await axios.get(`${NEWS_API_URL}/everything`, {
      params: {
        q: query,
        apiKey: NEWS_API_KEY,
        language: "en",
        sortBy: "publishedAt",
        pageSize: 10,
      },
    });

    return response.data.articles.map((article) => ({
      title: article.title,
      description: article.description,
      image: article.urlToImage,
      url: article.url,
      source: article.source.name,
      category: categorizeSingleArticle(article, category),
      publishedAt: article.publishedAt,
    }));
  } catch (error) {
    console.error("Error fetching from News API:", error);
    return [];
  }
};

// Fetch from Guardian API
const fetchFromGuardian = async (category) => {
  try {
    const section = CATEGORY_QUERIES[category]?.sections;
    const response = await axios.get(`${GUARDIAN_API_URL}/search`, {
      params: {
        q: CATEGORY_QUERIES[category]?.guardian || category,
        "api-key": GUARDIAN_API_KEY,
        section: section,
        "show-fields": "headline,thumbnail,bodyText,shortUrl",
        "page-size": 10,
      },
    });

    return response.data.response.results.map((article) => ({
      title: article.webTitle,
      description: article.fields.bodyText?.substring(0, 200) + "...",
      image: article.fields.thumbnail,
      url: article.fields.shortUrl,
      source: "The Guardian",
      category: categorizeSingleArticle(
        { title: article.webTitle, description: article.fields.bodyText },
        category
      ),
      publishedAt: article.webPublicationDate,
    }));
  } catch (error) {
    console.error("Error fetching from Guardian API:", error);
    return [];
  }
};

// Main function to fetch news from all sources
export const fetchNewsForCategory = async (category) => {
  try {
    let articles = [];

    // Fetch from different sources based on category
    if (category === "Healthy Living") {
      const nutritionArticles = await fetchNutritionContent();
      articles = [...articles, ...nutritionArticles];
    }

    const [newsApiArticles, guardianArticles, mediaStackArticles] =
      await Promise.all([
        fetchFromNewsApi(category),
        fetchFromGuardian(category),
        fetchFromMediaStack(category),
      ]);

    articles = [
      ...articles,
      ...newsApiArticles,
      ...guardianArticles,
      ...mediaStackArticles,
    ];

    // Remove duplicates based on title and URL
    const uniqueArticles = Array.from(
      new Map(articles.map((item) => [item.title + item.url, item])).values()
    );

    // Sort by date
    return uniqueArticles.sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
    );
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};

// Fetch news for all categories
export const fetchAllNews = async () => {
  try {
    const allArticles = await Promise.all(
      Object.keys(CATEGORY_QUERIES).map((category) =>
        fetchNewsForCategory(category)
      )
    );

    return allArticles.flat();
  } catch (error) {
    console.error("Error fetching all news:", error);
    return [];
  }
};
