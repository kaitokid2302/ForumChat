import global from "../../config/config.js";
import { api } from "./interceptor.js";

export const loginRequest = async (data) => {
  const response = await fetch(global.host + "/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const registerRequest = async (data) => {
  const response = await fetch(global.host + "/user/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
};
