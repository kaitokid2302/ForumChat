package group

import "github.com/gin-gonic/gin"

func (h *GroupHandler) InitRoute(r *gin.RouterGroup) {
	r.GET("/:userID", h.GetAllGroupsByUserID)
	r.GET("/:groupID", h.GetMessagesByGroupID)
	r.GET("/:groupID/:userID", h.GetLastReadMessage)
}
