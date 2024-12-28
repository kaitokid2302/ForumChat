// func (h *GroupHandler) InitRoute(r *gin.RouterGroup) {
//     r.GET("/group/joined", h.GetAllGroupsByUserID)
//     r.GET("/group/group/:groupID/messages", h.GetMessagesByGroupID)
//     r.GET("/group/group/:groupID", h.GetLastReadMessage)
//     r.GET("/group/group/count/:groupID", h.CountUnreadMessage)
//     r.GET("/group/users", h.GetAllUsersInAGroup)
//     r.GET("/group/markread/group/:groupID/message/:messageID", h.MarkRead)
//     r.GET("/group/all", h.GetAllGroups)
//     r.GET("/group/group/message/:groupID", h.GetAllMessageUnread)
//     r.GET("/group/unjoined", h.GetAllUnjoinedGroup)
// }

import { api } from "./interceptor.js";

export const getAllJoinedGroups = async () => {
  const res = await api.get("/group/joined");
  return res.data;
};

export const getMessagesByGroupID = async (groupID, size, offset) => {
  const res = await api.get(
    `/group/group/${groupID}/messages?size=${size}&offset=${offset}`,
  );
  return res.data;
};

export const getLastReadMessage = async (groupID) => {
  const res = await api.get(`/group/group/${groupID}`);
  return res.data;
};

export const countUnreadMessage = async (groupID) => {
  const res = await api.get(`/group/group/count/${groupID}`);
  return res.data;
};

export const getAllUsersInAGroup = async (groupID) => {
  const res = await api.get(`/group/users?groupID=${groupID}`);
  return res.data;
};

export const markRead = async (groupID, messageID) => {
  const res = await api.get(
    `/group/markread/group/${groupID}/message/${messageID}`,
  );
  return res.data;
};

export const getAllGroups = async () => {
  const res = await api.get("/group/all");
  return res.data;
};

export const getAllMessageUnread = async (groupID) => {
  const res = await api.get(`/group/group/message/${groupID}`);
  return res.data;
};

export const getAllUnjoinedGroups = async () => {
  const res = await api.get("/group/unjoined");
  return res.data;
};
