package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pawaspy/VitaReach/api"
	db "github.com/pawaspy/VitaReach/db/sqlc"
	"github.com/pawaspy/VitaReach/util"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	// Try loading config from file first
	config, err := util.LoadConfig(".")

	// If file loading fails, use environment variables
	if err != nil {
		log.Info().Msg("Config file not found, using environment variables")

		// Parse token duration with fallback
		tokenDuration := 24 * time.Hour
		if os.Getenv("TOKEN_DURATION") != "" {
			parsed, err := time.ParseDuration(os.Getenv("TOKEN_DURATION"))
			if err == nil {
				tokenDuration = parsed
			}
		}

		// Get HTTP address - FIXED PORT HANDLING
		httpAddress := os.Getenv("HTTP_ADDRESS")
		if httpAddress == "" {
			port := os.Getenv("PORT")
			if port == "" {
				port = "3000" // Default fallback port
			}
			httpAddress = fmt.Sprintf("0.0.0.0:%s", port)
		}

		// Create config from environment variables
		config = util.Config{
			Environment:       os.Getenv("ENVIRONMENT"),
			DBSource:          os.Getenv("DB_SOURCE"),
			HTTPAddress:       httpAddress,
			TokenSymmetricKey: os.Getenv("TOKEN_SYMMETRIC_KEY"),
			TokenDuration:     tokenDuration,
			GeminiAPIKey:      os.Getenv("GEMINI_API_KEY"),
			RazorpayKeyID:     os.Getenv("RAZORPAY_KEY_ID"),
			RazorpayKeySecret: os.Getenv("RAZORPAY_KEY_SECRET"),
		}

		log.Info().
			Str("environment", config.Environment).
			Str("httpAddress", config.HTTPAddress).
			Str("razorpayKeyID", config.RazorpayKeyID[:4]+"..."+config.RazorpayKeyID[len(config.RazorpayKeyID)-4:]).
			Msg("Config loaded from environment variables")
	}

	if config.Environment == "development" {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	}

	// Validate minimum required configuration
	if config.DBSource == "" {
		log.Fatal().Msg("Database connection string is required")
	}

	if config.TokenSymmetricKey == "" {
		log.Fatal().Msg("Token symmetric key is required")
	}

	if config.RazorpayKeyID == "" || config.RazorpayKeySecret == "" {
		log.Fatal().Msg("Razorpay credentials are required")
	}

	log.Info().Msg("Connecting to database...")
	connPool, err := pgxpool.New(context.Background(), config.DBSource)
	if err != nil {
		log.Fatal().Err(err).Msg("Cannot connect to database")
	}

	store := db.NewStore(connPool)
	runGinServer(config, store)
}

func runGinServer(config util.Config, store *db.Store) {
	log.Info().Msg("Initializing server...")
	server, err := api.NewServer(config, *store)
	if err != nil {
		log.Fatal().Err(err).Msg("Cannot create server")
	}

	log.Info().Str("address", config.HTTPAddress).Msg("Starting HTTP server")
	err = server.Start(config.HTTPAddress)
	if err != nil {
		log.Fatal().Err(err).Msg("Cannot start server")
	}
}
