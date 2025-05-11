package util

import (
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	Environment       string        `mapstructure:"ENVIRONMENT"`
	DBSource          string        `mapstructure:"DB_SOURCE"`
	HTTPAddress       string        `mapstructure:"HTTP_ADDRESS"`
	TokenSymmetricKey string        `mapstructure:"TOKEN_SYMMETRIC_KEY"`
	TokenDuration     time.Duration `mapstructure:"TOKEN_DURATION"`
	GeminiAPIKey      string        `mapstructure:"GEMINI_API_KEY"`
	RazorpayKeyID     string        `mapstructure:"RAZORPAY_KEY_ID"`
	RazorpayKeySecret string        `mapstructure:"RAZORPAY_KEY_SECRET"`
}

func LoadConfig(path string) (config Config, err error) {
	viper.AddConfigPath(path)
	viper.SetConfigName("app")
	viper.SetConfigType("env")
	viper.AutomaticEnv()

	if err = viper.ReadInConfig(); err != nil {
		return
	}

	err = viper.Unmarshal(&config)
	return
}
