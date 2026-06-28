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

export default api;