# Duha Brain - Project Documentation

**Status**: Project Abandoned - Phase 2.1 RSS Feed Frontend (In Progress)

**Last Updated**: June 7, 2026

---

## Project Overview

Duha Brain is a personal knowledge management system built with Go backend and React/TypeScript frontend. The project implements a notebook application with rich text editing and RSS feed aggregation capabilities.

**Tech Stack:**
- Backend: Go with SQLite database
- Frontend: React 18 + TypeScript + Tailwind CSS + Vite
- Editor: TipTap (rich text)
- State Management: Zustand
- Styling: Tailwind CSS with dark theme (slate colors)
- Fonts: Inter (UI/Navigation), JetBrains Mono (code/editing)

---

## Completed Features

### Phase 1: Notebook Foundation ✅

**Backend:**
- Go REST API with SQLite database
- CRUD operations for notes
- Image upload endpoint (`/api/v1/images`)
- Note tagging system
- Note type system (thought, snippet, article, voice, image, video, meeting, jira, goal, feed)

**Frontend:**
- React + TypeScript + Tailwind CSS + Vite
- Rich text editor using TipTap with:
  - Text formatting (bold, italic, strikethrough)
  - Heading levels (H1, H2, H3)
  - Lists (bullet and ordered)
  - Code blocks
  - Image embedding (paste or upload)
  - Link support
- Tag system with inline extraction (`#tag` syntax)
- Auto-save functionality (2-second debounce)
- Tab-based notebook management
- Search functionality
- Dark theme with smooth animations
- Title auto-formatting to title case

**Database Schema:**
```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT,
  content TEXT,
  type TEXT,
  tags TEXT,
  source TEXT,
  created_at DATETIME,
  updated_at DATETIME
);
```

### Phase 2.1: RSS Feed Backend ✅

**Features:**
- Feed subscription management (add, delete, list, update)
- RSS/Atom feed parsing using `gofeed` library
- Feed article fetching and caching
- Manual feed refresh
- Save articles to database

**Database Schema:**
```sql
CREATE TABLE feeds (
  id TEXT PRIMARY KEY,
  title TEXT,
  url TEXT,
  description TEXT,
  created_at DATETIME,
  updated_at DATETIME
);

CREATE TABLE feed_items (
  id TEXT PRIMARY KEY,
  feed_id TEXT,
  title TEXT,
  description TEXT,
  content TEXT,
  link TEXT,
  author TEXT,
  pub_date DATETIME,
  fetched_at DATETIME,
  is_saved BOOLEAN,
  FOREIGN KEY (feed_id) REFERENCES feeds(id)
);
```

**API Endpoints:**
- `POST /api/v1/feeds` - Add new feed
- `GET /api/v1/feeds` - List all feeds
- `PUT /api/v1/feeds/:id` - Update feed
- `DELETE /api/v1/feeds/:id` - Delete feed
- `GET /api/v1/feeds/:id/items` - Get articles from feed
- `POST /api/v1/feeds/:id/refresh` - Refresh feed
- `GET /api/v1/feed-items/recent` - Get recent articles
- `POST /api/v1/feed-items/:id/save` - Mark article as read

### Phase 2.1: RSS Feed Frontend (In Progress - Issues) ⚠️

**Components Created:**
- `FeedsPage.tsx` - Main feeds UI component
  - Left: Article feed (Facebook/LinkedIn style)
  - Right: Feed configuration panel with tabs (Feed | Configurations)

**Features Attempted:**
- Article display with clean titles (removes arXiv IDs)
- Mark as read functionality
- Add article to notebooks button
- Feed subscription management
- 11 pre-loaded default feeds

**Pre-loaded Default Feeds:**
1. MarkTechPost - https://www.marktechpost.com/feed/
2. OpenAI News - https://openai.com/news/rss.xml
3. Hugging Face Blog - https://huggingface.co/blog/feed.xml
4. MIT Technology Review (AI) - https://www.technologyreview.com/topic/artificial-intelligence/feed/
5. arXiv cs.AI - https://rss.arxiv.org/rss/cs.AI
6. Hacker News - https://hnrss.org/frontpage?points=100
7. The Pragmatic Engineer - https://blog.pragmaticengineer.com/rss/
8. GitHub Blog - https://github.blog/feed/
9. Simon Willison's Weblog - https://simonwillison.net/atom/entries/
10. TechCrunch - https://techcrunch.com/feed/
11. GMA Public Affairs - https://data.gmanetwork.com/gno/rss/publicaffairs/feed.xml

---

## Issues & Known Problems

### Critical Issue: Project Failure ❌

