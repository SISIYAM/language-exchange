"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "@/features/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const UserMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { currentUser } = useSelector((state) => state.user);
  const { profile } = useSelector((state) => state.profile);

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
        <span className="font-medium">{displayName}</span>
        <span className="ml-1">&#x25BC;</span> {/* Arrow down icon */}
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
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between">
                Visitors{" "}
                <span className="bg-pink-500 text-white text-xs px-1 py-0.5 rounded">
                  PRO
                </span>
              </li>
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
