package group

import (
	"errors"

	"ForumChat/internal/infrastructure/database"
	"gorm.io/gorm"
)

type GroupRepostiory interface {
	GetGroupsByUserID(id int) (*[]database.Group, error)
	GetLastReadMessage(groupID int, userID int) (*database.Message, error)
	DeleteGroup(groupID int, userID int) error
	CreateGroup(name string, userID int) (int, error)
	UpdateGroup(groupID int, userID int, groupName string) error
	JoinGroup(groupID int, userID int) error
	LeaveGroup(groupID int, userID int) error
	GetUsersInAGroup(groupID int) (*[]database.User, error)
	GetAllGroups(size int, offset int) (*[]database.Group, error)
	GetUnjoinedGroup(userID int) (*[]database.Group, error)
	GetLastMessage(groupID int) (*database.Message, error)
}

type groupRepositoryImp struct {
	db *gorm.DB
}

func (s *groupRepositoryImp) GetAllGroups(size int, offset int) (*[]database.Group, error) {
	var groups []database.Group
	if err := s.db.Limit(size).Offset(offset).Find(&groups).Error; err != nil {
		return nil, err
	}
	return &groups, nil
}

func (s *groupRepositoryImp) GetLastMessage(groupID int) (*database.Message, error) {
	// sort by created_at desc
	var message database.Message
	if err := s.db.Where("group_id = ?", groupID).Order("created_at desc").First(&message).Error; err != nil {
		return nil, err
	}
	return &message, nil
}

func (s *groupRepositoryImp) GetUnjoinedGroup(userID int) (*[]database.Group, error) {
	// join not in groups and user_groups and groups.deleted_at is null
	var groups []database.Group = make([]database.Group, 0)
	if err := s.db.Raw("select * from groups where id not in (select group_id from user_groups where user_id = ?) and deleted_at is null", userID).Scan(&groups).Error; err != nil {
		return nil, err
	}
	return &groups, nil
}

func (s *groupRepositoryImp) GetUsersInAGroup(groupID int) (*[]database.User, error) {
	var group database.Group
	if err := s.db.Preload("Users").First(&group, groupID).Error; err != nil {
		return nil, err
	}
	return group.Users, nil
}

func NewGroupRepository(db *gorm.DB) GroupRepostiory {
	return &groupRepositoryImp{db: db}
}

func (s *groupRepositoryImp) GetGroupsByUserID(id int) (*[]database.Group, error) {
	var user database.User
	if err := s.db.Preload("Groups").First(&user, id).Error; err != nil {
		return nil, err
	}
	return user.Groups, nil
}

func (s *groupRepositoryImp) GetLastReadMessage(groupID int, userID int) (*database.Message, error) {
	// read table
	var read database.Read
	if err := s.db.Where("group_id = ? and user_id = ?", groupID, userID).Last(&read).Error; err != nil {
		return nil, err
	}
	// find message
	var message database.Message
	if err := s.db.Where("id = ?", read.MessageID).First(&message).Error; err != nil {
		return nil, err
	}
	return &message, nil
}

func (s *groupRepositoryImp) DeleteGroup(groupID int, userID int) error {
	// delete group owner_id = userID
	result := s.db.Debug().Where("id = ? and owner_id = ?", groupID, userID).Delete(&database.Group{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("this is not your group")
	}
	return nil
}

func (s *groupRepositoryImp) CreateGroup(name string, userID int) (int, error) {
	var group = database.Group{
		Name:    name,
		OwnerID: uint(userID),
	}
	if err := s.db.Create(&group).Error; err != nil {
		return 0, err
	}
	// join group
	if err := s.db.Exec("insert into user_groups (user_id, group_id) values (?, ?)", userID, group.ID).Error; err != nil {
		return 0, err
	}
	return int(group.ID), nil
}

func (s *groupRepositoryImp) UpdateGroup(groupID int, userID int, groupName string) error {
	// check if user is owner
	var group database.Group
	if err := s.db.Where("id = ? and owner_id = ?", groupID, userID).First(&group).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("you are not the owner of this group")
		} else {
			return err
		}
	}
	// update group
	group = database.Group{}
	res := s.db.Debug().Exec("update groups set name = ? where id = ?", groupName, groupID)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return errors.New("group not found")
	}
	return nil
}

func (s *groupRepositoryImp) JoinGroup(groupID int, userID int) error {
	// check table user_groups, not in model
	var count int64
	res := s.db.Debug().Table("user_groups").Where("user_id = ? and group_id = ?", userID, groupID).Count(&count)
	er := res.Error
	if er == gorm.ErrRecordNotFound || count == 0 {
		// join group
		if er := s.db.Exec("insert into user_groups (user_id, group_id) values (?, ?)", userID, groupID).Error; er != nil {
			return er
		}
		return nil
	}
	// if already join
	return errors.New("you already join this group")
}

func (s *groupRepositoryImp) LeaveGroup(groupID int, userID int) error {
	var count int64
	res := s.db.Debug().Table("user_groups").Where("user_id = ? and group_id = ?", userID, groupID).Count(&count)
	er := res.Error
	if er == gorm.ErrRecordNotFound || count == 0 {
		return errors.New("you are not in this group")
	}
	// if user is owner, return you can not leave, you are owner, you can only delete group
	var group database.Group
	if er := s.db.Where("id = ? and owner_id = ?", groupID, userID).First(&group).Error; er == nil {
		if errors.Is(er, gorm.ErrRecordNotFound) {
			// not the owner
		} else {
			return errors.New("you are the owner of this group, you can not leave, you can only delete group")
		}
	}
	if er := s.db.Exec("delete from user_groups where user_id = ? and group_id = ?", userID, groupID).Error; er != nil {
		return er
	}
	return nil
}
