"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "@/features/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

const UserMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();
  const { currentUser } = useSelector((state) => state.user);
  const { profile } = useSelector((state) => state.profile);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!currentUser?._id) {
        setIsLoadingStatus(false);
        return;
      }

      try {
        setIsLoadingStatus(true);
        const response = await axios.get(
          "http://localhost:8080/api/subscription/status",
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (response.data && typeof response.data.status === "string") {
          setSubscriptionStatus(response.data.status);
        } else {
          setSubscriptionStatus("free");
        }
      } catch (error) {
        console.error(
          "Error fetching subscription status:",
          error?.response?.data || error.message
        );
        // Don't show error toast for auth errors as user might not be logged in
        if (error.response?.status !== 401) {
          toast.error("Failed to fetch subscription status");
        }
        setSubscriptionStatus("free");
      } finally {
        setIsLoadingStatus(false);
      }
    };

    if (currentUser?._id) {
      fetchSubscriptionStatus();
    }
  }, [currentUser?._id]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Animation variants for dropdown menu
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      closeMenu();
      setSubscriptionStatus("free");
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error(error.message || "Failed to logout");
    }
  };

  // Get the display name from profile or currentUser
  const displayName = profile?.name || currentUser?.name || "User";

  // Get the profile picture URL
  const profilePicture = profile?.profilePicture
    ? `http://localhost:8080${profile.profilePicture}`
    : "/default-avatar.png";

  const menuItems = [
    { label: "Profile", path: "/profile" },
    { label: "Languages", path: "/languages" },
    { label: "Learning Preferences", path: "/learningpreferences" },
    { label: "Topics", path: "/topics" },
    { label: "Following", path: "/following" },
    { label: "Subscription", path: "/subscription" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <div className="relative inline-block">
      <div className="flex items-center cursor-pointer" onClick={toggleMenu}>
        <img
          src={profilePicture}
          alt="User Avatar"
          className="w-10 h-10 rounded-full mr-2 object-cover"
        />
        <div className="flex items-center">
          <span className="font-medium">{displayName}</span>
          {!isLoadingStatus && subscriptionStatus === "premium" && (
            <span className="ml-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              PRO
            </span>
          )}
          <span className="ml-1">&#x25BC;</span>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
            transition={{ duration: 0.2 }}
          >
            <ul className="py-2 text-sm text-gray-700">
              {menuItems.map((item) => (
                <li
                  key={item.label}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={closeMenu}
                >
                  <Link href={item.path}>{item.label}</Link>
                </li>
              ))}
              <li
                onClick={handleLogout}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500 font-medium"
              >
                Log out
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
