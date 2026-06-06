package api

import (
	"github.com/cheenee/duha-brain/internal/utils"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// RegisterRoutes registers all API routes
func RegisterRoutes(e *echo.Echo, handler *Handler, logger *utils.Logger) {
	// Middleware
	e.Use(middleware.CORS())
	e.Use(middleware.Recover())
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "${method} ${path} ${status} ${latency_human}\n",
	}))

	// Health check
	e.GET("/health", handler.Health)

	// API v1 routes
	v1 := e.Group("/api/v1")

	// Notes endpoints
	v1.POST("/notes", handler.CreateNote)
	v1.GET("/notes", handler.ListNotes)
	v1.GET("/notes/:id", handler.GetNote)
	v1.PUT("/notes/:id", handler.UpdateNote)
	v1.DELETE("/notes/:id", handler.DeleteNote)

	logger.Info("Routes registered successfully")
}
