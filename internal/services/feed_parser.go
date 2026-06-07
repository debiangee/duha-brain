package services

import (
	"context"
	"fmt"
	"time"

	"github.com/cheenee/duha-brain/internal/models"
	"github.com/google/uuid"
	"github.com/mmcdole/gofeed"
)

// FeedParser handles RSS/Atom feed parsing
type FeedParser struct {
	parser *gofeed.Parser
}

// NewFeedParser creates a new feed parser
func NewFeedParser() *FeedParser {
	return &FeedParser{
		parser: gofeed.NewParser(),
	}
}

// ParseFeed fetches and parses an RSS/Atom feed
func (fp *FeedParser) ParseFeed(ctx context.Context, feedURL string) (*models.Feed, []*models.FeedItem, error) {
	// Parse the feed
	rssFeed, err := fp.parser.ParseURLWithContext(feedURL, ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to parse feed: %w", err)
	}

	// Create Feed model
	feed := &models.Feed{
		ID:          uuid.New().String(),
		Title:       rssFeed.Title,
		URL:         feedURL,
		Description: rssFeed.Description,
		IsActive:    true,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// If no title, use link
	if feed.Title == "" && rssFeed.Link != "" {
		feed.Title = rssFeed.Link
	}

	// Parse feed items
	var items []*models.FeedItem
	now := time.Now()

	if rssFeed.Items != nil {
		for _, item := range rssFeed.Items {
			feedItem := &models.FeedItem{
				ID:        uuid.New().String(),
				FeedID:    feed.ID,
				Title:     item.Title,
				Link:      item.Link,
				FetchedAt: now,
			}

			// Set optional fields
			if item.Description != "" {
				feedItem.Description = item.Description
			}
			if item.Content != "" {
				feedItem.Content = &item.Content
			}
			if item.Published != "" {
				if pubDate, err := time.Parse(time.RFC3339, item.Published); err == nil {
					feedItem.PubDate = &pubDate
				}
			} else if item.PublishedParsed != nil {
				feedItem.PubDate = item.PublishedParsed
			}
			if item.GUID != "" {
				feedItem.GUID = &item.GUID
			}

			items = append(items, feedItem)
		}
	}

	return feed, items, nil
}

// ValidateFeedURL checks if a URL is a valid RSS/Atom feed
func (fp *FeedParser) ValidateFeedURL(ctx context.Context, feedURL string) (string, error) {
	rssFeed, err := fp.parser.ParseURLWithContext(feedURL, ctx)
	if err != nil {
		return "", fmt.Errorf("invalid feed URL: %w", err)
	}

	if rssFeed.Title == "" {
		return feedURL, fmt.Errorf("feed has no title and no link")
	}

	return rssFeed.Title, nil
}
