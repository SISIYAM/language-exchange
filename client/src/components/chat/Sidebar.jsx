"use client";
import {
  fetchAllChats,
  searchUsers,
  selectChatUser,
  addIncomingMessage,
  addNewMessageToConversation,
} from "@/features/user/chatSlice";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { IoFilterSharp } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import debounce from "lodash/debounce";
import { toast } from "react-hot-toast";
import { getSocket } from "@/utils/socket";
import Image from "next/image";

const defaultAvatar =
  "https://imgs.search.brave.com/m12gFeEaYTH9TW9JHo1E4K4UFZBIAGpFdv-O_jdbty0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzgzLzk2/LzM2MF9GXzM0Njgz/OTY4M182bkFQemJo/cFNrSXBiOHBtQXd1/ZmtDN2M1ZUQ3d1l3/cy5qcGc";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { users, filteredUsers, chatList, status, error, selectedUser } =
    useSelector((state) => state.chat);
  const [searchTerm, setSearchTerm] = useState("");
  const [localChatList, setLocalChatList] = useState([]);

  // Fetch chats on component mount
  const fetchChats = useCallback(async () => {
    if (!currentUser?._id) return;
    try {
      const result = await dispatch(fetchAllChats()).unwrap();
      setLocalChatList(result);
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error(error.message || "Failed to fetch chats");
    }
  }, [currentUser?._id, dispatch]);

  useEffect(() => {
    fetchChats();
  }, [currentUser?._id]);

  // Update local chat list when chatList changes
  useEffect(() => {
    setLocalChatList(chatList);
  }, [chatList]);

  // Handle real-time message updates
  const updateChatWithMessage = useCallback(
    (message, source) => {
      console.log(`${source} message:`, message);

      // Update Redux store
      dispatch(
        source === "received"
          ? addIncomingMessage(message)
          : addNewMessageToConversation(message)
      );

      // Update local state
      setLocalChatList((prevChats) => {
        return prevChats.map((chat) => {
          const isRelevantChat = chat.participants.some(
            (p) => p._id === message.senderId || p._id === message.receiverId
          );

          if (isRelevantChat) {
            return {
              ...chat,
              lastMessage: message,
              updatedAt: message.timestamp,
            };
          }
          return chat;
        });
      });
    },
    [dispatch]
  );

  useEffect(() => {
    const socket = getSocket();
    if (socket && currentUser?._id) {
      // Handle receiving new message
      socket.on("receiveMessage", (message) => {
        updateChatWithMessage(message, "received");
      });

      // Handle sent message confirmation
      socket.on("messageSent", (message) => {
        updateChatWithMessage(message, "sent");
      });

      return () => {
        socket.off("receiveMessage");
        socket.off("messageSent");
      };
    }
  }, [currentUser?._id, updateChatWithMessage]);

  // Get profile picture with proper error handling
  const getProfilePicture = useCallback((user) => {
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
  }, []);

  // Get the other user from a chat
  const getOtherUser = useCallback(
    (chat) => {
      if (!chat?.participants || !currentUser?._id) return null;
      return chat.participants.find((user) => user._id !== currentUser._id);
    },
    [currentUser?._id]
  );

  // Get the list of chats to display
  const displayChats = useMemo(() => {
    return searchTerm.trim()
      ? localChatList.filter((chat) => {
          const otherUser = getOtherUser(chat);
          return (
            otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            otherUser?.email?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      : localChatList;
  }, [searchTerm, localChatList, getOtherUser]);

  // Sort chats by last message time
  const sortedChats = useMemo(() => {
    return [...displayChats].sort((a, b) => {
      const timeA = a?.lastMessage?.timestamp || a?.updatedAt || 0;
      const timeB = b?.lastMessage?.timestamp || b?.updatedAt || 0;
      return new Date(timeB) - new Date(timeA);
    });
  }, [displayChats]);

  const getLastMessage = useCallback(
    (chat) => {
      if (!chat?.lastMessage) return "No messages yet";
      const content = chat.lastMessage.content;
      // If the message is from the current user, prefix with "You: "
      if (chat.lastMessage.senderId === currentUser?._id) {
        return `You: ${content || "Sent a file"}`;
      }
      return content || "Sent a file";
    },
    [currentUser?._id]
  );

  const getLastMessageTime = useCallback((chat) => {
    const timestamp = chat?.lastMessage?.timestamp || chat?.updatedAt;
    if (!timestamp) return "";

    const messageDate = new Date(timestamp);
    const today = new Date();

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return messageDate.toLocaleDateString();
  }, []);

  if (!currentUser) {
    return (
      <div className="w-1/4 h-[80vh] border bg-white border-r shadow-lg flex items-center justify-center">
        <p className="text-gray-500">Please log in to view chats</p>
      </div>
    );
  }

  return (
    <div className="w-1/4 h-[80vh] border bg-white border-r shadow-lg">
      <div className="p-4 border-b">
        <h3 className="text-2xl font-bold text-primary mb-6">Chats</h3>

        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search chats..."
            aria-label="Search chats"
            className="flex-1 p-2 border bg-gray-50 rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="ml-2 text-primary"
            aria-label="Clear search"
            onClick={() => setSearchTerm("")}
          >
            <IoFilterSharp size={25} />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(80vh-120px)]">
        {status === "loading" ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : status === "failed" ? (
          <div className="text-center text-red-500 mt-4 p-4">
            <p>{error || "Failed to load chats"}</p>
            <button
              onClick={fetchChats}
              className="mt-2 text-blue-500 hover:text-blue-700"
            >
              Try again
            </button>
          </div>
        ) : sortedChats.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">
            {searchTerm ? "No chats found" : "No conversations yet"}
          </p>
        ) : (
          sortedChats.map((chat) => {
            const otherUser = getOtherUser(chat);
            if (!otherUser) return null;

            return (
              <div
                key={chat._id}
                onClick={() => {
                  dispatch(selectChatUser(otherUser));
                  setSearchTerm("");
                }}
                className={`flex items-center p-3 hover:bg-indigo-50 transition-colors duration-300 border-b border-gray-200 cursor-pointer ${
                  selectedUser?._id === otherUser._id
                    ? "bg-indigo-50"
                    : "bg-white"
                }`}
              >
                <div className="relative w-12 h-12">
                  <img
                    src={getProfilePicture(otherUser)}
                    alt={otherUser.name}
                    className="rounded-full w-full h-full object-cover shadow-lg"
                    loading="lazy"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-lg font-medium text-gray-800">
                      {otherUser.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {getLastMessageTime(chat)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {getLastMessage(chat)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
