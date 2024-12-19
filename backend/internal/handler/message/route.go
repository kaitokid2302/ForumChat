package message

import "github.com/gin-gonic/gin"

func (h *MessageHandler) InitRoute(r *gin.RouterGroup) {
	r.GET("/ws", h.WebsocketConnect)
}
