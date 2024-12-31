package config

import (
	"fmt"

	"github.com/spf13/viper"
)

func ViperInit() {

	viper.SetConfigName("local")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./internal/infrastructure/config")

	err := viper.ReadInConfig()
	if err != nil {
		panic(err)
	}
	if err = viper.Unmarshal(&Global); err != nil {
		panic(err)
	}

	fmt.Printf("Global: %+v\n", Global)
}
