package database

import (
	"fmt"

	"ForumChat/internal/infrastructure/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDatabase() *gorm.DB {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d", config.Global.Database.Host, config.Global.Database.User, config.Global.Database.Password, config.Global.Database.Database, config.Global.Database.Port)
	db, er := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if er != nil {
		panic(er)
	}
	err := db.AutoMigrate(&User{}, &Group{}, &Message{}, &Read{})
	if err != nil {
		return nil
	}
	return db
}
