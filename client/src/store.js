// src/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/user/userSlice";
import chatReducer from "./features/user/chatSlice";
import profileReducer from "./features/user/profileSlice";
import membersReducer from "./features/user/membersSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
    profile: profileReducer,
    members: membersReducer,
  },
});

export default store;