**Last Status**: Project failing - needs debugging
- Date: June 7, 2026
- Frontend builds successfully (npm run build)
- Backend builds successfully (go build)
- Runtime failure when accessing application

### Potential Root Causes

1. **FeedsPage Component Issues**
   - Complex state management with tab switching
   - Potential memory leaks in useEffect hooks
   - Feed items loading logic may have issues

2. **Transition Animations**
   - Added `animate-fadeIn` keyframe animation
   - `transition-all duration-200` on multiple elements
   - May be causing performance issues or conflicts

3. **CSS Modifications**
   - Added global transitions in `index.css`
   - New `@keyframes fadeIn` animation
   - Potential Tailwind conflicts

4. **Notebook Selection Bug (Fixed)**
   - Issue: Clicking different notebooks showed only latest notebook content
   - Fix: Added `useEffect` in `RichNoteEditor.tsx` to update editor when note changes
   - Fix Applied:
   ```typescript
   useEffect(() => {
     // Update editor content when note changes
     if (editor && note) {
       editor.commands.setContent(note.content)
       contentRef.current = note.content
       setEditingTitle(note.title)
       setIsEditing(false)
       setLastSaveTime(null)
     }
   }, [note.id, editor])
   ```

### Debug Checklist

1. **Browser Console**
   - Check for JavaScript errors
   - Look for API call failures
   - Check network tab for failed requests

2. **Backend**
   - Verify server is running on `localhost:8080`
   - Check Go server logs for panics
   - Verify database file exists at `data/duha.db`
   - Test API endpoints with curl:
     ```bash
     curl http://localhost:8080/api/v1/notes
     curl http://localhost:8080/api/v1/feeds
     ```

3. **Frontend**
   - Check if React is mounting properly
   - Verify Zustand store is initialized
   - Look for missing API responses
   - Test in different browser

4. **Recent Changes to Review**
   - `web/src/components/FeedsPage.tsx` - Entire component
   - `web/src/components/RichNoteEditor.tsx` - Added notebook selection fix
   - `web/src/index.css` - Added fadeIn animation and transitions

---

## Architecture

### Directory Structure

```
duha-brain/
├── cmd/
│   └── duha-brain/
│       └── main.go (Entry point)
├── internal/
│   ├── api/
│   │   ├── handlers.go (Note endpoints)
│   │   ├── feed_handlers.go (Feed endpoints)
│   │   └── router.go (Route setup)
│   ├── config/
│   │   └── config.go
│   ├── database/
│   │   └── db.go (SQLite setup)
│   ├── models/
│   │   ├── note.go
│   │   └── feed.go
│   ├── services/
│   │   └── feed_parser.go (RSS parsing)
│   ├── storage/
│   │   ├── note_store.go (Note DB ops)
│   │   └── feed_store.go (Feed DB ops)
│   └── utils/
│       ├── errors.go
│       └── logger.go
├── web/
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.tsx (Main app)
│   │   │   ├── RichNoteEditor.tsx (Editor)
│   │   │   ├── NoteForm.tsx (New note)
│   │   │   ├── NoteList.tsx (Notes sidebar)
│   │   │   ├── FeedsPage.tsx (RSS feeds UI)
│   │   │   ├── Sidebar.tsx (Navigation)
│   │   │   └── Toast.tsx (Notifications)
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   └── feed.ts
│   │   ├── utils/
│   │   │   └── text.ts (Helper functions)
│   │   ├── api.ts (API client)
│   │   ├── store.ts (Zustand store)
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── data/
│   ├── duha.db (SQLite database)
│   └── images/ (User-uploaded images)
├── go.mod
├── go.sum
└── Makefile
```

### API Architecture

**Base URL**: `http://localhost:8080`

**Note Endpoints:**
- `GET /api/v1/notes` - List notes (with search)
- `POST /api/v1/notes` - Create note
- `PUT /api/v1/notes/:id` - Update note
- `DELETE /api/v1/notes/:id` - Delete note
- `POST /api/v1/images` - Upload image

**Feed Endpoints:**
- `GET /api/v1/feeds` - List feeds
- `POST /api/v1/feeds` - Add feed
- `PUT /api/v1/feeds/:id` - Update feed
- `DELETE /api/v1/feeds/:id` - Delete feed
- `GET /api/v1/feeds/:id/items` - Get feed items
- `POST /api/v1/feeds/:id/refresh` - Refresh feed
- `GET /api/v1/feed-items/recent` - Get recent items
- `POST /api/v1/feed-items/:id/save` - Save/mark as read

---

## Styling Guidelines (Golden Rules)

**CRITICAL: Everything must have smooth transitions**

