package user

import (
	"errors"

	"ForumChat/internal/repository/user"
	"ForumChat/internal/request"
	"ForumChat/internal/service/jwt"
	"github.com/gin-gonic/gin"
)

// todo dependency injection

type UserService interface {
	RegisterUser(c *gin.Context, request request.RegisterRequest) error
	LoginUser(c *gin.Context, registerRequest request.LoginRequest) (string, error)
}

type userServiceImpl struct {
	user.UserRepository
	jwt.JWTservice
}

func (s *userServiceImpl) RegisterUser(c *gin.Context, request request.RegisterRequest) error {
	exist, er := s.UserRepository.ExistUserByUsername(request.Username)
	if er != nil {
		return er
	}
	if exist {
		return errors.New("username exist")
	}
	return s.UserRepository.InsertUser(request.Username, request.Password)
}

func (s *userServiceImpl) LoginUser(c *gin.Context, registerRequest request.LoginRequest) (string, error) {
	exist, er := s.UserRepository.ExistUserByUsername(registerRequest.Username)
	if er != nil {
		return "", er
	}
	if !exist {
		return "", errors.New("username not exist")
	}
	loginBool, er, user := s.UserRepository.Login(registerRequest.Username, registerRequest.Password)
	if er != nil {
		return "", er
	}
	if !loginBool {
		return "", errors.New("password not correct")
	}
	token := s.JWTservice.CreateToken(registerRequest.Username, int(user.ID))
	return token, nil
}
