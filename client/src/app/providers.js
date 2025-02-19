"use client";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useEffect } from "react";
import { initializeSocket } from "@/utils/socket";

export function Providers({ children }) {
  useEffect(() => {
    // Initialize socket with store at the app level
    initializeSocket(store);
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
