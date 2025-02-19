"use client";
import {
  fetchAllChats,
  searchUsers,
  selectChatUser,
} from "@/features/user/chatSlice";
import React, { useEffect, useState, useCallback } from "react";
import { IoFilterSharp } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import debounce from "lodash/debounce";
import { toast } from "react-hot-toast";
import { getSocket } from "@/utils/socket";

const defaultAvatar =
  "https://imgs.search.brave.com/m12gFeEaYTH9TW9JHo1E4K4UFZBIAGpFdv-O_jdbty0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzgzLzk2/LzM2MF9GXzM0Njgz/OTY4M182bkFQemJo/cFNrSXBiOHBtQXd1/ZmtDN2M1ZUQ3d1l3/cy5qcGc";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { users, filteredUsers, chatList, status, error, selectedUser } =
    useSelector((state) => state.chat);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchChats = useCallback(() => {
    if (currentUser?._id) {
      dispatch(fetchAllChats({ currentUserId: currentUser._id }))
        .unwrap()
        .catch((error) => {
          console.error("Error fetching chats:", error);
          toast.error(error.message || "Failed to fetch chats");
        });
    }
  }, [currentUser?._id, dispatch]);

  useEffect(() => {
    const socket = getSocket();

    // Initial fetch only if user is logged in
    if (currentUser?._id) {
      fetchChats();

      // Set up socket listeners
      if (socket) {
        // Listen for new messages
        socket.on("receiveMessage", () => {
          fetchChats();
        });

        // Listen for message sent confirmation
        socket.on("messageSent", () => {
          fetchChats();
        });

        return () => {
          socket.off("receiveMessage");
          socket.off("messageSent");
        };
      }
    }
  }, [currentUser?._id, fetchChats]);

  // Debounce search function
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (!currentUser?._id) return;

      try {
        if (term.trim()) {
          await dispatch(searchUsers(term)).unwrap();
        } else {
          // If search is empty, show current chat list
          fetchChats();
        }
      } catch (error) {
        console.error("Search error:", error);
        toast.error(error.message || "Search failed");
      }
    }, 300),
    [dispatch, fetchChats, currentUser?._id]
  );

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const getProfilePicture = (user) => {
    if (!user.profilePicture) return defaultAvatar;
    return `http://localhost:8080${user.profilePicture}`;
  };

  const getLastMessage = (user) => {
    return user.lastMessage?.content || "No messages yet";
  };

  const getLastMessageTime = (user) => {
    const timestamp = user.lastMessage?.timestamp || user.updatedAt;
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get the list of users to display based on search term
  const displayUsers = searchTerm.trim() ? filteredUsers : users;

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

        {/* Search Input */}
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search users..."
            aria-label="Search for users"
            className="flex-1 p-2 border bg-gray-50 rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
            value={searchTerm}
            onChange={handleSearch}
          />
          <button
            className="ml-2 text-primary"
            aria-label="Filter search results"
          >
            <IoFilterSharp size={25} />
          </button>
        </div>
      </div>

      {/* Chat User List */}
      <div className="overflow-y-auto h-[calc(80vh-120px)]">
        {status === "loading" ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : status === "failed" ? (
          <div className="text-center text-red-500 mt-4 p-4">
            <p>{error || "Failed to load users"}</p>
            <button
              onClick={() => dispatch(fetchAllChats())}
              className="mt-2 text-blue-500 hover:text-blue-700"
            >
              Try again
            </button>
          </div>
        ) : displayUsers.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">
            {searchTerm
              ? "No users found matching your search"
              : "No conversations yet"}
          </p>
        ) : (
          displayUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => dispatch(selectChatUser(user))}
              className={`flex items-center p-3 hover:bg-indigo-50 transition-colors duration-300 border-b border-gray-200 cursor-pointer ${
                selectedUser?._id === user._id ? "bg-indigo-50" : "bg-white"
              }`}
            >
              <div className="relative w-12 h-12">
                <img
                  src={getProfilePicture(user)}
                  alt={user.name}
                  className="rounded-full w-full h-full object-cover shadow-lg"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-lg font-medium text-gray-800">
                    {user.name}
                  </p>
                  <span className="text-xs text-gray-500">
                    {getLastMessageTime(user)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {getLastMessage(user)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
