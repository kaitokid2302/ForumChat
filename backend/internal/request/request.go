package request

type RegisterRequest struct {
	Username string `json:"username" binding:"required" form:"username"`
	Password string `json:"password" binding:"required" form:"password"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required" form:"username"`
	Password string `json:"password" binding:"required" form:"password"`
}

type MessageRequest struct {
	Size   int `json:"size" form:"size"`
	Offset int `json:"offset" form:"offset"`
}
