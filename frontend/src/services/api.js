import axios from "axios";

// This helper ensures we don't have double slashes // in our requests
const getBaseURL = () => {
  let url = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";
  // If the URL ends with a slash, remove it
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
};

const instance = axios.create({
  baseURL: getBaseURL(),
});

export function setToken(token) {
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common["Authorization"];
  }
}

// Add a tiny interceptor to log requests (Helpful for debugging on phones!)
instance.interceptors.request.use(request => {
  console.log('🚀 API Request:', request.method.toUpperCase(), request.url);
  return request;
});

export default instance;