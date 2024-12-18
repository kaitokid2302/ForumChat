package config

var (
	Global Config
)

type Config struct {
	Database
	GoogleEmail `mapstructure:"google_email"`
	Redis
	JWT
	AWS
	Crobjob `mapstructure:"crobjob"`
	Elastic `mapstructure:"elastic"`
	AI      `mapstructure:"ai"`
	Prompt  string `mapstructure:"prompt"`
}

type AI struct {
	Provider []Provider `mapstructure:"provider"`
}

type Provider struct {
	Name   string `mapstructure:"name"`
	ApiKey string `mapstructure:"apikey"`
}

type Elastic struct {
	IndexName string `mapstructure:"index_name"`
	Host      string `mapstructure:"host"`
	Port      int    `mapstructure:"port"`
}

type Crobjob struct {
	Time int `mapstructure:"time"`
}

type GoogleEmail struct {
	AppPassword string `mapstructure:"app_password"`
	From        string `mapstructure:"from"`
}

type JWT struct {
	Key string
}

type Database struct {
	Host     string
	Port     int
	User     string
	Password string
	Database string
}

type Redis struct {
	Host string
	Port int
}

type AWS struct {
	PublicAccessKey  string `mapstructure:"public_access_key"`
	PrivateAccessKey string `mapstructure:"private_access_key"`
	Region           string `mapstructure:"region"`
	Bucket           string `mapstructure:"bucket"`
}
