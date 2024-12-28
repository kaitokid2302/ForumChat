package group

import "github.com/gin-gonic/gin"

func (h *GroupHandler) InitRoute(r *gin.RouterGroup) {
	r.GET("/joined", h.GetAllGroupsByUserID)
	r.GET("/group/:groupID/messages", h.GetMessagesByGroupID)
	r.GET("/group/:groupID", h.GetLastReadMessage)
	r.GET("/group/count/:groupID", h.CountUnreadMessage)
	r.GET("/ws", h.UpgradeWebsocket)
	r.GET("/users", h.GetAllUsersInAGroup)
	r.GET("/markread/group/:groupID/message/:messageID", h.MarkRead)
	r.GET("/all", h.GetAllGroups)
	r.GET("/group/message/:groupID", h.GetAllMessageUnread)
	r.GET("/unjoined", h.GetAllUnjoinedGroup)
}
