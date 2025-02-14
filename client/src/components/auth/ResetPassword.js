"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';
 
const ResetPassword = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();

  const router = useRouter();
  const { token } = router?.query; // Assuming the token is passed as a query param

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_URL}/users/reset-password`, {
        resetToken: token,
        ...data,
      });

      if (response.data.message === 'Password reset successfully') {
        toast.success('Password reset successfully!');
        reset();
        router.push('/login'); // Redirect to login after success
        return;
      }

      toast.error('Failed to reset password.');
    } catch (error) {
      toast.error('Failed to reset password.');
      console.error('Error:', error.response ? error.response.data : error);
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
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="bg-white p-8 pt-0 rounded-lg shadow-lg w-full max-w-md"
      >
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-center mb-6 text-gray-800"
        >
          Reset Password
        </motion.h1>

        <motion.form
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Password Field */}
          <Controller
            name="newPassword"
            control={control}
            defaultValue=""
            rules={{
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            }}
            render={({ field }) => (
              <input
                {...field}
                type="password"
                placeholder="New password"
                className={`w-full border ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                } rounded-lg p-3 focus:outline-none focus:border-blue-500`}
              />
            )}
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm">{errors.newPassword.message}</p>
          )}

          {/* Confirm Password Field */}
          <Controller
            name="confirmPassword"
            control={control}
            defaultValue=""
            rules={{
              required: 'Confirm password is required',
              validate: (value) =>
                value === control.getValues("newPassword") || 'Passwords do not match',
            }}
            render={({ field }) => (
              <input
                {...field}
                type="password"
                placeholder="Confirm new password"
                className={`w-full border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } rounded-lg p-3 focus:outline-none focus:border-blue-500`}
              />
            )}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-[#074c77] text-white py-3 rounded-lg font-semibold hover:bg-cyan-600 transition duration-200"
          >
            Reset Password
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default ResetPassword;
