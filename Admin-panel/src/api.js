import axios from "axios";
import toast from "react-hot-toast";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Keep the response interceptor to handle the 1-day expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("adminAuthenticated");
      toast.error("Session expired. Please log in again.");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
    return Promise.reject(error);
  }
);