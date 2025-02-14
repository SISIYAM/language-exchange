"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "@/features/user/userSlice";
import { useDispatch } from "react-redux";
import Link from "next/link";

const UserMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();

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

  const handleLogout = () => {
    dispatch(logout());
    closeMenu(); // Close the menu on logout
  };

  return (
    <div className="relative inline-block">
      <div className="flex items-center cursor-pointer" onClick={toggleMenu}>
        <img
          src="https://live-s3-bucket-sjwburhj9xhf.cdn.live.tandem.net/34/4d/d0e8188a857c31a121b883fdf630da9e.jpg" // Replace with your image path
          alt="User Avatar"
          className="w-10 h-10 rounded-full mr-2"
        />
        <span className="font-medium">Sevil</span>
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
              {[
                "Profile",
                "Languages",
                "Learning Preferences",
                "Topics",
                "Following",
                "Settings",
              ].map((item) => (
                <li
                  key={item}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={closeMenu} // Close menu on item click
                >
                  <Link href={`/${item.replace(/\s+/g, "").toLowerCase()}`}>
                    {item}
                  </Link>
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
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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
