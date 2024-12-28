package message

import (
	"encoding/json"

	"ForumChat/internal/infrastructure/database"
	"ForumChat/internal/infrastructure/websocket"
	"ForumChat/internal/repository/message"
	"github.com/gin-gonic/gin"
	"github.com/olahol/melody"
)

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

	s.melody.HandleConnect(s.HandleConnect)
	s.melody.HandleMessage(s.HandleMessage)
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
	er = s.MessageRepostiory.SaveMessage(payload.GroupID, payload.UserID, payload.Text)
	lastestMessage, er2 := s.GetMessagesByGroupID(nil, payload.GroupID, 1, 0)
	if er2 != nil {
		m.Write([]byte("can not get lastest message"))
		return
	}
	if er != nil {
		m.Write([]byte("can not send message"))
		return
	}
	newMsg := websocket.MessageMessage{
		UserID:    payload.UserID,
		Text:      payload.Text,
		GroupID:   payload.GroupID,
		MessageID: int((*lastestMessage)[0].ID),
	}
	msg, _ = json.Marshal(newMsg)
	s.melody.Broadcast(msg)
}
