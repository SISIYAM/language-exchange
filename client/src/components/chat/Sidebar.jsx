"use client";
import { fetchChatUserList, selectChatUser } from "@/features/user/chatSlice";
import React, { useEffect, useState, useMemo } from "react";
import { IoFilterSharp } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { users } = useSelector((state) => state.chat);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchChatUserList(currentUser.id));
    }
  }, [currentUser?.id, dispatch]);

  const filteredUsers = useMemo(() => {
    return (users || []).filter((user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div className="w-1/4 h-[80vh] border bg-white border-r shadow-lg">
      <div className="p-4 border-b">
        <h3 className="text-2xl font-bold text-primary mb-6">Chats</h3>

        {/* Search Input */}
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search for users"
            className="flex-1 p-2 border bg-gray-50 rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
      {filteredUsers.length === 0 ? (
        <p className="text-center text-gray-500 mt-4">No users found</p>
      ) : (
        filteredUsers.map((item) => (
          <div
            key={item.id} // Use unique id instead of index
            onClick={() => dispatch(selectChatUser(item))}
            className="flex items-center p-3 bg-white hover:bg-indigo-50 transition-colors duration-300 border-b border-gray-200 cursor-pointer"
          >
            <img
              src={item?.avatar || "/default-avatar.png"}
              alt={item?.name || "User"}
              className="w-12 h-12 rounded-full shadow-lg mr-4 object-cover"
            />
            <div className="flex-1">
              <p className="text-lg font-medium text-gray-800">{item?.name}</p>
              <span className="text-xs text-gray-500">Last seen 1 day ago</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Sidebar;
