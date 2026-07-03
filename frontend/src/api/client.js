import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// The backend serves uploaded photos from /uploads, separate from /api.
// Derive that root so <img> tags work whether we're proxied locally or
// pointed at a separately-hosted backend in production.
export const fileBaseUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/api\/?$/, "");

export default client;
