package api

import (
	"net/http"

	"github.com/cheenee/duha-brain/internal/models"
	"github.com/cheenee/duha-brain/internal/services"
	"github.com/cheenee/duha-brain/internal/storage"
	"github.com/labstack/echo/v4"
)

// FeedHandler handles feed-related requests
type FeedHandler struct {
	feedStore  *storage.FeedStore
	noteStore  *storage.NoteStore
	feedParser *services.FeedParser
}

// NewFeedHandler creates a new feed handler
func NewFeedHandler(feedStore *storage.FeedStore, noteStore *storage.NoteStore, feedParser *services.FeedParser) *FeedHandler {
	return &FeedHandler{
		feedStore:  feedStore,
		noteStore:  noteStore,
		feedParser: feedParser,
	}
}

// AddFeed handles POST /api/v1/feeds
func (h *FeedHandler) AddFeed(c echo.Context) error {
	var req models.CreateFeedRequest

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	if req.URL == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "URL is required"})
	}

	// Validate and parse the feed
	title, err := h.feedParser.ValidateFeedURL(c.Request().Context(), req.URL)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	// Create feed in database
	feed, err := h.feedStore.CreateFeed(c.Request().Context(), title, req.URL, "")
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create feed"})
	}

	return c.JSON(http.StatusCreated, feed)
}

// GetFeeds handles GET /api/v1/feeds
func (h *FeedHandler) GetFeeds(c echo.Context) error {
	feeds, err := h.feedStore.ListFeeds(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to list feeds"})
	}

	return c.JSON(http.StatusOK, feeds)
}

// GetFeed handles GET /api/v1/feeds/:id
func (h *FeedHandler) GetFeed(c echo.Context) error {
	feedID := c.Param("id")

	feed, err := h.feedStore.GetFeed(c.Request().Context(), feedID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Feed not found"})
	}

	return c.JSON(http.StatusOK, feed)
}

// UpdateFeed handles PUT /api/v1/feeds/:id
func (h *FeedHandler) UpdateFeed(c echo.Context) error {
	feedID := c.Param("id")
	var req models.UpdateFeedRequest

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	feed, err := h.feedStore.UpdateFeed(c.Request().Context(), feedID, req.Title, req.Description, req.IsActive)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update feed"})
	}

	return c.JSON(http.StatusOK, feed)
}

// DeleteFeed handles DELETE /api/v1/feeds/:id
func (h *FeedHandler) DeleteFeed(c echo.Context) error {
	feedID := c.Param("id")

	if err := h.feedStore.DeleteFeed(c.Request().Context(), feedID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to delete feed"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Feed deleted"})
}

// GetFeedItems handles GET /api/v1/feeds/:id/items
func (h *FeedHandler) GetFeedItems(c echo.Context) error {
	feedID := c.Param("id")
	limit := getIntParam(c, "limit", 50)

	items, err := h.feedStore.GetFeedItems(c.Request().Context(), feedID, limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get feed items"})
	}

	return c.JSON(http.StatusOK, items)
}

// GetRecentItems handles GET /api/v1/feeds/items
func (h *FeedHandler) GetRecentItems(c echo.Context) error {
	limit := getIntParam(c, "limit", 100)

	items, err := h.feedStore.GetRecentFeedItems(c.Request().Context(), limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get feed items"})
	}

	return c.JSON(http.StatusOK, items)
}

// SaveFeedItem handles POST /api/v1/feeds/items/:id/save
func (h *FeedHandler) SaveFeedItem(c echo.Context) error {
	itemID := c.Param("id")
	var req models.SaveFeedItemRequest

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	// Get the feed item
	items, _ := h.feedStore.GetRecentFeedItems(c.Request().Context(), 1000)
	var feedItem *models.FeedItem
	for _, item := range items {
		if item.ID == itemID {
			feedItem = item
			break
		}
	}

	if feedItem == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Feed item not found"})
	}

	// Create a note from the feed item
	noteTitle := feedItem.Title
	if req.Title != nil {
		noteTitle = *req.Title
	}

	// Create content with link to source
	noteContent := "<p>"
	if feedItem.Description != "" {
		noteContent += feedItem.Description
	} else if feedItem.Content != nil {
		noteContent += *feedItem.Content
	}
	noteContent += "</p>"
	if feedItem.Link != "" {
		noteContent += `<p><a href="` + feedItem.Link + `">View original</a></p>`
	}

	// Create or use existing notebook
	var noteID string
	if req.NotebookID != nil && *req.NotebookID != "" {
		noteID = *req.NotebookID
	} else {
		// Create new notebook
		note, err := h.noteStore.Create(c.Request().Context(), &models.CreateNoteRequest{
			Title:   noteTitle,
			Content: noteContent,
			Type:    models.TypeThought,
			Tags:    []string{},
			Source:  "rss",
		})
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create notebook"})
		}
		noteID = note.ID
	}

	// Mark feed item as saved
	if err := h.feedStore.SaveFeedItem(c.Request().Context(), itemID, noteID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to save feed item"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Feed item saved", "noteId": noteID})
}

// RefreshFeed handles POST /api/v1/feeds/:id/refresh
func (h *FeedHandler) RefreshFeed(c echo.Context) error {
	feedID := c.Param("id")

	// Get feed
	feed, err := h.feedStore.GetFeed(c.Request().Context(), feedID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Feed not found"})
	}

	// Parse feed
	_, items, err := h.feedParser.ParseFeed(c.Request().Context(), feed.URL)
	if err != nil {
		// Update fetch error
		errMsg := err.Error()
		h.feedStore.UpdateFeedFetchStatus(c.Request().Context(), feedID, &errMsg)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	// Save items
	for _, item := range items {
		h.feedStore.CreateFeedItem(c.Request().Context(), item)
	}

	// Update feed fetch status
	h.feedStore.UpdateFeedFetchStatus(c.Request().Context(), feedID, nil)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":    "Feed refreshed",
		"itemsAdded": len(items),
	})
}
