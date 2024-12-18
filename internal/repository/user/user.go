package user

import (
	"errors"

	"ForumChat/internal/infrastructure/database"
	"gorm.io/gorm"
)

// todo dependency injection

type UserRepository interface {
	ExistUserByUsername(username string) (bool, error)
	InsertUser(username string, password string) error
	Login(username string, password string) (bool, error, *database.User)
}

type userServiceImpl struct {
	db *gorm.DB
}

func (s *userServiceImpl) ExistUserByUsername(username string) (bool, error) {
	var count int64
	er := s.db.Model(&database.User{}).Where("username = ?", username).Count(&count).Error
	if er != nil {
		return false, er
	}
	return count > 0, nil
}

func (s *userServiceImpl) InsertUser(username string, password string) error {
	var user = database.User{
		Username: username,
		Password: password,
	}
	return s.db.Save(&user).Error
}

func (s *userServiceImpl) Login(username string, password string) (bool, error, *database.User) {
	var user database.User
	er := s.db.Where("username = ? AND password = ?", username, password).First(&user).Error
	if er != nil {
		if er == gorm.ErrRecordNotFound {
			return false, errors.New("password or username not exist"), nil
		}
		return false, er, nil
	}
	user.Password = ""
	return true, nil, &user
}
