package storage

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/cheenee/duha-brain/internal/models"
	"github.com/google/uuid"
)

// FeedStore handles feed storage operations
type FeedStore struct {
	db *sql.DB
}

// NewFeedStore creates a new feed store
func NewFeedStore(db *sql.DB) *FeedStore {
	return &FeedStore{db: db}
}

// CreateFeed adds a new feed to the database
func (fs *FeedStore) CreateFeed(ctx context.Context, title, url, description string) (*models.Feed, error) {
	feed := &models.Feed{
		ID:          uuid.New().String(),
		Title:       title,
		URL:         url,
		Description: description,
		IsActive:    true,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	query := `
		INSERT INTO feeds (id, title, url, description, is_active, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`

	_, err := fs.db.ExecContext(ctx, query,
		feed.ID, feed.Title, feed.URL, feed.Description, feed.IsActive, feed.CreatedAt, feed.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create feed: %w", err)
	}

	return feed, nil
}

// GetFeed retrieves a feed by ID
func (fs *FeedStore) GetFeed(ctx context.Context, feedID string) (*models.Feed, error) {
	query := `
		SELECT id, title, url, description, last_fetched, fetch_error, is_active, created_at, updated_at
		FROM feeds WHERE id = ?
	`

	feed := &models.Feed{}
	err := fs.db.QueryRowContext(ctx, query, feedID).Scan(
		&feed.ID, &feed.Title, &feed.URL, &feed.Description, &feed.LastFetched,
		&feed.FetchError, &feed.IsActive, &feed.CreatedAt, &feed.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("feed not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get feed: %w", err)
	}

	return feed, nil
}

// ListFeeds retrieves all active feeds
func (fs *FeedStore) ListFeeds(ctx context.Context) ([]*models.Feed, error) {
	query := `
		SELECT id, title, url, description, last_fetched, fetch_error, is_active, created_at, updated_at
		FROM feeds WHERE is_active = 1
		ORDER BY created_at DESC
	`

	rows, err := fs.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list feeds: %w", err)
	}
	defer rows.Close()

	var feeds []*models.Feed
	for rows.Next() {
		feed := &models.Feed{}
		err := rows.Scan(
			&feed.ID, &feed.Title, &feed.URL, &feed.Description, &feed.LastFetched,
			&feed.FetchError, &feed.IsActive, &feed.CreatedAt, &feed.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan feed: %w", err)
		}
		feeds = append(feeds, feed)
	}

	return feeds, rows.Err()
}

// UpdateFeed updates feed metadata
func (fs *FeedStore) UpdateFeed(ctx context.Context, feedID string, title, description *string, isActive *bool) (*models.Feed, error) {
	feed, err := fs.GetFeed(ctx, feedID)
	if err != nil {
		return nil, err
	}

	if title != nil {
		feed.Title = *title
	}
	if description != nil {
		feed.Description = *description
	}
	if isActive != nil {
		feed.IsActive = *isActive
	}
	feed.UpdatedAt = time.Now()

	query := `UPDATE feeds SET title = ?, description = ?, is_active = ?, updated_at = ? WHERE id = ?`
	_, err = fs.db.ExecContext(ctx, query, feed.Title, feed.Description, feed.IsActive, feed.UpdatedAt, feedID)
	if err != nil {
		return nil, fmt.Errorf("failed to update feed: %w", err)
	}

	return feed, nil
}

// UpdateFeedFetchStatus updates last_fetched and fetch_error
func (fs *FeedStore) UpdateFeedFetchStatus(ctx context.Context, feedID string, fetchError *string) error {
	now := time.Now()
	query := `UPDATE feeds SET last_fetched = ?, fetch_error = ? WHERE id = ?`
	_, err := fs.db.ExecContext(ctx, query, now, fetchError, feedID)
	return err
}

// DeleteFeed deletes a feed (soft delete - marks as inactive)
func (fs *FeedStore) DeleteFeed(ctx context.Context, feedID string) error {
	query := `UPDATE feeds SET is_active = 0, updated_at = ? WHERE id = ?`
	_, err := fs.db.ExecContext(ctx, query, time.Now(), feedID)
	return err
}

