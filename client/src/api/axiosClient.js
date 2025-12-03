import axios from "axios";

// Auto detect môi trường
const baseURL = import.meta.env.DEV ? "http://localhost:3000/api" : "/api";

const axiosClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn Token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi toàn cục
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu token hết hạn (401) -> Đá về trang login ngay lập tức
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
