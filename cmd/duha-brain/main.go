package main

import (
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"

	"github.com/cheenee/duha-brain/internal/api"
	"github.com/cheenee/duha-brain/internal/config"
	"github.com/cheenee/duha-brain/internal/database"
	"github.com/cheenee/duha-brain/internal/storage"
	"github.com/cheenee/duha-brain/internal/utils"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to load config: %v\n", err)
		os.Exit(1)
	}

	// Initialize logger
	logger := utils.NewLogger(cfg.Logging.Level, cfg.Logging.Format)
	logger.Info("Starting Duha Brain")
	logger.Info("Configuration loaded", "port", cfg.Server.Port, "dbPath", cfg.Database.Path)

	// Initialize database
	db, err := database.New(cfg.Database.Path)
	if err != nil {
		logger.Error("Failed to initialize database", err.Error())
		os.Exit(1)
	}
	defer db.Close()
	logger.Info("Database initialized successfully")

	// Initialize storage
	noteStore := storage.NewNoteStore(db.GetConn())

	// Initialize Echo
	e := echo.New()
	e.Use(middleware.CORS())
	e.Use(middleware.Recover())

	// Initialize handler
	handler := api.NewHandler(noteStore, logger)

	// Register API routes
	api.RegisterRoutes(e, handler, logger)

	// Get the working directory
	wd, err := os.Getwd()
	if err != nil {
		logger.Error("Failed to get working directory", err.Error())
		os.Exit(1)
	}

	// Try multiple paths to find web/dist
	possiblePaths := []string{
		filepath.Join(wd, "web", "dist"),                    // Current working directory
		filepath.Join(wd, "..", "..", "web", "dist"),        // From bin directory
		filepath.Join(wd, "..", "web", "dist"),              // Alternative relative path
	}

	var distPath string
	for _, path := range possiblePaths {
		if _, err := os.Stat(path); err == nil {
			distPath = path
			break
		}
	}

	if distPath == "" {
		logger.Error("Frontend dist directory not found", fmt.Sprintf("tried: %v, cwd: %s", possiblePaths, wd))
		os.Exit(1)
	}

	logger.Info("Serving frontend from", "path", distPath)

	// Serve all static files from dist directory
	e.Static("", distPath)

	// Server address
	addr := fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port)
	logger.Info("Server starting", "addr", addr)

	// Start server in a goroutine
	go func() {
		if err := e.Start(addr); err != nil {
			// Echo wraps errors, extract the real one
			if err.Error() != "http: Server closed" {
				logger.Error("Server error", err.Error())
				fmt.Fprintf(os.Stderr, "Server start failed: %v\n", err)
			}
		}
	}()

	// Wait for shutdown signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server")
	e.Close()
}
