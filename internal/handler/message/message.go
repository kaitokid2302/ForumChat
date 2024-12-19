package message

import (
	"ForumChat/internal/response"
	"ForumChat/internal/service/message"
	"github.com/gin-gonic/gin"
)

type MessageHandler struct {
	message.MessageService
}

func NewMessageHandler(messageService message.MessageService) *MessageHandler {
	return &MessageHandler{
		MessageService: messageService,
	}
}

func (h *MessageHandler) WebsocketConnect(c *gin.Context) {
	// use melody, global websocket
	username := c.GetString("username")
	userID := c.GetInt("userID")
	er := h.MessageService.UpgradeWebsocket(c, username, userID)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
}
