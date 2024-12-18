package app

import (
	"ForumChat/internal/infrastructure/config"
	"ForumChat/internal/infrastructure/database"
)

func Run() {
	config.InitAll()
	_ = database.InitDatabase()
}
