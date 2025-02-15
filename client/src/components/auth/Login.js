"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { FaApple, FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/features/user/userSlice";
import { fetchProfile } from "@/features/user/profileSlice";
import axios from "axios";

const Login = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((state) => state.user);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("/api/auth/login", {
        email: data.email,
        password: data.password,
      });

      // Store token in cookie (if not already handled by backend)
      if (response.data.token) {
        Cookies.set("token", response.data.token);
      }

      // Fetch user profile
      await dispatch(fetchProfile()).unwrap();

      // Redirect to profile page
      router.push("/profile");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="flex justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="bg-white p-8 pt-0 rounded-lg shadow-lg w-full max-w-md"
      >
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-center mb-6 text-gray-800"
        >
          Log In
        </motion.h1>

        {/* Social Media Buttons */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-4 mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center border border-gray-300 rounded-full py-2 hover:border-[#074c77] active:opacity-40"
          >
            <FaFacebook className="text-blue-600 mr-2 text-2xl" />
            Sign in with Facebook
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center border border-gray-300 rounded-full py-2 hover:border-[#074c77] active:opacity-40"
          >
            <FaApple className="text-black mr-2 text-2xl" />
            Sign in with Apple
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center border border-gray-300 rounded-full py-2 hover:border-[#074c77] active:opacity-40"
          >
            <FcGoogle className="text-red-500 mr-2 text-2xl" />
            Sign in with Google
          </motion.button>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex items-center my-6"
        >
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-2 text-gray-500">or</span>
          <hr className="flex-grow border-t border-gray-300" />
        </motion.div>

        {/* Form for Email and Password */}
        <motion.form
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Email Field */}
          <Controller
            name="email"
            control={control}
            defaultValue=""
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            }}
            render={({ field }) => (
              <input
                {...field}
                type="email"
                placeholder="Your email"
                className={`w-full border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-lg p-3 focus:outline-none focus:border-blue-500`}
              />
            )}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}

          {/* Password Field */}
          <Controller
            name="password"
            control={control}
            defaultValue=""
            rules={{
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            }}
            render={({ field }) => (
              <input
                {...field}
                type="password"
                placeholder="Your password"
                className={`w-full border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg p-3 focus:outline-none focus:border-blue-500`}
              />
            )}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-[#074c77] text-white py-3 rounded-lg font-semibold hover:bg-cyan-600 transition duration-200"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </motion.button>
        </motion.form>

        {/* Display user name if user is logged in */}
        {user && <p className="mt-4 text-center">Welcome, {user.name}!</p>}
      </motion.div>
    </motion.div>
  );
};

export default Login;
