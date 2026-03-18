// Get base URLs from environment variables
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3001";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export { BASE_URL, API_BASE_URL };
