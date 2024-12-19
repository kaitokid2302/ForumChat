package message

import (
	"ForumChat/internal/infrastructure/database"
	"gorm.io/gorm"
)

type MessageRepostiory interface {
	GetMessagesByGroupID(groupID int, size int, offset int) (*[]database.Message, error)
	SaveMessage(groupID int, userID int, text string) error
}

type messageRepositoryImpl struct {
	db *gorm.DB
}

func (s *messageRepositoryImpl) GetMessagesByGroupID(groupID int, size int, offset int) (*[]database.Message, error) {
	var messages []database.Message
	if err := s.db.Where("group_id = ?", groupID).Order("created_at desc").Limit(size).Offset(offset).Find(&messages).Error; err != nil {
		return nil, err
	}
	return &messages, nil
}

func NewMessageRepository(db *gorm.DB) MessageRepostiory {
	return &messageRepositoryImpl{db: db}
}

func (s *messageRepositoryImpl) SaveMessage(groupID int, userID int, text string) error {
	var message = database.Message{
		GroupID: uint(groupID),
		UserID:  uint(userID),
		Text:    text,
	}
	return s.db.Save(&message).Error

}
