package user

import (
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
	token, er := h.UserService.LoginUser(c, input)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	response.ReponseOutput(c, response.Success, "", token)
}
