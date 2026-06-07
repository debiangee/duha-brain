# RSS Feed Integration - Phase 2

## Vision
Enable users to subscribe to RSS feeds (blogs, news, Reddit) and save interesting articles directly into their notebooks with one click.

## Requirements

### User Stories

1. **Add RSS Feed**
   - User clicks "Add Feed" button
   - Enters feed URL
   - System validates and fetches feed
   - Feed name/description auto-populated
   - Feed is saved to database

2. **View Feed Items**
   - User sees list of subscribed feeds
   - Clicks feed → see recent articles
   - Shows: title, description, publication date, source
   - Articles are sorted by newest first

3. **Save Article to Notebook**
   - User clicks "Save" on an article
   - Choose existing notebook OR create new one
   - Article title, link, and content saved
   - Link preserved for reference
   - Article marked as saved (visual indicator)

4. **Automatic Feed Polling**
   - Backend fetches feeds every 30 minutes (configurable)
   - Detects new articles
   - Updates database
   - Doesn't re-save old articles

5. **Feed Management**
   - View all subscribed feeds
   - Edit feed name/settings
   - Delete feed
   - See last fetch time

## Data Model

### New Database Tables

**feeds**
```sql
id              TEXT PRIMARY KEY (UUID)
title           TEXT NOT NULL
url             TEXT NOT NULL UNIQUE
description     TEXT
last_fetched    DATETIME
fetch_error     TEXT
is_active       BOOLEAN DEFAULT 1
created_at      DATETIME NOT NULL
updated_at      DATETIME NOT NULL
```

**feed_items**
```sql
id              TEXT PRIMARY KEY (UUID)
feed_id         TEXT NOT NULL (FK: feeds.id)
title           TEXT NOT NULL
link            TEXT NOT NULL UNIQUE
description     TEXT
content         TEXT
pub_date        DATETIME
guid            TEXT
is_saved        BOOLEAN DEFAULT 0
saved_note_id   TEXT (FK: notes.id, nullable)
fetched_at      DATETIME NOT NULL
```

## API Endpoints

### Feed Management
- `POST /api/v1/feeds` - Add new feed
- `GET /api/v1/feeds` - List all feeds
- `GET /api/v1/feeds/:id` - Get feed details
- `PUT /api/v1/feeds/:id` - Update feed
- `DELETE /api/v1/feeds/:id` - Delete feed

### Feed Items
- `GET /api/v1/feeds/:id/items` - Get articles from feed
- `POST /api/v1/feeds/items/:id/save` - Save article to notebook
- `GET /api/v1/feeds/items` - Get all recent items (across feeds)

## Frontend Components

### New Components
1. **FeedSidebar** - List of subscribed feeds
2. **FeedView** - View articles from selected feed
3. **FeedItemCard** - Individual article preview
4. **AddFeedModal** - Dialog to add new feed
5. **SaveToNotebookModal** - Choose which notebook to save to

### Modified Components
1. **App.tsx** - Add feeds section to layout
2. **RichNoteEditor.tsx** - Show source link if from feed

## Implementation Plan

### Phase 2.1: Backend Setup
- [ ] Add feed tables to database schema
- [ ] Create Feed and FeedItem models
- [ ] Implement feed storage layer
- [ ] Add feed API endpoints

### Phase 2.2: RSS Parser
- [ ] Parse RSS/Atom feeds
- [ ] Extract: title, link, description, pub_date, content
- [ ] Handle feed validation

### Phase 2.3: Feed Polling
- [ ] Background goroutine to fetch feeds
- [ ] Configurable interval (default 30min)
- [ ] Error handling and retry logic
- [ ] Prevent duplicate items

### Phase 2.4: Frontend UI
- [ ] Add feeds section to sidebar
- [ ] Create FeedView component
- [ ] Implement FeedItemCard
- [ ] Add "Save to Notebook" functionality

### Phase 2.5: Integration
- [ ] Link saved articles back to original feed
- [ ] Show "Saved" indicator on articles
- [ ] Handle feed errors gracefully
- [ ] Update frontend with real-time feed data

## Technical Decisions

### RSS Library
- Use `github.com/mmcdole/gofeed` - mature, handles RSS/Atom/JSON feeds

### Feed Polling
- Background goroutine in main.go
- Configurable via environment variable: `DUHA_FEED_POLL_INTERVAL` (default: 30min)
- Simple retry logic with exponential backoff

### Storage
- All feed data in SQLite (no external service)
- articles stored as separate items, linked to feeds
- Can be saved as full notes or just bookmarks

## Non-Goals (Phase 2 Later)
- ❌ Smart notifications based on keywords
- ❌ Feed categorization/organization
- ❌ OPML import/export
- ❌ Read/unread status
- ❌ Archiving feed items
- ❌ Reddit/Twitter special handling

## Success Criteria

- [ ] Can add RSS feed via UI
- [ ] Backend fetches feed articles successfully
- [ ] Feed items appear in UI sorted by date
- [ ] Can save article to existing notebook
- [ ] Auto-save creates new notebook with article
- [ ] Background polling updates feeds periodically
- [ ] Shows last fetch time for each feed
- [ ] Handles feed errors gracefully
- [ ] No duplicate articles when polling

## Timeline Estimate
- Backend setup: 1-2 hours
- RSS parsing: 30 min
- Feed polling: 1 hour
- Frontend: 2-3 hours
- Integration & testing: 1-2 hours

**Total: 6-9 hours**

## Notes
- Keep it simple first - advanced filtering/notifications come later
- Focus on reliability - better to have fewer feeds working well than many with bugs
- Consider feed update frequency - balance freshness vs performance
