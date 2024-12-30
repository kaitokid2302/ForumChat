package group

import (
	"encoding/json"
	"errors"

	"ForumChat/internal/infrastructure/database"
	"ForumChat/internal/infrastructure/websocket"
	"ForumChat/internal/repository/group"
	"ForumChat/internal/repository/message"
	"github.com/gin-gonic/gin"
	"github.com/olahol/melody"
	"gorm.io/gorm"
)

type GroupService interface {
	GetGroupsByUserID(c *gin.Context, userID int) (*[]database.Group, error)
	GetLastReadMessage(c *gin.Context, groupID int, userID int) (*database.Message, error)
	UpgradeWebsocket(c *gin.Context, username string, userID int) error
	GetUsersInAGroup(c *gin.Context, groupID int) (*[]database.User, error)
	MarkRead(c *gin.Context, groupID int, userID int, messageID int) error
	GetAllGroups(c *gin.Context, size int, offset int) (*[]database.Group, error)
	CountUnreadMessage(c *gin.Context, groupID int, userID int) (int, error)
	GetAllMessageUnread(c *gin.Context, groupID int) (*[]database.Message, error)
	GetUnjoinedGroup(c *gin.Context, userID int) (*[]database.Group, error)
	GetOwnerGroup(c *gin.Context, groupID int) (string, error)
}

type groupServiceImpl struct {
	group.GroupRepostiory
	message.MessageRepostiory
	melody *melody.Melody
}

func (s *groupServiceImpl) GetAllGroups(c *gin.Context, size int, offset int) (*[]database.Group, error) {
	return s.GroupRepostiory.GetAllGroups(size, offset)
}

func (s *groupServiceImpl) GetOwnerGroup(c *gin.Context, groupID int) (string, error) {
	return s.GroupRepostiory.GetOwnerGroup(groupID)
}

func (s *groupServiceImpl) GetUnjoinedGroup(c *gin.Context, userID int) (*[]database.Group, error) {
	return s.GroupRepostiory.GetUnjoinedGroup(userID)
}

func (s *groupServiceImpl) GetAllMessageUnread(c *gin.Context, groupID int) (*[]database.Message, error) {
	// get last read message
	userID := c.GetInt("userID")
	lastReadMessage, er := s.GetLastReadMessage(c, groupID, userID)
	if er != nil {
		return nil, er
	}
	return s.MessageRepostiory.GetMessagesAfterMessageID(groupID, int(lastReadMessage.ID))
}
func (s *groupServiceImpl) CountUnreadMessage(c *gin.Context, groupID int, userID int) (int, error) {
	// get last read message
	lastReadMessage, er := s.GroupRepostiory.GetLastReadMessage(groupID, userID)
	if lastReadMessage == nil {
		return 0, nil
	}

	// count created_at > last_read_message.created_at
	count, er := s.MessageRepostiory.CountUnreadMessage(groupID, userID, lastReadMessage.CreatedAt)
	if er != nil {
		return 0, er
	}
	return count, nil
}

func (s *groupServiceImpl) GetUsersInAGroup(c *gin.Context, groupID int) (*[]database.User, error) {
	return s.GroupRepostiory.GetUsersInAGroup(groupID)
}

func (s *groupServiceImpl) MarkRead(c *gin.Context, groupID int, userID int, messageID int) error {
	// if already read id > messageID, then return
	lastReadMessage, er := s.GroupRepostiory.GetLastReadMessage(groupID, userID)
	if errors.Is(er, gorm.ErrRecordNotFound) {
		// mark read
		return s.MessageRepostiory.MarkRead(groupID, userID, messageID)
	}
	if er != nil {
		return er
	}
	if lastReadMessage != nil && int(lastReadMessage.ID) > messageID {
		return nil
	}
	// mark read
	return s.MessageRepostiory.MarkRead(groupID, userID, messageID)
}

func (s *groupServiceImpl) GetGroupsByUserID(c *gin.Context, userID int) (*[]database.Group, error) {
	return s.GroupRepostiory.GetGroupsByUserID(userID)
}

