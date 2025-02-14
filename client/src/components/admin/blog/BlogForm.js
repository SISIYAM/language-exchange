
"use client"
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const BlogForm = ({ onSubmit, defaultValues }) => {
  const { handleSubmit, control, formState: { errors } } = useForm({
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <Controller
          name="title"
          control={control}
          rules={{ required: 'Title is required' }}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className={`mt-1 block w-full px-4 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              placeholder="Enter blog title"
            />
          )}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Subtitle</label>
        <Controller
          name="subtitle"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Enter blog subtitle"
            />
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Short Description</label>
        <Controller
          name="short_description"
          control={control}
          rules={{ required: 'Short description is required' }}
          render={({ field }) => (
            <textarea
              {...field}
              className={`mt-1 block w-full px-4 py-2 border ${errors.short_description ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              placeholder="Enter short description"
            />
          )}
        />
        {errors.short_description && <p className="text-red-500 text-sm mt-1">{errors.short_description.message}</p>}
      </div>

      {/* React Quill Editor for Blog Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Content</label>
        <Controller
          name="content"
          control={control}
          rules={{ required: 'Content is required' }}
          render={({ field }) => (
            <ReactQuill
              {...field}
              className="bg-white"
              theme="snow"
              placeholder="Write your blog content here..."
            />
          )}
        />
        {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Author</label>
        <Controller
          name="author"
          control={control}
          rules={{ required: 'Author is required' }}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className={`mt-1 block w-full px-4 py-2 border ${errors.author ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              placeholder="Enter author name"
            />
          )}
        />
        {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Image URL</label>
        <Controller
          name="img"
          control={control}
          rules={{ required: 'Image URL is required' }}
          render={({ field }) => (
            <input
              {...field}
              type="url"
              className={`mt-1 block w-full px-4 py-2 border ${errors.img ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              placeholder="Enter image URL"
            />
          )}
        />
        {errors.img && <p className="text-red-500 text-sm mt-1">{errors.img.message}</p>}
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default BlogForm;
