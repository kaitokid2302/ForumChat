package message

import (
	"encoding/json"

	"ForumChat/internal/infrastructure/database"
	"ForumChat/internal/infrastructure/websocket"
	"ForumChat/internal/repository/message"
	"github.com/gin-gonic/gin"
	"github.com/olahol/melody"
)

// todo dependency injection

type MessageService interface {
	GetMessagesByGroupID(c *gin.Context, groupID int, size int, offset int) (*[]database.Message, error)
	UpgradeWebsocket(c *gin.Context, username string, userID int) error
}

type messageServiceImpl struct {
	melody *melody.Melody
	message.MessageRepostiory
}

func (s *messageServiceImpl) GetMessagesByGroupID(c *gin.Context, groupID int, size int, offset int) (*[]database.Message, error) {
	return s.MessageRepostiory.GetMessagesByGroupID(groupID, size, offset)
}

func (s *messageServiceImpl) UpgradeWebsocket(c *gin.Context, username string, userID int) error {
	return s.melody.HandleRequestWithKeys(
		c.Writer,
		c.Request,
		map[string]interface{}{
			"username": username,
			"userID":   userID,
		})
}

func NewMessageService(m *melody.Melody, messageRepository message.MessageRepostiory) MessageService {
	s := &messageServiceImpl{
		melody:            m,
		MessageRepostiory: messageRepository,
	}

	m.HandleConnect(s.HandleConnect)
	m.HandleMessage(s.HandleMessage)
	return s
}

func (s *messageServiceImpl) HandleConnect(m *melody.Session) {
	username, ok := m.Keys["username"].(string)
	if !ok {
		m.Close()
		return
	}
	userID, ok := m.Keys["userID"].(int)
	if !ok {
		m.Close()
		return
	}
	m.Set("userID", userID)
	m.Set("username", username)
}

func (s *messageServiceImpl) HandleMessage(m *melody.Session, msg []byte) {
	var payload websocket.MessageMessage
	er := json.Unmarshal(msg, &payload)
	if er != nil {
		m.Close()
		return
	}
	userIDCheck, exist := m.Get("userID")
	if !exist {
		m.Close()
		return
	}
	userIDCheckint, ok := userIDCheck.(int)
	if !ok {
		m.Close()
		return
	}
	if userIDCheckint != payload.UserID {
		m.Close()
		return
	}
	// save to db
	s.MessageRepostiory.SaveMessage(payload.GroupID, payload.UserID, payload.Text)
	s.melody.Broadcast(msg)
}
