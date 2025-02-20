import io from "socket.io-client";
import {
  addIncomingMessage,
  addNewMessageToConversation,
} from "@/features/user/chatSlice";
import toast from "react-hot-toast";

let socket = null;
let store = null;
let intentionalDisconnect = false;

export const initializeSocket = (reduxStore) => {
  store = reduxStore;

  if (!socket) {
    socket = io("http://localhost:8080", {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      path: "/socket.io/",
    });

    socket.on("connect", () => {
      console.log("Connected to socket server");
      intentionalDisconnect = false;

      // Re-add user to online users if we have the current user
      const state = store.getState();
      const currentUser = state.user.currentUser;
      if (currentUser?._id) {
        socket.emit("addUser", currentUser._id);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      if (!intentionalDisconnect) {
        toast.error("Connection error. Trying to reconnect...");
      }
    });

    socket.on("receiveMessage", (message) => {
      console.log("Received message:", message);
      if (store) {
        store.dispatch(addIncomingMessage(message));
      }
    });

    socket.on("messageSent", (message) => {
      console.log("Message sent confirmation:", message);
      if (store) {
        store.dispatch(addNewMessageToConversation(message));
      }
    });

    socket.on("messageError", (error) => {
      console.error("Message error:", error);
      toast.error("Failed to send message. Please try again.");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      if (!intentionalDisconnect) {
        toast.error("Disconnected from chat server");
      }
    });

    socket.on("reconnect", () => {
      console.log("Socket reconnected");
      if (!intentionalDisconnect) {
        toast.success("Reconnected to chat server");
      }

      // Re-add user to online users after reconnection
      const state = store.getState();
      const currentUser = state.user.currentUser;
      if (currentUser?._id) {
        socket.emit("addUser", currentUser._id);
      }
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    intentionalDisconnect = true;
    socket.disconnect();
    socket = null;
    store = null;
  }
};