// CreateFeedItem adds a new feed item to the database
func (fs *FeedStore) CreateFeedItem(ctx context.Context, item *models.FeedItem) error {
	query := `
		INSERT INTO feed_items (id, feed_id, title, link, description, content, pub_date, guid, fetched_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := fs.db.ExecContext(ctx, query,
		item.ID, item.FeedID, item.Title, item.Link, item.Description,
		item.Content, item.PubDate, item.GUID, item.FetchedAt,
	)

	if err != nil {
		// Ignore duplicate link errors
		if err.Error() == "UNIQUE constraint failed: feed_items.link" {
			return nil
		}
		return fmt.Errorf("failed to create feed item: %w", err)
	}

	return nil
}

// GetFeedItems retrieves items from a specific feed
func (fs *FeedStore) GetFeedItems(ctx context.Context, feedID string, limit int) ([]*models.FeedItem, error) {
	query := `
		SELECT id, feed_id, title, link, description, content, pub_date, guid, is_saved, saved_note_id, fetched_at
		FROM feed_items WHERE feed_id = ?
		ORDER BY COALESCE(pub_date, fetched_at) DESC
		LIMIT ?
	`

	rows, err := fs.db.QueryContext(ctx, query, feedID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get feed items: %w", err)
	}
	defer rows.Close()

	var items []*models.FeedItem
	for rows.Next() {
		item := &models.FeedItem{}
		err := rows.Scan(
			&item.ID, &item.FeedID, &item.Title, &item.Link, &item.Description,
			&item.Content, &item.PubDate, &item.GUID, &item.IsSaved, &item.SavedNoteID, &item.FetchedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan feed item: %w", err)
		}
		items = append(items, item)
	}

	return items, rows.Err()
}

// SaveFeedItem marks a feed item as saved and links it to a note
func (fs *FeedStore) SaveFeedItem(ctx context.Context, itemID, noteID string) error {
	query := `UPDATE feed_items SET is_saved = 1, saved_note_id = ? WHERE id = ?`
	_, err := fs.db.ExecContext(ctx, query, noteID, itemID)
	return err
}

// GetRecentFeedItems retrieves recent items from all feeds
func (fs *FeedStore) GetRecentFeedItems(ctx context.Context, limit int) ([]*models.FeedItem, error) {
	query := `
		SELECT id, feed_id, title, link, description, content, pub_date, guid, is_saved, saved_note_id, fetched_at
		FROM feed_items
		ORDER BY COALESCE(pub_date, fetched_at) DESC
		LIMIT ?
	`

	rows, err := fs.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent feed items: %w", err)
	}
	defer rows.Close()

	var items []*models.FeedItem
	for rows.Next() {
		item := &models.FeedItem{}
		err := rows.Scan(
			&item.ID, &item.FeedID, &item.Title, &item.Link, &item.Description,
			&item.Content, &item.PubDate, &item.GUID, &item.IsSaved, &item.SavedNoteID, &item.FetchedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan feed item: %w", err)
		}
		items = append(items, item)
	}

	return items, rows.Err()
}

// GetFeedItemByLink retrieves an item by its link (to check for duplicates)
func (fs *FeedStore) GetFeedItemByLink(ctx context.Context, link string) (*models.FeedItem, error) {
	query := `
		SELECT id, feed_id, title, link, description, content, pub_date, guid, is_saved, saved_note_id, fetched_at
		FROM feed_items WHERE link = ?
	`

	item := &models.FeedItem{}
	err := fs.db.QueryRowContext(ctx, query, link).Scan(
		&item.ID, &item.FeedID, &item.Title, &item.Link, &item.Description,
		&item.Content, &item.PubDate, &item.GUID, &item.IsSaved, &item.SavedNoteID, &item.FetchedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get feed item: %w", err)
	}

	return item, nil
}
