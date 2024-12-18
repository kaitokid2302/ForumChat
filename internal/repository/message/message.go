package message

import (
	"ForumChat/internal/infrastructure/database"
	"gorm.io/gorm"
)

// todo dependency injection

type MessageRepostiory interface {
	GetMessagesByGroupID(groupID int, size int, offset int) (*[]database.Message, error)
	SaveMessage(groupID int, userID int, text string)
}

type messageServiceImpl struct {
	db *gorm.DB
}

func (s *messageServiceImpl) GetMessagesByGroupID(groupID int, size int, offset int) (*[]database.Message, error) {
	var messages []database.Message
	if err := s.db.Where("group_id = ?", groupID).Order("created_at desc").Limit(size).Offset(offset).Find(&messages).Error; err != nil {
		return nil, err
	}
	return &messages, nil
}

func (s *messageServiceImpl) SaveMessage(groupID int, userID int, text string) {
	var message = database.Message{
		GroupID: uint(groupID),
		UserID:  uint(userID),
		Text:    text,
	}
	s.db.Save(&message)
}
