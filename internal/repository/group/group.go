package group

import (
	"errors"

	"ForumChat/internal/infrastructure/database"
	"gorm.io/gorm"
)

// todo dependency injection
type GroupRepostiory interface {
	GetGroupsByUserID(id int) (*[]database.Group, error)
	GetLastReadMessage(groupID int, userID int) (*database.Message, error)
	DeleteGroup(groupID int, userID int) error
	CreateGroup(name string, userID int) error
	UpdateGroup(groupID int, userID int, groupName string) error
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

func (s *groupServiceImpl) DeleteGroup(groupID int, userID int) error {
	// delete group owner_id = userID
	if err := s.db.Where("id = ? and owner_id = ?", groupID, userID).Delete(&database.Group{}).Error; err != nil {
		// if no record found
		if err == gorm.ErrRecordNotFound {
			return errors.New("this is not your group")
		}
		return err
	}
	return nil
}

func (s *groupServiceImpl) CreateGroup(name string, userID int) error {
	var group = database.Group{
		Name:    name,
		OwnerID: uint(userID),
	}
	return s.db.Save(&group).Error
}

func (s *groupServiceImpl) UpdateGroup(groupID int, userID int, groupName string) error {
	// update group owner_id = userID
	if err := s.db.Model(&database.Group{}).Where("id = ? and owner_id = ?", groupID, userID).Update("name", groupName).Error; err != nil {
		// if no record found
		if err == gorm.ErrRecordNotFound {
			return errors.New("this is not your group")
		}
		return err
	}
	return nil
}
