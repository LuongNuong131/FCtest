import axios from "axios";

// Tự động chọn URL: localhost nếu dev, /api nếu production (vercel)
const baseURL = import.meta.env.DEV ? "http://localhost:3000/api" : "/api";

const axiosClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn token vào mọi request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
