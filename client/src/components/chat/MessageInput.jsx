"use client";
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewMessage } from '@/features/user/chatSlice';
import { FiImage, FiMic, FiSmile, FiSend } from 'react-icons/fi';
import { FiX } from 'react-icons/fi';
import { FaStackExchange } from 'react-icons/fa';

const Modal = ({ closeModal }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 relative w-1/3">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={closeModal}
        >
          <FiX className="text-2xl" />
        </button>
        <h2 className="text-xl font-bold mb-4">Change Conversation Aid Language</h2>
        <ul className="space-y-3">
          <li>
            <input type="radio" id="chinese" name="language" value="chinese" />
            <label htmlFor="chinese" className="ml-2">Chinese (Traditional)</label>
          </li>
          <li>
            <input type="radio" id="french" name="language" value="french" />
            <label htmlFor="french" className="ml-2">French (Français)</label>
          </li>
          <li>
            <input type="radio" id="english" name="language" value="english" />
            <label htmlFor="english" className="ml-2">English (English)</label>
          </li>
        </ul>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
          Save
        </button>
      </div>
    </div>
  );
};



const MessageInput = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const [message, setMessage] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && selectedUser) {
      const messageData = {
        senderId: currentUser.id,
        receiverId: selectedUser.id,
        message: message,
        timestamp: new Date().toISOString(), // Format timestamp
      };
      dispatch(createNewMessage(messageData));
      setMessage(''); // Clear input
    }
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className='flex items-center w-full p-3 bg-white rounded-lg'>
        {/* Emoji Icon */}
        <FiSmile className="text-2xl mx-2 cursor-pointer text-gray-500" title="Insert Emoji" />
        {/* Image Upload Icon */}
        <label htmlFor="image-upload">
          <FiImage className="text-2xl mx-2 cursor-pointer text-gray-500" title="Upload Image" />
        </label>
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            // Handle image upload (can dispatch an action to send the image)
          }}
        />
        {/* Voice Icon */}
        <FiMic className="text-2xl mx-2 cursor-pointer text-gray-500" title="Send Voice Message" />

        {/* Text Input */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow px-4 py-2 bg-gray-100 rounded-full outline-none"
        />

        {/* Send Button */}
        <button type="submit" className="ml-2 p-2 text-blue-500">
          <FiSend className="text-2xl" />
        </button>

        {/* Change Conversation Button */}
        <button
          type="button"
          className="ml-4 p-2 bg-primary rounded-full text-white"
          onClick={openModal}
        >
          <FaStackExchange size={20} className=''/>

        </button>
      </form>

      {/* Modal for Changing Conversation */}
      {isModalOpen && <Modal closeModal={closeModal} />}
    </>
  );
};

export default MessageInput;
