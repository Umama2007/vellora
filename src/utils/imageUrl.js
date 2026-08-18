const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const BACKEND_BASE = API_URL.replace(/\/api$/, "");

export function getImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_BASE}${cleanPath}`;
}
