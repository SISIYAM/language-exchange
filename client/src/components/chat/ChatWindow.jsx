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

const appDomain = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";

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
    if (!user?.profilePicture) return defaultAvatar;
    try {
      return user.profilePicture.startsWith("http")
        ? user.profilePicture
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${
            user.profilePicture
          }`;
    } catch (error) {
      console.error("Error getting profile picture:", error);
      return defaultAvatar;
    }
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

  const startCall = (isVideo) => {
    if (!currentUser || !selectedUser) return;

    const roomID = [currentUser._id, selectedUser._id].sort().join("-");
    const userID = currentUser._id.toString();
    const receiverID = selectedUser._id.toString();
    const receiverName = selectedUser.name;
    const userName = currentUser.name;
    const callLink = `${appDomain}/call?roomID=${roomID}&userID=${userID}&userName=${encodeURIComponent(
      userName
    )}&isVideoCall=${isVideo}`;

    const ReceiverCallLink = `${appDomain}/call?roomID=${roomID}&userID=${receiverID}&userName=${encodeURIComponent(
      receiverName
    )}&isVideoCall=${isVideo}`;

    const callMessage = `
    <div style="padding: 10px; border-radius: 8px; background: #f1f1f1; display: inline-block;">
      <p style="color:#000000; margin:5px"><strong >${userName}</strong> <br> started a ${
      isVideo ? "video" : "audio"
    } call.</p>
      <button style="padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
        <a href="${ReceiverCallLink}" target="_blank" style="text-decoration: none; color: white;">📞 Join Call</a>
      </button>
    </div>
  `;

    dispatch(
      createNewMessage({
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        content: callMessage, // Save HTML content
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
                <div dangerouslySetInnerHTML={{ __html: message.content }} />
              ) : message.fileUrl ? (
                message.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  // Image file
                  <div className="mb-2">
                    <img
                      src={`http://localhost:8080${message.fileUrl}`}
                      alt="Shared image"
                      className="max-w-full rounded-lg"
                      onClick={() =>
                        window.open(
                          `http://localhost:8080${message.fileUrl}`,
                          "_blank"
                        )
                      }
                      style={{ cursor: "pointer" }}
                    />
                    {message.content && (
                      <p className="mt-2">{message.content}</p>
                    )}
                  </div>
                ) : (
                  // Other file types
                  <div className="flex flex-col">
                    <a
                      href={`http://localhost:8080${message.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 ${
                        message.senderId === currentUser._id
                          ? "text-white hover:text-gray-200"
                          : "text-blue-500 hover:text-blue-700"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {message.fileName || "Download file"}
                    </a>
                    {message.content && (
                      <p className="mt-2">{message.content}</p>
                    )}
                  </div>
                )
              ) : (
                <p>{message.content}</p>
              )}
              <span className="text-xs opacity-70 block mt-1">
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
