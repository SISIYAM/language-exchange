"use client"
// BlogSection.js
import React, { useEffect, useState } from 'react';
import BlogCard from './BlogCard';

const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10); // Initial limit to load 10 blogs at a time

  // Function to fetch blogs
  const fetchBlogs = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/blogs?page=${page}&limit=${limit}`);
      const data = await response.json();
      setBlogs((prevBlogs) => [...prevBlogs, ...data.blogs]); // Append new blogs to the existing list
      setTotalPages(data.totalPages); // Assuming API returns total pages or similar data
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setLoading(false);
    }
  };

  // Fetch blogs when the component mounts and on subsequent "See More" clicks
  useEffect(() => {
    fetchBlogs(currentPage);
  }, [currentPage]);

  // Function to handle the "See More" button click
  const handleSeeMore = () => {
    setCurrentPage(currentPage + 1); // Load the next set of blogs
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog, index) => (
          <BlogCard
            key={index}
            category={blog.category}
            title={blog.title}
            description={blog.short_description}
            readTime={blog.read_time}
            image={blog.img}
          />
        ))}
      </div>

      <div className="flex justify-center mt-8">
        {loading ? (
          <p>Loading more blogs...</p>
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
