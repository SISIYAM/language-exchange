"use client";
import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNewMessage } from "@/features/user/chatSlice";
import {
  FiImage,
  FiMic,
  FiSmile,
  FiSend,
  FiX,
  FiPaperclip,
} from "react-icons/fi";
import { FaStackExchange } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { toast } from "react-hot-toast";

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
        <h2 className="text-xl font-bold mb-4">
          Change Conversation Aid Language
        </h2>
        <ul className="space-y-3">
          <li>
            <input type="radio" id="chinese" name="language" value="chinese" />
            <label htmlFor="chinese" className="ml-2">
              Chinese (Traditional)
            </label>
          </li>
          <li>
            <input type="radio" id="french" name="language" value="french" />
            <label htmlFor="french" className="ml-2">
              French (Français)
            </label>
          </li>
          <li>
            <input type="radio" id="english" name="language" value="english" />
            <label htmlFor="english" className="ml-2">
              English (English)
            </label>
          </li>
        </ul>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
          Save
        </button>
      </div>
    </div>
  );
};

const MessageInput = ({ scrollToBottom }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  const dispatch = useDispatch();
  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const currentUser = useSelector((state) => state.user.currentUser);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || !selectedUser || !currentUser)
      return;

    try {
      const formData = new FormData();
      if (message.trim()) {
        formData.append("content", message.trim());
      }
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      formData.append("receiverId", selectedUser._id);
      formData.append("senderId", currentUser._id);
      formData.append(
        "participants",
        JSON.stringify([currentUser._id, selectedUser._id])
      );

      await dispatch(createNewMessage(formData)).unwrap();
      setMessage("");
      setSelectedFile(null);
      setFilePreview(null);
      if (scrollToBottom) {
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("File size should be less than 5MB");
        return;
      }
      setSelectedFile(file);

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onEmojiClick = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div className="relative border-t bg-white p-4">
        {/* File Preview */}
        {selectedFile && (
          <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <FiPaperclip className="w-5 h-5" />
              )}
              <span className="ml-2 text-sm truncate">{selectedFile.name}</span>
            </div>
            <button
              onClick={removeSelectedFile}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center space-x-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FiSmile className="w-6 h-6" />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 z-50">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>

          {/* File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FiPaperclip className="w-6 h-6" />
          </button>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-full focus:outline-none focus:border-blue-500"
            onFocus={() => setShowEmojiPicker(false)}
          />

          <button
            type="submit"
            disabled={!message.trim() && !selectedFile}
            className={`p-2 rounded-full ${
              message.trim() || selectedFile
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <IoSend className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Change Conversation Button */}
      <button
        type="button"
        className="ml-4 p-2 bg-primary rounded-full text-white"
        onClick={openModal}
      >
        <FaStackExchange size={20} className="" />
      </button>

      {/* Modal for Changing Conversation */}
      {isModalOpen && <Modal closeModal={closeModal} />}
    </>
  );
};

export default MessageInput;
