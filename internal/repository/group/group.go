package group

import (
	"ForumChat/internal/infrastructure/database"
	"gorm.io/gorm"
)

// todo dependency injection
type GroupRepostiory interface {
	GetGroupsByUserID(id int) (*[]database.Group, error)
	GetLastReadMessage(groupID int, userID int) (*database.Message, error)
}

type groupServiceImpl struct {
	db *gorm.DB
}

func (s *groupServiceImpl) GetGroupsByUserID(id int) (*[]database.Group, error) {
	var user database.User
	if err := s.db.Preload("Groups").First(&user, id).Error; err != nil {
		return nil, err
	}
	return user.Groups, nil
}

func (s *groupServiceImpl) GetLastReadMessage(groupID int, userID int) (*database.Message, error) {
	// read table
	var read database.Read
	if err := s.db.Where("group_id = ? and user_id = ?", groupID, userID).First(&read).Error; err != nil {
		return nil, err
	}
	// find message
	var message database.Message
	if err := s.db.Where("id = ?", read.MessageID).First(&message).Error; err != nil {
		return nil, err
	}
	return &message, nil
}
