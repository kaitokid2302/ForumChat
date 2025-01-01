package user

import (
	"errors"

	"ForumChat/internal/repository/user"
	"ForumChat/internal/request"
	"ForumChat/internal/service/jwt"
	"github.com/gin-gonic/gin"
)

type UserService interface {
	RegisterUser(c *gin.Context, request request.RegisterRequest) error
	LoginUser(c *gin.Context, registerRequest request.LoginRequest) (string, uint, error)
	GetUserByID(c *gin.Context, userID int) (string, error)
	GetUserByUsername(c *gin.Context, username string) (int, error)
}

type userServiceImpl struct {
	user.UserRepository
	jwt.JWTservice
}

func (s *userServiceImpl) GetUserByUsername(c *gin.Context, username string) (int, error) {
	user, er := s.UserRepository.GetUserByUsername(username)
	if er != nil {
		return 0, er
	}
	return int(user.ID), nil
}

func NewUserService(userRepository user.UserRepository, jwtService jwt.JWTservice) UserService {
	return &userServiceImpl{
		UserRepository: userRepository,
		JWTservice:     jwtService,
	}
}

func (s *userServiceImpl) GetUserByID(c *gin.Context, userID int) (string, error) {
	user, er := s.UserRepository.GetUserByID(userID)
	if er != nil {
		return "", er
	}
	return user.Username, nil
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

func (s *userServiceImpl) LoginUser(c *gin.Context, registerRequest request.LoginRequest) (string, uint, error) {
	exist, er := s.UserRepository.ExistUserByUsername(registerRequest.Username)
	if er != nil {
		return "", 0, er
	}
	if !exist {
		return "", 0, errors.New("username not exist")
	}
	loginBool, er, user := s.UserRepository.Login(registerRequest.Username, registerRequest.Password)
	if er != nil {
		return "", 0, er
	}
	if !loginBool {
		return "", 0, errors.New("password not correct")
	}
	token := s.JWTservice.CreateToken(registerRequest.Username, int(user.ID))
	return token, user.ID, nil
}
