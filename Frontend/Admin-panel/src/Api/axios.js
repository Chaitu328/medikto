import axios from "axios";
import config from "../config";

console.log(
  "API BASE URL:",
  config.API_BASE_URL
);

const api = axios.create({
  baseURL: config.API_BASE_URL,
});

api.interceptors.request.use((req) => {
  console.log(
    "FINAL REQUEST URL:",
    req.baseURL + req.url
  );

  const token =
    localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or unauthorized (401). Clearing stored auth tokens.");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      const currentPath = window.location.pathname;
      if (!currentPath.includes("/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;