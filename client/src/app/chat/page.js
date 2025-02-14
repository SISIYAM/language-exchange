"use client";
import Conversation from "@/components/chat/Conversation";
import Sidebar from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import {
  setSelectedUser,
  fetchChatUserList,
  fetchConversationHistory,
} from "@/features/user/chatSlice"; // Add the necessary actions

const Page = () => {
  const currentUser = useSelector((state) => state.auth?.user); // Current authenticated user
  const selectedUser = useSelector((state) => state.chat?.selectedUser); // Currently selected chat user
  const users = useSelector((state) => state.chat?.users); // List of chat users
  const conversation = useSelector((state) => state.chat?.conversation); // Current conversation history
  const status = useSelector((state) => state.chat?.status); // Chat loading status
  const error = useSelector((state) => state.chat?.error); // Error state

  const dispatch = useDispatch();

  // Fetch users and conversation history when the page loads or the currentUser changes
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchChatUserList(currentUser.id)); // Fetch users
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (currentUser && selectedUser) {
      dispatch(
        fetchConversationHistory({
          userId1: currentUser.id,
          userId2: selectedUser.id,
        })
      );
    }
  }, [dispatch, currentUser, selectedUser]);

  // Function to handle user selection in the sidebar
  const handleUserSelect = (user) => {
    dispatch(setSelectedUser(user)); // Set the selected user
  };

  return (
    <div className="flex items-start !overflow-hidden h-[80vh] bg-white container mx-auto">
      <Sidebar onUserSelect={handleUserSelect} users={users} />
      <Conversation conversation={conversation} status={status} error={error} />
      <ChatWindow currentUser={currentUser} selectedUser={selectedUser} />
    </div>
  );
};

export default Page;
