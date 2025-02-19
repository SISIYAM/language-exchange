"use client";
import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchConversationHistory } from "@/features/user/chatSlice";
import MessageInput from "./MessageInput";
import { FiPaperclip } from "react-icons/fi";

const defaultAvatar =
  "https://imgs.search.brave.com/m12gFeEaYTH9TW9JHo1E4K4UFZBIAGpFdv-O_jdbty0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzgzLzk2/LzM2MF9GXzM0Njgz/OTY4M182bkFQemJo/cFNrSXBiOHBtQXd1/ZmtDN2M1ZUQ3d1l3/cy5qcGc";

const MessageContent = ({ message }) => {
  const isImage = message.fileUrl?.match(/\.(jpg|jpeg|png|gif)$/i);
  const isDocument = message.fileUrl && !isImage;

  return (
    <>
      {message.content && <p className="mb-1">{message.content}</p>}

      {isImage && (
        <div className="mb-1">
          <img
            src={`http://localhost:8080${message.fileUrl}`}
            alt="Attached image"
            className="max-w-[200px] rounded-lg"
          />
        </div>
      )}

      {isDocument && (
        <div className="mb-1">
          <a
            href={`http://localhost:8080${message.fileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-blue-500 hover:text-blue-600"
          >
            <FiPaperclip className="mr-1" />
            {message.fileName || "Attached file"}
          </a>
        </div>
      )}
    </>
  );
};

const ChatWindow = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { selectedUser, conversation, status } = useSelector(
    (state) => state.chat
  );
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      messagesContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  useEffect(() => {
    if (currentUser?._id && selectedUser?._id) {
      dispatch(
        fetchConversationHistory({
          userId1: currentUser._id,
          userId2: selectedUser._id,
        })
      );
    }
  }, [selectedUser?._id, currentUser?._id, dispatch]);

  const getProfilePicture = (user) => {
    if (!user?.profilePicture) return defaultAvatar;
    return `http://localhost:8080${user.profilePicture}`;
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return "";
      }
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "";
    }
  };

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Please log in to view messages</p>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center space-x-4 bg-white">
        <div className="relative w-12 h-12">
          <img
            src={getProfilePicture(selectedUser)}
            alt={selectedUser.name}
            className="rounded-full w-full h-full object-cover"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{selectedUser.name}</h3>
          <p className="text-sm text-gray-500">Online</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-smooth"
      >
        {status === "loading" ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : conversation?.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          conversation.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.senderId === currentUser._id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId === currentUser._id
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                <MessageContent message={message} />
                {message.timestamp && (
                  <span className="text-xs opacity-70">
                    {formatTimestamp(message.timestamp)}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <MessageInput scrollToBottom={scrollToBottom} />
    </div>
  );
};

export default ChatWindow;
