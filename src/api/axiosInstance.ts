import axios from "axios";
import { toast } from "react-toastify";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:8080",
});

// Attach auth token for every request if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Show toast error message
    toast.error(error?.response?.data?.message || "An error occurred");
    return Promise.reject(error);
  }
);

export default axiosInstance;
