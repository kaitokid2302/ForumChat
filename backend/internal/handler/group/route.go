package group

import "github.com/gin-gonic/gin"

func (h *GroupHandler) InitRoute(r *gin.RouterGroup) {
	r.GET("/user/:userID", h.GetAllGroupsByUserID)
	r.GET("/group/:groupID", h.GetMessagesByGroupID)
	r.GET("/group/:groupID/:userID", h.GetLastReadMessage)
	r.GET("/ws", h.UpgradeWebsocket)
	r.GET("/users", h.GetAllUsersInAGroup)
	r.GET("/markread/group/:groupID/user/:userID/message/:messageID", h.MarkRead)
	r.GET("/all", h.GetAllGroups)
}
