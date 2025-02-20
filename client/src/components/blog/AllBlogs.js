"use client";
import React, { useEffect, useState } from "react";
import BlogCard from "./BlogCard";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";

const BlogSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10); // Initial limit to load 10 articles at a time
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const router = useRouter();
  const { currentUser } = useSelector((state) => state.user);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!currentUser?._id) return;
      try {
        const response = await axios.get(`${apiUrl}/subscription/status`, {
          withCredentials: true,
        });
        setSubscriptionStatus(response.data.status);
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      }
    };

    fetchSubscriptionStatus();
  }, [currentUser]);

  // Function to fetch articles
  const fetchArticles = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/news?page=${page}&limit=${limit}`
      );
      const data = await response.json();
      if (data.success) {
        // Mark random articles as premium (for demonstration)
        const articlesWithPremium = data.articles.map((article) => ({
          ...article,
          isPremium: Math.random() < 0.3, // 30% chance of being premium
        }));
        setArticles((prevArticles) => [
          ...prevArticles,
          ...articlesWithPremium,
        ]);
        setTotalPages(Math.ceil(data.articles.length / limit));
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setLoading(false);
    }
  };

  // Fetch articles when the component mounts and on subsequent "See More" clicks
  useEffect(() => {
    fetchArticles(currentPage);
  }, [currentPage]);

  // Function to handle the "See More" button click
  const handleSeeMore = () => {
    setCurrentPage(currentPage + 1); // Load the next set of articles
  };

  // Function to handle article click and redirect to the article's URL
  const handleArticleClick = (article) => {
    if (article.isPremium && subscriptionStatus !== "premium") {
      toast.error("This content is only available to premium users");
      // Optional: Redirect to subscription page
      router.push("/subscription");
      return;
    }
    window.open(article.url, "_blank"); // Open the URL in a new tab
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <div
            key={index}
            onClick={() => handleArticleClick(article)}
            className="cursor-pointer relative"
          >
            <BlogCard
              category={article.source} // Use source as category
              title={article.title}
              description={article.description}
              readTime="5 min" // Placeholder for read time
              image={article.image} // Use the image from the API response
              isPremium={article.isPremium}
              isUserPremium={subscriptionStatus === "premium"}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        {loading ? (
          <p>Loading more articles...</p>
        ) : (
          currentPage < totalPages && (
            <button
              onClick={handleSeeMore}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              See More
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default BlogSection;
