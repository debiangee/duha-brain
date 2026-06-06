package api

import (
	"net/http"
	"strconv"

	"github.com/cheenee/duha-brain/internal/models"
	"github.com/cheenee/duha-brain/internal/storage"
	"github.com/cheenee/duha-brain/internal/utils"
	"github.com/labstack/echo/v4"
)

// Handler holds the API handlers
type Handler struct {
	noteStore *storage.NoteStore
	logger    *utils.Logger
}

// NewHandler creates a new handler
func NewHandler(noteStore *storage.NoteStore, logger *utils.Logger) *Handler {
	return &Handler{
		noteStore: noteStore,
		logger:    logger,
	}
}

// CreateNote handles POST /notes
func (h *Handler) CreateNote(c echo.Context) error {
	var req models.CreateNoteRequest

	if err := c.Bind(&req); err != nil {
		h.logger.Error("Invalid request body", err.Error())
		return c.JSON(http.StatusBadRequest, utils.ErrInvalidRequest)
	}

	// Validate required fields
	if req.Title == "" || req.Content == "" {
		h.logger.Warn("Missing required fields")
		return c.JSON(http.StatusBadRequest, utils.ErrInvalidRequest.WithDetails("title and content are required"))
	}

	// Set defaults
	if req.Type == "" {
		req.Type = models.TypeThought
	}
	if req.Source == "" {
		req.Source = models.SourceManual
	}

	note, err := h.noteStore.Create(c.Request().Context(), &req)
	if err != nil {
		h.logger.Error("Failed to create note", err.Error())
		return c.JSON(http.StatusInternalServerError, utils.ErrInternalServer)
	}

	h.logger.Info("Note created", "id", note.ID)
	return c.JSON(http.StatusCreated, note)
}

// GetNote handles GET /notes/:id
func (h *Handler) GetNote(c echo.Context) error {
	id := c.Param("id")

	note, err := h.noteStore.GetByID(c.Request().Context(), id)
	if err != nil {
		h.logger.Warn("Note not found", "id", id)
		return c.JSON(http.StatusNotFound, utils.ErrNoteNotFound)
	}

	return c.JSON(http.StatusOK, note)
}

// UpdateNote handles PUT /notes/:id
func (h *Handler) UpdateNote(c echo.Context) error {
	id := c.Param("id")
	var req models.UpdateNoteRequest

	if err := c.Bind(&req); err != nil {
		h.logger.Error("Invalid request body", err.Error())
		return c.JSON(http.StatusBadRequest, utils.ErrInvalidRequest)
	}

	note, err := h.noteStore.Update(c.Request().Context(), id, &req)
	if err != nil {
		h.logger.Warn("Failed to update note", "id", id, "error", err.Error())
		return c.JSON(http.StatusNotFound, utils.ErrNoteNotFound)
	}

	h.logger.Info("Note updated", "id", id)
	return c.JSON(http.StatusOK, note)
}

// DeleteNote handles DELETE /notes/:id
func (h *Handler) DeleteNote(c echo.Context) error {
	id := c.Param("id")

	err := h.noteStore.Delete(c.Request().Context(), id)
	if err != nil {
		h.logger.Warn("Failed to delete note", "id", id, "error", err.Error())
		return c.JSON(http.StatusNotFound, utils.ErrNoteNotFound)
	}

	h.logger.Info("Note deleted", "id", id)
	return c.JSON(http.StatusOK, map[string]string{"message": "Note deleted successfully"})
}

// ListNotes handles GET /notes
func (h *Handler) ListNotes(c echo.Context) error {
	// Parse query parameters
	query := &models.ListNotesQuery{
		Type:          getStringParam(c, "type"),
		Tag:           getStringParam(c, "tag"),
		Status:        getStringParam(c, "status"),
		Search:        getStringParam(c, "search"),
		CreatedAfter:  getStringParam(c, "createdAfter"),
		CreatedBefore: getStringParam(c, "createdBefore"),
		Limit:         getIntParam(c, "limit", 10),
		Offset:        getIntParam(c, "offset", 0),
	}

	resp, err := h.noteStore.List(c.Request().Context(), query)
	if err != nil {
		h.logger.Error("Failed to list notes", err.Error())
		return c.JSON(http.StatusInternalServerError, utils.ErrInternalServer)
	}

	return c.JSON(http.StatusOK, resp)
}

// Health handles GET /health
func (h *Handler) Health(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"status": "ok",
		"service": "duha-brain",
	})
}

// Helper functions
func getStringParam(c echo.Context, name string) *string {
	val := c.QueryParam(name)
	if val == "" {
		return nil
	}
	return &val
}

func getIntParam(c echo.Context, name string, defaultVal int) int {
	val := c.QueryParam(name)
	if val == "" {
		return defaultVal
	}
	intVal, err := strconv.Atoi(val)
	if err != nil {
		return defaultVal
	}
	return intVal
}
