package database

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Username string     `gorm:"unique" json:"username,omitempty" binding:"required"`
	Password string     `json:"password,omitempty" gorm:"not null" binding:"required"`
	Groups   *[]Group   `json:"groups,omitempty" gorm:"many2many:user_groups;"`
	Messages *[]Message `json:"messages,omitempty"`
	Reads    *[]Read    `json:"reads,omitempty"`
}

type Group struct {
	gorm.Model
	Name     string     `json:"name,omitempty" binding:"required"`
	Users    *[]User    `json:"users,omitempty" gorm:"many2many:user_groups;"`
	Messages *[]Message `json:"messages,omitempty"`
	Reads    *[]Read    `json:"reads,omitempty"`
}

type Message struct {
	gorm.Model
	Text    string  `json:"text,omitempty" binding:"required"`
	User    *User   `json:"user,omitempty"`
	Group   *Group  `json:"group,omitempty"`
	UserID  uint    `json:"user_id,omitempty"`
	GroupID uint    `json:"group_id,omitempty"`
	Reads   *[]Read `json:"reads,omitempty"`
}

type Read struct {
	gorm.Model
	UserID    uint `json:"user_id,omitempty"`
	GroupID   uint `json:"group_id,omitempty"`
	MessageID uint `json:"message_id,omitempty"`
}
