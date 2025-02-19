"use client";
import React, { useEffect, useState } from "react";
import BlogCard from "./BlogCard";

const BlogSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10); // Initial limit to load 10 articles at a time

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Function to fetch articles
  const fetchArticles = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/news?page=${page}&limit=${limit}`
      );
      const data = await response.json();
      if (data.success) {
        setArticles((prevArticles) => [...prevArticles, ...data.articles]); // Append new articles to the existing list
        setTotalPages(Math.ceil(data.articles.length / limit)); // Calculate total pages
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
  const handleArticleClick = (url) => {
    window.open(url, "_blank"); // Open the URL in a new tab
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <div
            key={index}
            onClick={() => handleArticleClick(article.url)} // Redirect to the article's URL
            className="cursor-pointer" // Add cursor pointer to indicate clickability
          >
            <BlogCard
              category={article.source} // Use source as category
              title={article.title}
              description={article.description}
              readTime="5 min" // Placeholder for read time
              image={article.image} // Use the image from the API response
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
