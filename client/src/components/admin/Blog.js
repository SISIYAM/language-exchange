"use client";

import React, { useState } from "react";
import BlogList from "./blog/BlogList";
import BlogForm from "./blog/BlogForm";
import toast from "react-hot-toast";
// import BlogList from './BlogList';
// import BlogForm from './BlogForm';

const Blog = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [isLoader, setLoader] = useState(1)

  // Function to handle blog creation or update
  const handleFormSubmit = async (data) => {
    const method = editingBlog ? "PUT" : "POST";
    const url = editingBlog
      ? `http://localhost:8080/api/blogs/${editingBlog.id}`
      : "http://localhost:8080/api/blogs";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      // Check if the response is successful
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      const responseData = await res.json(); // Parse the response body
      setShowForm(false);
      setEditingBlog(null);

      console.log(responseData); // Log the parsed response

      if (responseData) {
        toast.success(responseData.message || "Operation successful");
      }
      setLoader(isLoader + 1)
      // You can trigger blog list refresh here
    } catch (error) {
      console.error("Error saving blog:", error);
    }
  };

  // Function to delete a blog
  const handleDeleteBlog = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/blogs/${id}`, {
        method: "DELETE",
      });
      // You can trigger blog list refresh here
      setLoader(isLoader + 1)
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Blog List */}
      <BlogList
        onEdit={(blog) => {
          setShowForm(true);
          setEditingBlog(blog);
        }}
        onDelete={handleDeleteBlog}
        isLoader={isLoader}
      />

      {/* Create/Edit Blog Form */}
      {showForm && (
        <div className="mt-8">
          <BlogForm
            defaultValues={editingBlog || {}}
            onSubmit={handleFormSubmit}
          />
        </div>
      )}

      {/* Button to show create blog form */}
      {!showForm && (
        <button
          onClick={() => {
            setShowForm(true);
            setEditingBlog(null); // Reset form to create new blog
          }}
          className="bg-blue-500 text-white px-6 py-2 rounded-md mt-4"
        >
          Create New Blog
        </button>
      )}
    </div>
  );
};

export default Blog;
