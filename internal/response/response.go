package response

import "github.com/gin-gonic/gin"

var (
	Success             = 200
	Fail                = 400
	NotFound            = 404
	InternalServerError = 500
	JWTVerifyFail       = 401
)

var msg = map[int]string{
	Success:             "Success",
	NotFound:            "Not Found",
	InternalServerError: "Internal Server Error",
	Fail:                "Fail",
	JWTVerifyFail:       "JWT Verify Fail",
}

type ReponseStruct struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func ReponseOutput(c *gin.Context, code int, message string, data interface{}) {
	if message == "" {
		message = msg[code]
	}
	reponse := ReponseStruct{
		Code:    code,
		Message: message,
		Data:    data,
	}
	c.JSON(200, reponse)
}

type LoginResponse struct {
	token string `json:"token"`
}
