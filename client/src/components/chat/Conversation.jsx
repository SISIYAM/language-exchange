import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaPhone, FaVideo } from "react-icons/fa";

const Conversation = ({
  messages,
  currentUser,
  currentChat,
  isTyping,
  messagesEndRef,
  onSendMessage,
  onTyping,
}) => {
  const [message, setMessage] = useState("");
  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);

  // Handle smooth scrolling to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle initial scroll position when chat is selected
  useEffect(() => {
    if (currentChat && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [currentChat]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const getParticipantInfo = () => {
    if (!currentChat || !currentUser) return null;

    const otherParticipant = currentChat.participants?.find(
      (participant) => participant?._id !== currentUser?._id
    );

    if (!otherParticipant) return null;

    return {
      name: otherParticipant.name || "Unknown User",
      profilePicture: otherParticipant?.profile?.profilePicture
        ? `http://localhost:8080${otherParticipant.profile.profilePicture}`
        : "/default-avatar.png",
      isActive: true,
    };
  };

  const participantInfo = getParticipantInfo();

  const getMessageSenderInfo = (senderId) => {
    if (!currentChat || !currentUser || !senderId)
      return {
        name: "Unknown User",
        profilePicture: "/default-avatar.png",
        isCurrentUser: false,
      };

    // Convert IDs to strings for comparison
    const currentUserId = currentUser._id.toString();
    const senderIdStr = senderId.toString();

    // If the sender is the current user
    if (senderIdStr === currentUserId) {
      // Find current user in participants to get the profile picture
      const currentUserParticipant = currentChat.participants?.find(
        (p) => p._id.toString() === currentUserId
      );

      const profilePicture = currentUserParticipant?.profile?.profilePicture
        ? `http://localhost:8080${currentUserParticipant.profile.profilePicture}`
        : "/default-avatar.png";

      console.log("Current user participant info:", {
        participant: currentUserParticipant,
        profile: currentUserParticipant?.profile,
        finalUrl: profilePicture,
      });

      return {
        name: currentUser.name || "You",
        profilePicture,
        isCurrentUser: true,
      };
    }

    // Find the other participant in the chat
    const otherParticipant = currentChat.participants?.find(
      (p) => p?._id?.toString() === senderIdStr
    );

    if (!otherParticipant)
      return {
        name: "Unknown User",
        profilePicture: "/default-avatar.png",
        isCurrentUser: false,
      };

    const profilePicture = otherParticipant?.profile?.profilePicture
      ? `http://localhost:8080${otherParticipant.profile.profilePicture}`
      : "/default-avatar.png";

    return {
      name: otherParticipant.name || "Unknown User",
      profilePicture,
      isCurrentUser: false,
    };
  };

  return (
    <div className="flex-1 h-full flex flex-col">
      {/* Chat Header */}
      {currentChat && participantInfo && (
        <div className="sticky top-0 z-10 bg-white px-6 py-4 border-b shadow-sm flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={participantInfo.profilePicture}
              alt={participantInfo.name}
              className="w-10 h-10 rounded-full mr-4 cursor-pointer object-cover"
              onError={(e) => {
                e.target.src = "/default-avatar.png";
              }}
            />
            <div>
              <p className="font-semibold text-gray-700 text-lg">
                {participantInfo.name}
              </p>
              <p className="text-sm text-green-500">
                {participantInfo.isActive ? "Active" : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-200">
              <FaVideo />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200">
              <FaPhone />
            </button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-gradient-to-b from-indigo-50 via-white to-gray-50 p-6"
      >
        {currentChat && currentUser ? (
          <div className="space-y-1">
            {messages.map((msg, index) => {
              // Check if the message is from the current user
              const isCurrentUser = msg?.sender?._id
                ? msg.sender._id.toString() === currentUser._id.toString()
                : msg.sender.toString() === currentUser._id.toString();

              const showProfilePic =
                index === 0 || messages[index - 1]?.sender !== msg?.sender;
              const senderInfo = getMessageSenderInfo(
                msg?.sender?._id || msg?.sender
              );

              console.log("Message data:", {
                sender: msg?.sender,
                currentUser: currentUser._id,
                isCurrentUser,
                senderInfo,
                currentUserProfile: currentUser?.profile,
              });

              return (
                <div
                  key={index}
                  className={`flex items-end gap-2 ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  } ${
                    index > 0 && messages[index - 1]?.sender === msg?.sender
                      ? "mt-1"
                      : "mt-4"
                  }`}
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                >
                  {!isCurrentUser && showProfilePic && (
                    <img
                      src={senderInfo.profilePicture}
                      alt={senderInfo.name}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                  )}
                  {!isCurrentUser && !showProfilePic && <div className="w-8" />}
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                      isCurrentUser
                        ? "bg-blue-500 text-white rounded-tr-none"
                        : "bg-gray-200 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    {msg?.content}
                  </div>
                  {isCurrentUser && showProfilePic && (
                    <img
                      src={senderInfo.profilePicture}
                      alt={senderInfo.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  {isCurrentUser && !showProfilePic && <div className="w-8" />}
                </div>
              );
            })}
            {isTyping && participantInfo && (
              <div className="flex items-center gap-2 mt-2">
                <img
                  src={participantInfo.profilePicture}
                  alt={participantInfo.name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />
                <div className="text-gray-500 text-sm bg-gray-200 px-4 py-2 rounded-full">
                  typing...
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Image
                src="https://res.cloudinary.com/dh20zdtys/image/upload/v1723709261/49f87c8af2a00c070b11e2b15349fa1c_uakips.png"
                width={150}
                height={150}
                alt="Logo"
              />
              <p className="text-gray-500 mt-4">
                {!currentUser
                  ? "Please log in to start messaging"
                  : "Select a chat to start messaging"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      {currentChat && (
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={onTyping}
              placeholder="Type a message..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Conversation;
