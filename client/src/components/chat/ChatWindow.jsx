"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchConversationHistory } from "@/features/user/chatSlice";
import MessageInput from "./MessageInput";
import { FaPhone, FaVideo, FaPhoneSlash } from "react-icons/fa";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { ZEGO_CONFIG } from "@/config/zegoConfig";

const defaultAvatar =
  "https://imgs.search.brave.com/m12gFeEaYTH9TW9JHo1E4K4UFZBIAGpFdv-O_jdbty0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzgzLzk2/LzM2MF9GXzM0Njgz/OTY4M182bkFQemJo/cFNrSXBiOHBtQXd1/ZmtDN2M1ZUQ3d1l3/cy5qcGc";

const ChatWindow = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { selectedUser, conversation, status } = useSelector(
    (state) => state.chat
  );
  const messagesContainerRef = useRef(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const zegoRef = useRef(null);

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

  const initializeZegoCloud = async () => {
    if (!currentUser || !selectedUser) return;

    try {
      const roomID = [currentUser._id, selectedUser._id].sort().join("-");
      const userID = currentUser._id.toString();
      const userName = currentUser.name;

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        ZEGO_CONFIG.appID,
        ZEGO_CONFIG.serverSecret,
        roomID,
        userID,
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zegoRef.current = zp;
    } catch (error) {
      console.error("Error initializing ZegoCloud:", error);
    }
  };

  useEffect(() => {
    initializeZegoCloud();
  }, [selectedUser]);

  const startVideoCall = async () => {
    if (!zegoRef.current) return;
    setIsVideoCall(true);
    setIsCalling(true);

    try {
      await zegoRef.current.joinRoom({
        container: document.getElementById("zego-video-container"),
        scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
        showPreJoinView: true,
      });
    } catch (error) {
      console.error("Error starting video call:", error);
      setIsVideoCall(false);
      setIsCalling(false);
    }
  };

  const startVoiceCall = async () => {
    if (!zegoRef.current) return;
    setIsVideoCall(false);
    setIsCalling(true);

    try {
      await zegoRef.current.joinRoom({
        container: document.getElementById("zego-video-container"),
        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
        showPreJoinView: true,
        turnOnCameraWhenJoining: false,
      });
    } catch (error) {
      console.error("Error starting voice call:", error);
      setIsCalling(false);
    }
  };

  const endCall = async () => {
    if (!zegoRef.current) return;

    try {
      await zegoRef.current.leaveRoom();
      setIsCalling(false);
      setIsVideoCall(false);
    } catch (error) {
      console.error("Error ending call:", error);
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
          {!isCalling ? (
            <>
              <button
                onClick={startVoiceCall}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <FaPhone className="w-5 h-5 text-blue-500" />
              </button>
              <button
                onClick={startVideoCall}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <FaVideo className="w-5 h-5 text-blue-500" />
              </button>
            </>
          ) : (
            <button
              onClick={endCall}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FaPhoneSlash className="w-5 h-5 text-red-500" />
            </button>
          )}
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
              <p>{message.content}</p>
              <span className="text-xs opacity-70">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Video Call Container */}
      {isCalling && (
        <div
          id="zego-video-container"
          className="fixed inset-0 bg-black z-50"
        ></div>
      )}

      {/* Message Input */}
      <MessageInput scrollToBottom={scrollToBottom} />
    </div>
  );
};

export default ChatWindow;
