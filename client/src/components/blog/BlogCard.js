import React from "react";

// Function to calculate reading time based on word count
const calculateReadTime = (description) => {
  const wordsPerMinute = 200; // Average words per minute reading speed
  const words = description.split(" ").length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes}-min read`;
};

const BlogCard = ({ category, title, description, image, readTime }) => {
  return (
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48">
        <img
          src={image || "/placeholder-image.jpg"}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{category}</span>
          <span className="text-sm text-gray-500">
            {calculateReadTime(description)}
          </span>
        </div>

        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
        <p className="text-gray-600 text-sm line-clamp-3">{description}</p>
      </div>
    </div>
  );
};

export default BlogCard;
