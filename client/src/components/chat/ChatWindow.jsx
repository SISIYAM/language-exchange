import React, { useState } from "react";
import { useSelector } from "react-redux";

const ChatWindow = ({ currentChat, onSendMessage, onTyping }) => {
  const [message, setMessage] = useState("");
  const currentUser = useSelector((state) => state.user.currentUser);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const getParticipantInfo = (participantId) => {
    if (!currentChat) return null;

    // If the participant is the current user
    if (participantId === currentUser._id) {
      return {
        name: currentUser.name,
        profilePicture: currentUser.profilePicture
          ? `http://localhost:8080${currentUser.profilePicture}`
          : "/default-avatar.png",
        isCurrentUser: true,
      };
    }

    // Find the other participant in the chat
    const otherParticipant = currentChat.participants.find(
      (p) => p._id !== currentUser._id
    );

    return {
      name: otherParticipant?.name || "Unknown User",
      profilePicture: otherParticipant?.profile?.profilePicture
        ? `http://localhost:8080${otherParticipant.profile.profilePicture}`
        : "/default-avatar.png",
      isCurrentUser: false,
    };
  };

  return (
    <div className="w-1/4 border-l h-full flex flex-col">
      {currentChat ? (
        <>
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Chat Info</h2>
          </div>
          <div className="flex-1">
            <div className="p-4">
              <h3 className="font-medium mb-2">Participants</h3>
              {currentChat.participants.map((participant) => {
                const { name, profilePicture, isCurrentUser } =
                  getParticipantInfo(participant._id);
                return (
                  <div
                    key={participant._id}
                    className="flex items-center space-x-2 mb-2"
                  >
                    <img
                      src={profilePicture}
                      alt={name}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                    <span>
                      {name} {isCurrentUser ? "(You)" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={onTyping}
                placeholder="Type a message..."
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
