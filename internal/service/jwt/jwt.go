package jwt

import (
	"errors"
	"fmt"
	"time"

	"ForumChat/internal/infrastructure/config"
	"github.com/golang-jwt/jwt"
)

type JWTservice interface {
	CreateToken(username string, userID int) string
	Token(tokenIn string) (bool, string, int)
}

type JWTServiceImpl struct{}

func (x *JWTServiceImpl) CreateToken(username string, userID int) string {
	var key = config.Global.Key
	var t *jwt.Token = jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"iss":      "mra2322001",
		"role":     "user",
		"exp":      time.Now().Add(time.Hour * 24 * 60).Unix(),
		"username": username,
		"userID":   userID,
	})
	s, _ := t.SignedString([]byte(key))
	return s
}

func (x *JWTServiceImpl) Token(tokenIn string) (bool, string, int) {
	key := config.Global.Key
	token, er := jwt.Parse(tokenIn, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("can not decode")
		}
		return []byte(key), nil
	})
	if er != nil {
		return false, "", -1
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		return true, fmt.Sprintf("%v", claims["username"]), int(claims["userID"].(float64))
	} else {
		return false, "", -1
	}
}

func NewJWTService() JWTservice {
	return &JWTServiceImpl{}
}
