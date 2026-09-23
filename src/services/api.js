// api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from localStorage to each request if available
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("mybank_admin_token");
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } catch {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;