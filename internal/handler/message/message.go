package message

import (
	"strconv"

	"ForumChat/internal/response"
	"ForumChat/internal/service/message"
	"github.com/gin-gonic/gin"
)

type MessageHandler struct {
	message.MessageService
}

func (h *MessageHandler) WebsocketConnect(c *gin.Context) {
	// use melody, global websocket
	username := c.GetString("username")
	userIDstring := c.GetString("userID")
	userID, er := strconv.Atoi(userIDstring)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	er = h.MessageService.UpgradeWebsocket(c, username, userID)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
}
