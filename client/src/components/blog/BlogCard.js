import React from "react";
import { FaCrown } from "react-icons/fa";

// Function to calculate reading time based on word count
const calculateReadTime = (description) => {
  const wordsPerMinute = 200; // Average words per minute reading speed
  const words = description.split(" ").length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes}-min read`;
};

const BlogCard = ({
  category,
  title,
  description,
  image,
  readTime,
  isPremium,
  isUserPremium,
}) => {
  return (
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-2 right-2 z-10 bg-yellow-400 text-black px-2 py-1 rounded-full flex items-center gap-1">
          <FaCrown className="text-sm" />
          <span className="text-xs font-semibold">Premium</span>
        </div>
      )}

      {/* Premium Overlay for non-premium users */}
      {isPremium && !isUserPremium && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-20 p-4">
          <FaCrown className="text-yellow-400 text-4xl mb-2" />
          <p className="text-white text-center font-semibold mb-1">
            Premium Content
          </p>
          <p className="text-white text-center text-sm">
            Subscribe to access this article
          </p>
        </div>
      )}

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
