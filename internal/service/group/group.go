package group

import (
	"encoding/json"

	"ForumChat/internal/infrastructure/database"
	"ForumChat/internal/infrastructure/websocket"
	"ForumChat/internal/repository/group"
	"ForumChat/internal/repository/message"
	"github.com/gin-gonic/gin"
	"github.com/olahol/melody"
)

// todo dependency injection
type GroupService interface {
	GetGroupsByUserID(c *gin.Context, userID int) (*[]database.Group, error)
	GetLastReadMessage(c *gin.Context, groupID int, userID int) (*database.Message, error)
	UpgradeWebsocket(c *gin.Context, username string) error
}

type groupServiceImpl struct {
	group.GroupRepostiory
	message.MessageRepostiory
	melody *melody.Melody
}

func (s *groupServiceImpl) GetGroupsByUserID(c *gin.Context, userID int) (*[]database.Group, error) {
	return s.GroupRepostiory.GetGroupsByUserID(userID)
}

func (s *groupServiceImpl) GetLastReadMessage(c *gin.Context, groupID int, userID int) (*database.Message, error) {
	return s.GroupRepostiory.GetLastReadMessage(groupID, userID)
}

func (s *groupServiceImpl) UpgradeWebsocket(c *gin.Context, username string) error {
	return s.melody.HandleRequestWithKeys(c.Writer, c.Request, map[string]interface{}{"username": username})
}

func NewGroupService(groupRepository group.GroupRepostiory, messageRepository message.MessageRepostiory, m *melody.Melody) GroupService {
	s := &groupServiceImpl{
		GroupRepostiory:   groupRepository,
		MessageRepostiory: messageRepository,
		melody:            m,
	}

	s.melody.HandleConnect(s.HandleConnect)
	s.melody.HandleMessage(s.HandleMessage)
	return s
}

func (s *groupServiceImpl) HandleConnect(m *melody.Session) {
	username, ok := m.Keys["username"].(string)
	if !ok {
		m.Close()
		return
	}
	m.Set("username", username)
}

func (s *groupServiceImpl) HandleMessage(m *melody.Session, msg []byte) {
	var payload websocket.GroupMessage
	er := json.Unmarshal(msg, &payload)
	if er != nil {
		m.Close()
		return
	}
	username := m.Get()
	if payload.Type == "delete" {
		er := s.GroupRepostiory.DeleteGroup
	}
}
