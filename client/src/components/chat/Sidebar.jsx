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
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (!term.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const result = await dispatch(searchUsers(term)).unwrap();
        setSearchResults(result);
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Failed to search users");
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [dispatch]
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  // Handle real-time message updates
  const updateChatWithMessage = useCallback(
    (message, source) => {
      dispatch(
        source === "received"
          ? addIncomingMessage(message)
          : addNewMessageToConversation(message)
      );

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
      socket.on("receiveMessage", (message) => {
        updateChatWithMessage(message, "received");
      });

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
    try {
      return `${process.env.NEXT_PUBLIC_BASE_URL}${user.profilePicture}`;
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

  // Get the list of items to display (chats or search results)
  const displayItems = useMemo(() => {
    if (searchTerm.trim() === "") {
      return localChatList;
    }

    // If searching, show loading
    if (isSearching) {
      return [];
    }

    // Combine and deduplicate search results and filtered chats
    const filteredChats = localChatList.filter((chat) => {
      const otherUser = getOtherUser(chat);
      return (
        otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        otherUser?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    const existingChatUserIds = new Set(
      filteredChats.map((chat) => getOtherUser(chat)?._id)
    );

    const searchedUsers = searchResults.filter(
      (user) => !existingChatUserIds.has(user._id)
    );

    return [
      ...filteredChats,
      ...searchedUsers.map((user) => ({
        _id: `new_${user._id}`,
        participants: [user],
        isNewChat: true,
      })),
    ];
  }, [searchTerm, localChatList, searchResults, isSearching, getOtherUser]);

  // Sort chats by last message time
  const sortedItems = useMemo(() => {
    return [...displayItems].sort((a, b) => {
      if (a.isNewChat) return -1; // New chat items appear at the top
      if (b.isNewChat) return 1;

      const timeA = a?.lastMessage?.timestamp || a?.updatedAt || 0;
      const timeB = b?.lastMessage?.timestamp || b?.updatedAt || 0;
      return new Date(timeB) - new Date(timeA);
    });
  }, [displayItems]);

  const getLastMessage = useCallback(
    (chat) => {
      if (!chat?.lastMessage) return "No messages yet";

      const { content, type, senderId } = chat.lastMessage;

      // Check if the message is a call type
      if (type === "call") {
        return "Started a call";
      }

      if (senderId === currentUser?._id) {
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
            placeholder="Search users to chat..."
            aria-label="Search users"
            className="flex-1 p-2 border bg-gray-50 rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button
            className="ml-2 text-primary"
            aria-label="Clear search"
            onClick={() => {
              setSearchTerm("");
              setSearchResults([]);
            }}
          >
            <IoFilterSharp size={25} />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(80vh-120px)]">
        {status === "loading" || isSearching ? (
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
        ) : sortedItems.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">
            {searchTerm ? "No users found" : "No conversations yet"}
          </p>
        ) : (
          sortedItems.map((item) => {
            const otherUser = item.isNewChat
              ? item.participants[0]
              : getOtherUser(item);
            if (!otherUser) return null;

            return (
              <div
                key={item._id}
                onClick={() => {
                  dispatch(selectChatUser(otherUser));
                  setSearchTerm("");
                  setSearchResults([]);
                }}
                className={`flex items-center p-3 hover:bg-indigo-50 transition-colors duration-300 border-b border-gray-200 cursor-pointer ${
                  selectedUser?._id === otherUser._id
                    ? "bg-indigo-50"
                    : "bg-white"
                }`}
              >
                <div className="relative w-12 h-12">
                  <img
                    src={
                      otherUser.profilePicture
                        ? `${process.env.NEXT_PUBLIC_BASE_URL}${otherUser.profilePicture}`
                        : defaultAvatar
                    }
                    alt={otherUser.name}
                    className="rounded-full w-full h-full object-cover shadow-lg"
                    onError={(e) => {
                      e.target.src = defaultAvatar;
                    }}
                  />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-900">
                      {otherUser.name}
                    </h4>
                    {!item.isNewChat && (
                      <span className="text-xs text-gray-500">
                        {getLastMessageTime(item)}
                      </span>
                    )}
                  </div>
                  {item.isNewChat ? (
                    <p className="text-sm text-blue-500">
                      Start a new conversation
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 truncate">
                      {getLastMessage(item)}
                    </p>
                  )}
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
