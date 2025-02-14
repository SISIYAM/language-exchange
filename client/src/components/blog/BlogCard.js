
import React from 'react';

// Function to calculate reading time based on word count
const calculateReadTime = (description) => {
  const wordsPerMinute = 200; // Average words per minute reading speed
  const words = description.split(' ').length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes}-min read`;
};

const BlogCard = ({ category, title, description, image }) => {
  const readTime = calculateReadTime(description); // Calculate reading time

  return (
    <div className="max-w-sm overflow-hidden flex flex-col">
      <img className="w-full h-48 object-cover rounded-lg" src={image} alt={title} />
      <div className=" py-4 flex-grow">
        <p className="text-base text-teal-500 font-semibold">{category}</p>
        <div className="font-medium text-[22px] mb-2 hover:text-[#074c77] cursor-pointer hover:underline">
          {title}
        </div>
        <p className="text-gray-700 text-lg font-light">
          {description}
        </p>
      </div>
      <div className=" pt-4 pb-2">
        <span className="inline-block bg-gray-50 rounded-full px-3 py-1 text-sm font-medium text-gray-500">
          {readTime}
        </span>
      </div>
    </div>
  );
};

export default BlogCard;
