import global from "../../config/config.js";

export const loginRequest = async (data) => {
  const response = await fetch(global.host + "/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
};
