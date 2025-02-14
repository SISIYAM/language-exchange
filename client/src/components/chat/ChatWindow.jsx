import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchConversationHistory } from "@/features/user/chatSlice";

const ChatWindow = ({ currentUser, selectedUser }) => {
  const dispatch = useDispatch();
  const conversation = useSelector((state) => state.chat.conversation);

  useEffect(() => {
    if (selectedUser) {
      dispatch(
        fetchConversationHistory({
          userId1: currentUser.id,
          userId2: selectedUser.id,
        })
      );
    }
  }, [selectedUser, dispatch]);

  return (
    <div className="chat-window">
      {conversation.map((message, index) => (
        <div
          key={index}
          className={`message ${
            message.senderId === currentUser.id ? "sent" : "received"
          }`}
        >
          {message.text}
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
