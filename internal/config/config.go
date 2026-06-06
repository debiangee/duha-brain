package config

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig   `mapstructure:"server"`
	Database DatabaseConfig `mapstructure:"database"`
	Logging  LoggingConfig  `mapstructure:"logging"`
}

type ServerConfig struct {
	Port int    `mapstructure:"port"`
	Host string `mapstructure:"host"`
}

type DatabaseConfig struct {
	Path string `mapstructure:"path"`
}

type LoggingConfig struct {
	Level  string `mapstructure:"level"`
	Format string `mapstructure:"format"`
}

// Load reads configuration from environment variables or config file
func Load() (*Config, error) {
	v := viper.New()

	// Set defaults
	v.SetDefault("server.port", 8080)
	v.SetDefault("server.host", "localhost")
	v.SetDefault("database.path", "./data/duha.db")
	v.SetDefault("logging.level", "info")
	v.SetDefault("logging.format", "json")

	// Read from environment variables
	v.AutomaticEnv()
	v.BindEnv("server.port", "DUHA_PORT")
	v.BindEnv("server.host", "DUHA_HOST")
	v.BindEnv("database.path", "DUHA_DB_PATH")
	v.BindEnv("logging.level", "DUHA_LOG_LEVEL")
	v.BindEnv("logging.format", "DUHA_LOG_FORMAT")

	// Try to read from config file if it exists
	configPath := "./config.yaml"
	if _, err := os.Stat(configPath); err == nil {
		v.SetConfigFile(configPath)
		if err := v.ReadInConfig(); err != nil {
			return nil, fmt.Errorf("error reading config file: %w", err)
		}
	}

	// Ensure data directory exists
	dbPath := v.GetString("database.path")
	dbDir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		return nil, fmt.Errorf("error creating database directory: %w", err)
	}

	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("error unmarshaling config: %w", err)
	}

	return &cfg, nil
}
