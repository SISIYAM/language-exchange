import React, { useEffect, useRef, useState } from "react";
import {
  FaPhone,
  FaVideo,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaCamera,
  FaCameraSlash,
} from "react-icons/fa";
import MessageInput from "./MessageInput";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversationHistory } from "@/features/user/chatSlice";
import Image from "next/image";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { ZEGO_CONFIG } from "@/config/zegoConfig";

const Conversation = () => {
  const dispatch = useDispatch();
  const { conversation, selectedUser } = useSelector((state) => state.chat);
  const { currentUser } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [isCalling, setIsCalling] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const chatContainerRef = useRef(null);
  const zegoRef = useRef(null);

  useEffect(() => {
    if (currentUser?._id && selectedUser?._id) {
      dispatch(
        fetchConversationHistory({
          userId1: currentUser._id,
          userId2: selectedUser._id,
        })
      );
      initializeZegoCloud();
    }
  }, [currentUser, selectedUser, dispatch]);

  const initializeZegoCloud = async () => {
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

      // Initialize chat module
      zp.addPlugins({
        chat: {
          showInList: true,
          showMessageList: true,
        },
      });
    } catch (error) {
      console.error("Error initializing ZegoCloud:", error);
    }
  };

  const startVideoCall = async () => {
    if (!zegoRef.current) return;

    setIsVideoCall(true);
    setIsCalling(true);

    try {
      await zegoRef.current.joinRoom({
        container: document.getElementById("zego-video-container"),
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        showPreJoinView: false,
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
        container: document.getElementById("zego-call-container"),
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
          config: {
            video: false,
            audio: true,
            showPreJoinView: true,
            showScreenSharingButton: false,
            showAudioVideoSettingsButton: false,
            showTextChat: false,
          },
        },
        showPreJoinView: false,
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

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

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
          <div className="relative">
            <Image
              src={selectedUser.profilePicture || "/default-avatar.png"}
              alt={selectedUser.name}
              width={48}
              height={48}
              className="rounded-full"
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
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
        ref={chatContainerRef}
      >
        {conversation?.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.senderId === currentUser.id
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === currentUser.id
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {message.type === "call" ? (
                <div dangerouslySetInnerHTML={{ __html: message.content }} />
              ) : (
                <p>{message.content}</p>
              )}
              <span className="text-xs opacity-70">
                {new Date(message.timestamp).toLocaleTimeString()}
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

      {/* Call Container */}
      {isCalling && (
        <div
          id="zego-call-container"
          className="fixed inset-0 bg-black z-50"
        ></div>
      )}

      {/* Message Input */}
      <MessageInput scrollToBottom={scrollToBottom} />
    </div>
  );
};

export default Conversation;
