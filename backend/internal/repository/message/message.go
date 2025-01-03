package message

import (
	"errors"
	"time"

	"ForumChat/internal/infrastructure/database"
	"gorm.io/gorm"
)

type MessageRepostiory interface {
	GetMessagesByGroupID(groupID int, size int, offset int) (*[]database.Message, error)
	SaveMessage(groupID int, userID int, text string) error
	MarkRead(groupID int, userID int, messageID int) error
	CountUnreadMessage(groupID int, userID int, at time.Time) (int, error)
	GetMessagesAfterMessageID(groupID int, messageID int) (*[]database.Message, error)
}

type messageRepositoryImpl struct {
	db *gorm.DB
}

func (s *messageRepositoryImpl) GetMessagesAfterMessageID(groupID int, messageID int) (*[]database.Message, error) {
	var messages []database.Message
	if err := s.db.Where("group_id = ? and id > ?", groupID, messageID).Order("created_at desc").Find(&messages).Error; err != nil {
		return nil, err
	}
	return &messages, nil
}

func (s *messageRepositoryImpl) GetMessagesByGroupID(groupID int, size int, offset int) (*[]database.Message, error) {
	var messages []database.Message
	if err := s.db.Where("group_id = ?", groupID).Order("created_at desc").Limit(size).Offset(offset).Find(&messages).Error; err != nil {
		return nil, err
	}
	return &messages, nil
}

func (s *messageRepositoryImpl) CountUnreadMessage(groupID int, userID int, at time.Time) (int, error) {
	var count int64
	res := s.db.Debug().Table("messages").
		Where("group_id = ? and created_at > ?", groupID, at).
		Count(&count)
	if res.Error != nil {
		return 0, res.Error
	}
	return int(count), nil
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

func (s *messageRepositoryImpl) MarkRead(groupID int, userID int, messageID int) error {
	// user must in group
	var count int64
	res := s.db.Debug().Table("user_groups").Where("user_id = ? and group_id = ?", userID, groupID).Count(&count)
	if res.Error != nil {
		return res.Error
	}
	if count == 0 {
		return errors.New("user not in group")
	}

	// update read table
	// if not exist, create
	read := database.Read{
		UserID:    uint(userID),
		GroupID:   uint(groupID),
		MessageID: uint(messageID),
	}
	return s.db.Save(&read).Error
}
