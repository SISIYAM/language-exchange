"use client";
import React, { useState, useEffect } from "react";
import BlogCard from "./BlogCard";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { fetchNewsForCategory, fetchAllNews } from "@/services/newsService";

const CATEGORIES = [
  "All",
  "Environment Protection",
  "Green Initiatives",
  "Language and Culture",
  "Healthy Living",
  "Science & Technology",
  "Community Stories",
  "Global Awareness",
];

// Enhanced keywords mapping for better article classification
const CATEGORY_KEYWORDS = {
  "Environment Protection": [
    "environment",
    "climate",
    "pollution",
    "conservation",
    "ecosystem",
    "biodiversity",
    "wildlife",
    "environmental policy",
    "clean air",
    "clean water",
  ],
  "Green Initiatives": [
    "renewable",
    "sustainable",
    "green",
    "eco-friendly",
    "recycling",
    "solar power",
    "wind energy",
    "zero waste",
  ],
  "Language and Culture": [
    "language",
    "culture",
    "linguistics",
    "heritage",
    "traditions",
    "diversity",
    "cultural exchange",
    "multilingual",
  ],
  "Healthy Living": [
    "health",
    "wellness",
    "fitness",
    "nutrition",
    "mental health",
    "exercise",
    "diet",
    "lifestyle",
  ],
  "Science & Technology": [
    "technology",
    "science",
    "innovation",
    "research",
    "digital",
    "AI",
    "robotics",
    "space",
  ],
  "Community Stories": [
    "community",
    "local",
    "neighborhood",
    "social impact",
    "grassroots",
    "volunteering",
    "civic",
  ],
  "Global Awareness": [
    "global",
    "international",
    "world issues",
    "cross-cultural",
    "global citizenship",
    "cultural awareness",
  ],
};

const BlogSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchArticles(1);
  }, [selectedCategory]);

  const fetchArticles = async (page = 1) => {
    try {
      setLoading(true);
      let fetchedArticles;

      if (selectedCategory === "All") {
        fetchedArticles = await fetchAllNews();
      } else {
        fetchedArticles = await fetchNewsForCategory(selectedCategory);
      }

      // Process and set articles
      const processedArticles = combineContent(fetchedArticles);

      if (page === 1) {
        setArticles(processedArticles);
      } else {
        setArticles((prev) => [...prev, ...processedArticles]);
      }

      setHasMore(processedArticles.length > 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  };

  const combineContent = (apiArticles) => {
    return apiArticles.map((article) => ({
      ...article,
      category: article.category || "Uncategorized",
    }));
  };

  const handleSeeMore = () => {
    const nextPage = currentPage + 1;
    fetchArticles(nextPage);
  };

  const handleArticleClick = (article) => {
    router.push(`/blog/${article.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-4 mb-8">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full transition-colors duration-300 ${
              selectedCategory === category
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {loading && articles.length === 0 ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <div
                key={index}
                onClick={() => handleArticleClick(article)}
                className="cursor-pointer"
              >
                <BlogCard
                  category={article.category}
                  title={article.title}
                  description={article.description}
                  image={article.image}
                />
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={handleSeeMore}
                className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors duration-300"
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogSection;
