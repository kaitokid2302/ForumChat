package middleware

import (
	"ForumChat/internal/response"
	"ForumChat/internal/service/jwt"
	"github.com/gin-gonic/gin"
)

type Auth struct {
	jwtService jwt.JWTservice
}

func NewAuth(jwtService jwt.JWTservice) *Auth {
	return &Auth{
		jwtService: jwtService,
	}
}

func (a *Auth) JWTverify() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			response.ReponseOutput(c, response.JWTVerifyFail, "", nil)
			c.Abort()
			return
		}

		ok, username, userID := a.jwtService.Token(token)
		if !ok {
			response.ReponseOutput(c, response.JWTVerifyFail, "", nil)
			c.Abort()
			return
		}
		c.Set("username", username)
		c.Set("userID", userID)
		c.Next()
	}
}
