"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import axios from "axios";
import Cookies from "js-cookie";
import Conversation from "@/components/chat/Conversation";
import Sidebar from "@/components/chat/Sidebar";

const ChatPage = () => {
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);

  // Initialize Socket.IO connection
  useEffect(() => {
    const token = Cookies.get("token");
    if (token && !socket) {
      const newSocket = io("http://localhost:8080", {
        auth: { token },
      });

      newSocket.on("connect", () => {
        console.log("Connected to Socket.IO server");
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [currentUser]);

  // Fetch user's chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get("/api/chat");
        setChats(response.data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    if (currentUser) {
      fetchChats();
    }
  }, [currentUser]);

  // Handle receiving messages
  useEffect(() => {
    if (socket) {
      socket.on("receive_message", (newMessage) => {
        if (currentChat && currentChat._id === newMessage.chatId) {
          setMessages((prev) => [...prev, newMessage]);
        }
      });

      socket.on("user_typing", ({ userId, isTyping }) => {
        if (
          currentChat &&
          currentChat.participants.find((p) => p._id === userId)
        ) {
          setIsTyping(isTyping);
        }
      });

      return () => {
        socket.off("receive_message");
        socket.off("user_typing");
      };
    }
  }, [socket, currentChat]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectChat = async (chat) => {
    setCurrentChat(chat);
    if (socket) {
      if (currentChat) {
        socket.emit("leave_chat", currentChat._id);
      }
      socket.emit("join_chat", chat._id);
    }

    try {
      const response = await axios.get(`/api/chat/${chat._id}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleTyping = () => {
    if (socket && currentChat) {
      if (typingTimeout) clearTimeout(typingTimeout);

      socket.emit("typing", { chatId: currentChat._id, isTyping: true });

      const timeout = setTimeout(() => {
        socket.emit("typing", { chatId: currentChat._id, isTyping: false });
      }, 2000);

      setTypingTimeout(timeout);
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim() || !currentChat) return;

    try {
      const response = await axios.post(
        `/api/chat/${currentChat._id}/message`,
        {
          content,
        }
      );

      if (socket) {
        socket.emit("send_message", {
          chatId: currentChat._id,
          content,
        });
      }

      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex items-start !overflow-hidden h-[80vh] bg-white container mx-auto">
      <Sidebar
        chats={chats}
        currentUser={currentUser}
        onSelectChat={selectChat}
        currentChat={currentChat}
      />
      <Conversation
        messages={messages}
        currentUser={currentUser}
        currentChat={currentChat}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
        onSendMessage={sendMessage}
        onTyping={handleTyping}
      />
    </div>
  );
};

export default ChatPage;
