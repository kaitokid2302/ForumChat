import axios from "axios";
import global from "../../config/config.js";

export const api = axios.create({
  baseURL: global.host,
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `${token}`;
  }
  return config;
});
