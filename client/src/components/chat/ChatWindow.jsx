"use client";
import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchConversationHistory,
  createNewMessage,
} from "@/features/user/chatSlice"; // Import sendMessage action
import MessageInput from "./MessageInput";
import { FaPhone, FaVideo } from "react-icons/fa";

const defaultAvatar =
  "https://imgs.search.brave.com/m12gFeEaYTH9TW9JHo1E4K4UFZBIAGpFdv-O_jdbty0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzgzLzk2/LzM2MF9GXzM0Njgz/OTY4M182bkFQemJo/cFNrSXBiOHBtQXd1/ZmtDN2M1ZUQ3d1l3/cy5qcGc";

const ChatWindow = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { currentUser } = useSelector((state) => state.user);
  const { selectedUser, conversation } = useSelector((state) => state.chat);
  const messagesContainerRef = useRef(null);

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

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const getProfilePicture = (user) => {
    return user?.profilePicture
      ? `http://localhost:8080${user.profilePicture}`
      : defaultAvatar;
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return !isNaN(date.getTime())
        ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "";
    }
  };

  // Generate and send a call link
  const startCall = (isVideo) => {
    if (!currentUser || !selectedUser) return;

    const roomID = [currentUser._id, selectedUser._id].sort().join("-");
    const userID = currentUser._id.toString();
    const userName = encodeURIComponent(currentUser.name);
    const callLink = `http://localhost:3000/call?roomID=${roomID}&userID=${userID}&userName=${userName}&isVideoCall=${isVideo}`;

    // Send call link to the conversation
    dispatch(
      createNewMessage({
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        content: `📞 [Join Call](${callLink})`,
        type: "call",
        timestamp: new Date().toISOString(),
      })
    );

    // Redirect to the call page
    router.push(callLink);
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
      <div className="p-4 border-b flex items-center justify-between bg-white">
        <div className="flex items-center space-x-4">
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
        <div className="flex space-x-4">
          <button
            onClick={() => startCall(false)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FaPhone className="w-5 h-5 text-blue-500" />
          </button>
          <button
            onClick={() => startCall(true)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FaVideo className="w-5 h-5 text-blue-500" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {conversation.map((message, index) => (
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
              {message.type === "call" ? (
                <a
                  href={message.content.split("](")[1].replace(")", "")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {message.content}
                </a>
              ) : (
                <p>{message.content}</p>
              )}
              <span className="text-xs opacity-70">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <MessageInput scrollToBottom={scrollToBottom} />
    </div>
  );
};

export default ChatWindow;
