import { api } from "./interceptor.js";

export const getJoinedGroups = async () => {
  const userID = localStorage.getItem("userID");
  const response = await api.get(`/group/${userID}`);
  return response.data;
};

// r.GET("/group/group/:groupID", h.GetMessagesByGroupID)
export const getAllMessagesByGroupID = async (groupID) => {
  const response = await api.get(`/group/group/${groupID}`);
  return response.data;
};

// r.GET("/group/group/:groupID", h.GetLastReadMessage)
// 	r.GET("/group/group/count/:groupID", h.CountUnreadMessage)
// 	r.GET("/group/users", h.GetAllUsersInAGroup)
// r.GET("/markread/group/:groupID/message/:messageID", h.MarkRead)
// 	r.GET("/group/all", h.GetAllGroups)
// 	r.GET("/group/group/message/:groupID", h.GetAllMessageUnread)

export const getLastReadMessage = async (groupID) => {
  const response = await api.get(`/group/group/${groupID}`);
  return response.data;
};

export const countUnreadMessage = async (groupID) => {
  const response = await api.get(`/group/group/count/${groupID}`);
  return response.data;
};

export const getAllUsersInAGroup = async () => {
  const response = await api.get(`/group/users`);
  return response.data;
};

export const markRead = async (groupID, messageID) => {
  const response = await api.get(
    `/markread/group/${groupID}/message/${messageID}`,
  );
  return response.data;
};

export const getAllGroups = async () => {
  const response = await api.get(`/group/all`);
  return response.data;
};

export const getAllMessageUnread = async (groupID) => {
  const response = await api.get(`/group/group/message/${groupID}`);
  return response.data;
};
