"use client";
import React, { useState } from "react";
import { FiSearch, FiUserPlus } from "react-icons/fi";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true;

const Sidebar = ({ chats, currentUser, onSelectChat, currentChat }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      setIsSearching(true);
      try {
        const token = Cookies.get("token");
        const response = await axios.get(`/api/members/search?query=${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSearchResults(response.data);
      } catch (error) {
        console.error("Error searching users:", error);
        toast.error("Failed to search users");
      }
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const startNewChat = async (e, userId) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    try {
      setIsLoading(true);
      const token = Cookies.get("token");

      if (!token) {
        console.log("No token found");
        toast.error("Please log in to start a chat");
        return;
      }

      console.log("Starting new chat with user:", userId);

      const response = await axios.post(
        "/api/chat",
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Chat creation response:", {
        status: response.status,
        data: response.data,
        chatId: response.data?._id,
        participants: response.data?.participants,
      });

      const newChat = response.data;

      if (!newChat || !newChat._id) {
        console.error("Invalid chat data received:", newChat);
        throw new Error("Invalid chat data received from server");
      }

      // Update the chats list with the new chat
      const chatExists = chats.find((chat) => chat._id === newChat._id);
      console.log("Chat exists in current list:", chatExists ? "Yes" : "No");

      if (!chatExists) {
        console.log("Adding new chat to list");
        onSelectChat(newChat);
      } else {
        console.log("Selecting existing chat");
        onSelectChat(newChat);
      }

      // Clear search
      setSearchQuery("");
      setSearchResults([]);
      setIsSearching(false);

      toast.success("Chat started successfully");
    } catch (error) {
      console.error("Chat creation error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.details ||
        error.message ||
        "Failed to start chat";

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getParticipantInfo = (chat) => {
    if (!chat || !chat.participants || !currentUser)
      return {
        name: "Unknown User",
        profilePicture: "/default-avatar.png",
      };

    const otherParticipant = chat.participants.find(
      (p) => p?._id !== currentUser?._id
    );

    if (!otherParticipant)
      return {
        name: "Unknown User",
        profilePicture: "/default-avatar.png",
      };

    return {
      name: otherParticipant.name || "Unknown User",
      profilePicture: otherParticipant?.profile?.profilePicture
        ? `http://localhost:8080${otherParticipant.profile.profilePicture}`
        : "/default-avatar.png",
    };
  };

  return (
    <div className="w-1/4 border-r h-full overflow-y-auto bg-white">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search users..."
            className="w-full px-4 py-2 border rounded-full pr-10 focus:outline-none focus:border-blue-500"
          />
          <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Search Results */}
      {isSearching && searchResults.length > 0 ? (
        <div className="overflow-y-auto">
          <div className="px-4 py-2 text-sm text-gray-500">Search Results</div>
          {searchResults.map((user) => (
            <div key={user._id} className="p-4 border-b hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.profilePicture || "/default-avatar.png"}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => startNewChat(e, user._id)}
                  disabled={isLoading}
                  className={`p-2 rounded-full transition-colors ${
                    isLoading
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                  }`}
                >
                  <FiUserPlus size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Existing Chats
        <div className="overflow-y-auto">
          {chats.map((chat) => {
            const { name, profilePicture } = getParticipantInfo(chat);

            return (
              <div
                key={chat._id}
                onClick={() => onSelectChat(chat)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  currentChat?._id === chat._id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={profilePicture}
                    alt={name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{name}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
