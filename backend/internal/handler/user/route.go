package user

import "github.com/gin-gonic/gin"

func (h *UserHandler) InitRoute(r *gin.RouterGroup) {
	r.POST("/register", h.RegisterUser)
	r.POST("/login", h.LoginUser)
	r.GET("/user/:userID", h.GetUserByID)
	r.GET("/user/username/:username", h.GetUserByUsername)
}
