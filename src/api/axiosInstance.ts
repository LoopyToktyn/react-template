import axios, { AxiosResponse, AxiosError } from "axios";
import { toast } from "react-toastify";

interface ApiResponse {
  message?: string;
  [key: string]: any; // Allows additional properties
}

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:8080",
});

const middleware = (response: AxiosResponse<ApiResponse>) => {
  const { config, status, data } = response;

  if (status >= 200 && status < 300 && config.method !== "get") {
    toast.success("Success: " + (data.message || "Operation successful"));
  }

  return response;
};

const errorMiddleware = (error: AxiosError<ApiResponse>) => {
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.message || "An unexpected error occurred";

    switch (status) {
      case 400:
        toast.error("Bad Request: " + message);
        break;
      case 401:
        toast.error("Unauthorized: " + message);
        break;
      case 403:
        toast.error("Forbidden: " + message);
        break;
      case 404:
        toast.error("Not Found: " + message);
        break;
      case 500:
        toast.error("Server Error: " + message);
        break;
      default:
        toast.error("Error: " + message);
        break;
    }
  } else if (error.request) {
    toast.error("No Response: The server did not respond");
  } else {
    toast.error("Request Error: " + error.message);
  }

  return Promise.reject(error);
};

// Add the interceptors to the axios instance
axiosInstance.interceptors.response.use(middleware, errorMiddleware);

export default axiosInstance;
