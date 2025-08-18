import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

const instance = axios.create({
  baseURL: API_BASE,
});

export function setToken(token) {
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common["Authorization"];
  }
}

export default instance;