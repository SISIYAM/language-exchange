"use client";
import ChatWindow from "@/components/chat/ChatWindow";
import Sidebar from "@/components/chat/Sidebar";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { initializeSocket, disconnectSocket } from "@/utils/socket";
import { useStore } from "react-redux";

const Page = () => {
  const store = useStore();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (currentUser?._id) {
      // Initialize socket with store reference
      const socket = initializeSocket(store);

      // Join the socket room with the current user's ID
      socket.emit("addUser", currentUser._id);

      return () => {
        disconnectSocket();
      };
    }
  }, [currentUser?._id, store]);

  return (
    <div className="flex items-start !overflow-hidden h-[80vh] bg-white container mx-auto">
      <Sidebar />
      <ChatWindow />
    </div>
  );
};

export default Page;
