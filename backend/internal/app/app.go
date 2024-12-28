package app

import (
	"time"

	group3 "ForumChat/internal/handler/group"
	message3 "ForumChat/internal/handler/message"
	user3 "ForumChat/internal/handler/user"
	"ForumChat/internal/infrastructure/config"
	"ForumChat/internal/infrastructure/database"
	"ForumChat/internal/infrastructure/websocket"
	middleware2 "ForumChat/internal/middleware"
	"ForumChat/internal/repository/group"
	message2 "ForumChat/internal/repository/message"
	"ForumChat/internal/repository/user"
	group2 "ForumChat/internal/service/group"
	"ForumChat/internal/service/jwt"
	"ForumChat/internal/service/message"
	user2 "ForumChat/internal/service/user"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func Run() {
	config.InitAll()
	db := database.InitDatabase()
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Thêm origin của frontend
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	melodyMessageService := websocket.InitMelody()
	melodyGroupService := websocket.InitMelody()

	userGroup := r.Group("/user")
	groupGroup := r.Group("/group")
	messageGroup := r.Group("/message")

	jwtService := jwt.NewJWTService()
	middleware := middleware2.NewAuth(jwtService)
	userRepo := user.NewUserRepository(db)
	messageRepository := message2.NewMessageRepository(db)
	groupRepository := group.NewGroupRepository(db)
	userService := user2.NewUserService(userRepo, jwtService)
	messageService := message.NewMessageService(melodyMessageService, messageRepository)
	groupService := group2.NewGroupService(groupRepository, messageRepository, melodyGroupService)

	// middleware
	groupGroup.Use(middleware.JWTverify())
	messageGroup.Use(middleware.JWTverify())

	userHandler := user3.NewUserHandler(userService)
	messageHandler := message3.NewMessageHandler(messageService)
	groupHandler := group3.NewGroupHandler(groupService, messageService)

	userHandler.InitRoute(userGroup)
	messageHandler.InitRoute(messageGroup)
	groupHandler.InitRoute(groupGroup)

	r.Run(":8080")
}
