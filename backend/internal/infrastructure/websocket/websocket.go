package websocket

import "github.com/olahol/melody"

type MessageMessage struct {
	UserID  int    `json:"user_id"`
	Text    string `json:"text"`
	GroupID int    `json:"group_id"`
}

func InitMelody() *melody.Melody {
	m := melody.New()
	return m
}

type GroupMessage struct {
	Type    string `json:"type"` // delete, create, update
	Name    string `json:"name"`
	GroupID int    `json:"group_id"`
	UserID  int    `json:"user_id"`
}
