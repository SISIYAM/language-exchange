// src/config/axiosConfig.js
import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL, // Replace with your actual API base URL
  timeout: 10000,
  withCredentials: true, // Include cookies in requests
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional: Handle errors globally
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors, e.g., by redirecting to login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