1. **Fonts**
   - UI/Navigation: `Inter` font family
   - Code/Editing: `JetBrains Mono` font family

2. **Transitions**
   - All interactive elements: `transition-all 200ms cubic-bezier(0.4, 0, 0.2, 1)`
   - Specific transitions preferred over `transition-all` to avoid performance issues
   - Use `transition-colors`, `transition-opacity`, `transition-transform` for GPU acceleration
   - Duration: Always 200ms for consistency

3. **Colors**
   - Dark theme: Slate color palette (slate-950, slate-900, slate-800, etc.)
   - Accent: Blue (blue-600 hover, blue-700 active)
   - Success: Green (green-600, emerald-600)
   - Danger: Red (red-400, red-900)

4. **Button Styling**
   - Smooth hover: `hover:scale-105 active:scale-95` (WARNING: Can cause performance issues)
   - Better alternative: Use only color changes with `transition-colors`
   - Always include `transition-colors duration-200`

5. **Component Rules**
   - Never touch notebooks code unless explicitly fixing it
   - Create separate files for new features
   - Don't modify existing core files unnecessarily
   - Minimize prop changes to avoid unnecessary re-renders

---

## Development Setup

### Prerequisites
- Go 1.18+
- Node.js 18+
- npm or yarn

### Running the Project

**Backend:**
```bash
cd duha-brain
go build -o bin/duha-brain.exe ./cmd/duha-brain/main.go
./bin/duha-brain.exe
```

**Frontend:**
```bash
cd duha-brain/web
npm install
npm run dev  # Development server
npm run build  # Production build
```

### Build Commands

**Frontend:**
```bash
npm run build  # Compiles TypeScript and Vite
```

**Backend:**
```bash
go build -o bin/duha-brain.exe ./cmd/duha-brain/main.go
```

---

## Features Not Yet Implemented

1. ❌ Background feed polling (auto-refresh every 30 minutes)
2. ❌ Audio transcription
3. ❌ Image OCR
4. ❌ Video transcription
5. ❌ LLM integration
6. ❌ Knowledge graph
7. ❌ Advanced views (calendar, Gantt, timeline)
8. ❌ Feed sync across devices
9. ❌ Full-text search
10. ❌ Export functionality

---

## Code Quality Notes

### What Works Well
- Rich text editor integration (TipTap)
- Image embedding and storage
- Tag extraction from content
- Auto-save functionality
- Dark theme with smooth animations
- React component organization
- Zustand state management
- SQLite database integration

### What Needs Improvement
- FeedsPage component complexity
- Performance optimization for large feed lists
- Error handling could be more robust
- Missing loading states on async operations
- No pagination for articles
- Memory management in long sessions

---

## Lessons Learned

1. **Transition Performance**: `transition-all` can cause performance issues. Use specific transitions instead.
2. **Editor State Management**: TipTap editor needs proper dependency tracking to update on prop changes.
3. **Component Isolation**: Keep new features in separate files to avoid breaking existing functionality.
4. **Golden Rules**: Establish and follow UI rules early (smooth transitions, consistent timing, etc.)
5. **Build Verification**: Always build both frontend and backend after changes to catch issues early.

---

## Files Modified (Latest Session)

### Created
- `web/src/components/FeedsPage.tsx` - RSS feeds UI component

### Modified
- `web/src/components/RichNoteEditor.tsx` - Fixed notebook selection bug
- `web/src/App.tsx` - Integrated Feeds page toggle
- `web/src/index.css` - Added fadeIn animation
- `web/src/components/Sidebar.tsx` - Added Feeds navigation

### Deleted (from previous cleanup)
- All RSS frontend components except FeedsPage

---

## Future Recommendations

1. **Debugging**: Start with browser console and network tab to identify the exact failure point
2. **Testing**: Add unit tests for API endpoints and React components
3. **Performance**: Implement virtualization for large article lists
4. **Refactoring**: Break FeedsPage into smaller components (FeedList, ArticleCard, ConfigPanel)
5. **Documentation**: Add JSDoc comments to complex functions
6. **CI/CD**: Set up automated builds and tests

---

## Contact & Attribution

**Project**: Duha Brain Personal Knowledge Management System
**Status**: Abandoned (June 7, 2026)
**Reason**: Project failure during Phase 2.1 frontend implementation - debugging required

**Technology Attribution:**
- TipTap (tiptap.dev) - Rich text editor
- gofeed (github.com/mmcdole/gofeed) - RSS/Atom parsing
- Tailwind CSS (tailwindcss.com) - Styling
- React (react.dev) - Frontend framework
- Zustand (github.com/pmndrs/zustand) - State management

---

**End of Documentation**
