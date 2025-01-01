package user

import (
	"strconv"

	"ForumChat/internal/request"
	"ForumChat/internal/response"
	"ForumChat/internal/service/user"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	user.UserService
}

func NewUserHandler(userService user.UserService) *UserHandler {
	return &UserHandler{
		UserService: userService,
	}
}

func (h *UserHandler) RegisterUser(c *gin.Context) {
	var input request.RegisterRequest
	if er := c.ShouldBind(&input); er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	er := h.UserService.RegisterUser(c, input)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	response.ReponseOutput(c, response.Success, "", nil)
}

func (h *UserHandler) LoginUser(c *gin.Context) {
	var input request.LoginRequest
	if er := c.ShouldBind(&input); er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	token, userID, er := h.UserService.LoginUser(c, input)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	response.ReponseOutput(c, response.Success, "", gin.H{
		"token":  token,
		"userID": userID,
	})

}

func (h *UserHandler) GetUserByID(c *gin.Context) {
	userIDString := c.Param("userID")
	userID, er := strconv.Atoi(userIDString)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	user, er := h.UserService.GetUserByID(c, userID)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	response.ReponseOutput(c, response.Success, "", user)
}

func (h *UserHandler) GetUserByUsername(c *gin.Context) {
	username := c.Param("username")
	user, er := h.UserService.GetUserByUsername(c, username)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	response.ReponseOutput(c, response.Success, "", user)
}
