"use client"

import React, { useState, useEffect } from 'react';
import ConfirmDialog from './ConfirmDialog';

const BlogList = ({ onEdit, onDelete, isLoader }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });

  const blogsPerPage = 10;

  // Fetch blogs with pagination
  const fetchBlogs = async (page) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/blogs?page=${page}&limit=${blogsPerPage}`);
      const data = await response.json();
      setBlogs(data.blogs);
      console.log(data.blogs)
      setTotalPages(data.totalPages); // Assuming API returns total pages
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  console.log(blogs)

  useEffect(() => {
    const blogs = fetchBlogs(currentPage);
    console.log("blogs", blogs)
  }, [currentPage, isLoader]);

  // Handle pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const openConfirmDialog = (id) => {
    setConfirmDialog({ isOpen: true, id });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">All Blogs</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <div key={blog.id} className="flex justify-between items-center p-4 border rounded-lg shadow-sm">
              <div>
                <h3 className="text-lg font-bold">{blog.title}</h3>
                <p>{blog.short_description}</p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => onEdit(blog)}
                  className="bg-yellow-400 text-white px-4 py-2 rounded-md hover:opacity-75 active:opacity-30"
                >
                  Edit
                </button>
                <button
                  onClick={() => openConfirmDialog(blog.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:opacity-75 active:opacity-30"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Confirm Delete Dialog */}
      {confirmDialog.isOpen && (
        <ConfirmDialog
          title="Delete Blog"
          message="Are you sure you want to delete this blog?"
          onConfirm={() => onDelete(confirmDialog.id)}
          onCancel={() => setConfirmDialog({ isOpen: false, id: null })}
        />
      )}
    </div>
  );
};

export default BlogList;
