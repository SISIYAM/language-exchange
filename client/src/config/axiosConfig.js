// src/config/axiosConfig.js
import axios from "axios";

const axiosInstance = axios.create({
  timeout: 10000,
  withCredentials: true,
});

export default axiosInstance;
