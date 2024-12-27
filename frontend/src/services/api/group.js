import { api } from "./interceptor.js";

export const getJoinedGroups = async (userID) => {
  const response = await api.get(`/group/${userID}`);
  return response.data;
};
