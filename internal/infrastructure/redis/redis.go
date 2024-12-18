package redis

import (
	"context"
	"fmt"

	"ForumChat/internal/infrastructure/config"

	"github.com/redis/go-redis/v9"
)

func InitRedis() *redis.Client {
	ctx := context.Background()
	client := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%v:%v", config.Global.Redis.Host, config.Global.Redis.Port),
		Password: "",
		DB:       0,
	})
	er := client.Ping(ctx).Err()
	if er != nil {
		panic(er)
	}
	return client
}
