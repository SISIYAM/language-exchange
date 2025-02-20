import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getSocket } from "@/utils/socket";

// Base URL for the API

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${apiUrl}/chat`;

// ========================== Chat Async Thunks ==========================

// Fetch chat users list
export const fetchChatUserList = createAsyncThunk(
  "chat/fetchChatUserList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users/search`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching users");
    }
  }
);

// Search users
export const searchUsers = createAsyncThunk(
  "chat/searchUsers",
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users/search`, {
        params: { q: searchTerm },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error searching users");
    }
  }
);

// Fetch conversation between two users
export const fetchConversationHistory = createAsyncThunk(
  "chat/fetchConversationHistory",
  async ({ userId1, userId2 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/conversation/${userId1}/${userId2}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching conversation"
      );
    }
  }
);

// Create a new message
export const createNewMessage = createAsyncThunk(
  "chat/createNewMessage",
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/send`, messageData, {
        withCredentials: true,
        headers: {
          ...(messageData instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
        },
      });

      // Emit the message through socket if available
      const socket = getSocket();
      if (socket) {
        socket.emit("sendMessage", {
          ...response.data,
          receiverId: messageData.get
            ? messageData.get("receiverId")
            : messageData.receiverId,
          senderId: messageData.get
            ? messageData.get("senderId")
            : messageData.senderId,
        });
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error sending message");
    }
  }
);

// Fetch all chats for current user
export const fetchAllChats = createAsyncThunk(
  "chat/fetchAllChats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching chats");
    }
  }
);

// ========================== Chat Slice ==========================

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    users: [], // List of chat users
    filteredUsers: [],
    chatList: [], // List of chats with other users
    conversation: [], // Conversation history between two users
    selectedUser: null, // The currently selected chat user
    status: "idle", // Loading status for async actions
    error: null, // Error state for handling errors
  },
  reducers: {
    // Select a user to chat with
    selectChatUser: (state, action) => {
      state.selectedUser = action.payload;
      state.conversation = []; // Reset conversation when a new user is selected

      // Join socket room when selecting a user
      if (action.payload?._id) {
        const socket = getSocket();
        if (socket) {
          socket.emit("join", action.payload._id);
        }
      }
    },
    // Add new message to the conversation
    addNewMessageToConversation: (state, action) => {
      const message = action.payload;
      // Check if the message already exists
      const messageExists = state.conversation.some(
        (m) =>
          m.content === message.content &&
          m.senderId === message.senderId &&
          new Date(m.timestamp).getTime() ===
            new Date(message.timestamp).getTime()
      );

      if (!messageExists) {
        state.conversation.push(message);
        // Sort messages by timestamp
        state.conversation.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        // Update the chat list with the latest message
        const chatIndex = state.chatList.findIndex(
          (chat) =>
            chat.participants.includes(message.senderId) &&
            chat.participants.includes(message.receiverId)
        );

        if (chatIndex !== -1) {
          state.chatList[chatIndex].lastMessage = message;
          state.chatList[chatIndex].updatedAt = message.timestamp;
        }
      }
    },
    // Add incoming message to the chat
    addIncomingMessage: (state, action) => {
      const message = action.payload;
      // Check if this is a message in the current conversation
      const isCurrentConversation =
        state.selectedUser?._id === message.senderId ||
        state.selectedUser?._id === message.receiverId;

      if (isCurrentConversation) {
        // Check if the message already exists in the conversation
        const messageExists = state.conversation.some(
          (m) =>
            m.content === message.content &&
            m.senderId === message.senderId &&
            new Date(m.timestamp).getTime() ===
              new Date(message.timestamp).getTime()
        );

        if (!messageExists) {
          state.conversation.push(message);
          // Sort messages by timestamp
          state.conversation.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          // Update the chat list with the latest message
          const chatIndex = state.chatList.findIndex(
            (chat) =>
              chat.participants.includes(message.senderId) &&
              chat.participants.includes(message.receiverId)
          );

          if (chatIndex !== -1) {
            state.chatList[chatIndex].lastMessage = message;
            state.chatList[chatIndex].updatedAt = message.timestamp;
          }
        }
      }
    },
    clearChatState: (state) => {
      state.users = [];
      state.filteredUsers = [];
      state.conversation = [];
      state.selectedUser = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch chat users
      .addCase(fetchChatUserList.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchChatUserList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
        state.filteredUsers = action.payload;
      })
      .addCase(fetchChatUserList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.filteredUsers = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch conversation history between users
      .addCase(fetchConversationHistory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchConversationHistory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.conversation = action.payload;
      })
      .addCase(fetchConversationHistory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch all chats
      .addCase(fetchAllChats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllChats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.chatList = action.payload;

        // Update users list with the latest chat information
        state.users = state.users.map((user) => {
          const userChat = action.payload.find((chat) =>
            chat.participants.includes(user._id)
          );
          return {
            ...user,
            hasChat: !!userChat,
          };
        });
      })
      .addCase(fetchAllChats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Create new message
      .addCase(createNewMessage.fulfilled, (state, action) => {
        state.status = "succeeded";
        const message = action.payload;

        // Update chat list with new message
        const chatIndex = state.chatList.findIndex(
          (chat) =>
            chat.participants.includes(message.senderId) &&
            chat.participants.includes(message.receiverId)
        );

        if (chatIndex !== -1) {
          state.chatList[chatIndex].lastMessage = message;
        }

        // Also update conversation if this is the current chat
        if (
          state.selectedUser &&
          (state.selectedUser._id === message.senderId ||
            state.selectedUser._id === message.receiverId)
        ) {
          state.conversation.push(message);
        }
      });
  },
});

export const {
  selectChatUser,
  addNewMessageToConversation,
  addIncomingMessage,
  clearChatState,
} = chatSlice.actions;

export default chatSlice.reducer;
