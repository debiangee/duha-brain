package models

import "time"

// Feed represents an RSS feed subscription
type Feed struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	URL         string     `json:"url"`
	Description string     `json:"description"`
	LastFetched *time.Time `json:"lastFetched"`
	FetchError  *string    `json:"fetchError"`
	IsActive    bool       `json:"isActive"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

// FeedItem represents an article from an RSS feed
type FeedItem struct {
	ID          string     `json:"id"`
	FeedID      string     `json:"feedId"`
	Title       string     `json:"title"`
	Link        string     `json:"link"`
	Description string     `json:"description"`
	Content     *string    `json:"content"`
	PubDate     *time.Time `json:"pubDate"`
	GUID        *string    `json:"guid"`
	IsSaved     bool       `json:"isSaved"`
	SavedNoteID *string    `json:"savedNoteId"`
	FetchedAt   time.Time  `json:"fetchedAt"`
}

// CreateFeedRequest for adding a new feed
type CreateFeedRequest struct {
	URL string `json:"url"`
}

// UpdateFeedRequest for updating feed settings
type UpdateFeedRequest struct {
	Title       *string `json:"title"`
	Description *string `json:"description"`
	IsActive    *bool   `json:"isActive"`
}

// SaveFeedItemRequest for saving an article to notebook
type SaveFeedItemRequest struct {
	NotebookID *string `json:"notebookId"` // nil = create new notebook
	Title      *string `json:"title"`      // optional override
}

// FeedWithItems includes the feed and its recent items
type FeedWithItems struct {
	Feed  *Feed       `json:"feed"`
	Items []*FeedItem `json:"items"`
}