func (s *groupServiceImpl) GetLastReadMessage(c *gin.Context, groupID int, userID int) (*database.Message, error) {
	return s.GroupRepostiory.GetLastReadMessage(groupID, userID)
}

func (s *groupServiceImpl) UpgradeWebsocket(c *gin.Context, username string, userID int) error {
	return s.melody.HandleRequestWithKeys(c.Writer, c.Request, map[string]interface{}{"username": username, "userID": userID})
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
	userID, ok := m.Keys["userID"].(int)
	if !ok {
		m.Close()
		return
	}
	m.Set("userID", userID)
	m.Set("username", username)
}

func (s *groupServiceImpl) HandleMessage(m *melody.Session, msg []byte) {
	var payload websocket.GroupMessage
	er := json.Unmarshal(msg, &payload)
	if er != nil {
		m.Close()
		return
	}
	userIDAny, _ := m.Get("userID")
	userID := userIDAny.(int)
	if payload.Type == "delete" {
		er := s.GroupRepostiory.DeleteGroup(payload.GroupID, userID)
		if er != nil {
			// write back to client
			m.Write([]byte(er.Error()))
			return
		}
		// write back to client
		var addUserID websocket.GroupMessage
		er = json.Unmarshal(msg, &addUserID)
		if er != nil {
			m.Write([]byte(er.Error()))
			return
		}
		addUserID.UserID = userID
		msg, _ := json.Marshal(addUserID)
		s.melody.Broadcast(msg)
		return
	}
	if payload.Type == "create" {
		groupID, er := s.GroupRepostiory.CreateGroup(payload.Name, userID)
		if er != nil {
			// write back to client
			m.Write([]byte(er.Error()))
			return
		}
		// write back to client
		payload.GroupID = groupID
		payload.UserID = userID
		msg, _ := json.Marshal(payload)
		s.melody.Broadcast(msg)
		return
	}
	// update name
	if payload.Type == "update" {
		// update name
		er := s.GroupRepostiory.UpdateGroup(payload.GroupID, userID, payload.Name)
		if er != nil {
			// write back to client
			m.Write([]byte(er.Error()))
			return
		}
		// write back to client
		var addUserID websocket.GroupMessage
		er = json.Unmarshal(msg, &addUserID)
		if er != nil {
			m.Write([]byte(er.Error()))
			return
		}
		addUserID.UserID = userID
		msg, _ := json.Marshal(addUserID)
		s.melody.Broadcast(msg)
		return
	}
	// join

	if payload.Type == "join" {
		er := s.GroupRepostiory.JoinGroup(payload.GroupID, userID)
		if er != nil {
			// write back to client
			m.Write([]byte(er.Error()))
			return
		}
		// last message, then mark read this message

		lastMessage, er := s.GroupRepostiory.GetLastMessage(payload.GroupID)
		if er != nil {
			// write back to client
			m.Write([]byte(er.Error()))
			return
		}
		er = s.MessageRepostiory.MarkRead(payload.GroupID, userID, int(lastMessage.ID))
		if er != nil {
			// write back to client
			m.Write([]byte(er.Error()))
			return
		}
		var addUserID websocket.GroupMessage
		er = json.Unmarshal(msg, &addUserID)
		if er != nil {
			m.Write([]byte(er.Error()))
			return
		}
		addUserID.UserID = userID
		msg, _ := json.Marshal(addUserID)
		// write back to client
		s.melody.Broadcast(msg)
		return
	}

	if payload.Type == "leave" {
		er := s.GroupRepostiory.LeaveGroup(payload.GroupID, userID)
		if er != nil {
			// write back to client
			m.Write([]byte(er.Error()))
			return
		}
		// write back to client
		var addUserID websocket.GroupMessage
		er = json.Unmarshal(msg, &addUserID)
		if er != nil {
			m.Write([]byte(er.Error()))
			return
		}
		addUserID.UserID = userID
		msg, _ := json.Marshal(addUserID)
		s.melody.Broadcast(msg)
		return

	}
	// leave
}
