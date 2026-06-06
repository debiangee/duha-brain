# Phase 1 Design: Foundation

## Goal
Be able to write and save a thought locally, with a simple API and basic UI/CLI for input.

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│           Web UI / CLI                          │
│  (simple form to create/read notes)             │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│       Go Backend (REST API)                     │
│  - Note CRUD operations                         │
│  - Basic search                                 │
│  - Metadata handling                            │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│       SQLite Database                           │
│  - Local storage                                │
│  - Lightweight, no setup needed                 │
└─────────────────────────────────────────────────┘
```

## Data Model

### Note Structure
```json
{
  "id": "uuid",
  "title": "string",
  "content": "string (markdown)",
  "type": "thought|snippet|article|voice|image|video|meeting|jira|goal|feed",
  "tags": ["string"],
  "source": "manual|url|file|integration",
  "createdAt": "ISO8601 timestamp",
  "updatedAt": "ISO8601 timestamp",
  "metadata": {
    "sourceUrl": "string (optional)",
    "sourceTitle": "string (optional)",
    "fileName": "string (optional)",
    "externalId": "string (optional - for Jira, etc)"
  },
  "status": "draft|active|archived"
}
```

### Database Schema
```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  tags TEXT,  -- JSON array as string
  source TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  metadata TEXT,  -- JSON as string
  status TEXT DEFAULT 'active'
);

CREATE INDEX idx_type ON notes(type);
CREATE INDEX idx_created_at ON notes(created_at);
CREATE INDEX idx_status ON notes(status);
```

## API Endpoints (REST)

### Core CRUD
```
POST   /api/v1/notes              - Create a note
GET    /api/v1/notes/:id          - Get a note by ID
PUT    /api/v1/notes/:id          - Update a note
DELETE /api/v1/notes/:id          - Delete a note (soft delete: status=archived)
GET    /api/v1/notes              - List all notes (with pagination, filtering)
```

### Query/Search
```
GET    /api/v1/notes?type=thought&limit=10&offset=0
GET    /api/v1/notes?search=keyword
GET    /api/v1/notes?tag=golang
GET    /api/v1/notes?status=active
```

### Statistics (future, but prep for it)
```
GET    /api/v1/stats              - Count of notes by type, total, etc.
```

## Request/Response Examples

### Create a Note
```bash
POST /api/v1/notes
Content-Type: application/json

{
  "title": "REST API Design Best Practices",
  "content": "# Key points\n- Use proper HTTP verbs\n- Versioning URLs\n- Pagination...",
  "type": "thought",
  "tags": ["api", "design", "golang"],
  "source": "manual"
}

Response (201):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "REST API Design Best Practices",
  "content": "# Key points\n- Use proper HTTP verbs\n- Versioning URLs\n- Pagination...",
  "type": "thought",
  "tags": ["api", "design", "golang"],
  "source": "manual",
  "createdAt": "2026-06-06T10:30:00Z",
  "updatedAt": "2026-06-06T10:30:00Z",
  "metadata": {},
  "status": "active"
}
```

### List Notes
```bash
GET /api/v1/notes?type=thought&limit=10&offset=0

Response (200):
{
  "data": [
    { note object },
    { note object }
  ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

## Project Structure

```
duha-brain/
├── docs/
│   ├── design/
│   │   └── PHASE_1_DESIGN.md       # This file
│   ├── api/
│   │   └── API.md                  # API documentation
│   └── deployment/
│       └── DEPLOYMENT.md           # Deployment guide
├── cmd/
│   └── duha-brain/
│       └── main.go                 # Entry point
├── internal/
│   ├── api/
│   │   ├── handlers.go             # HTTP request handlers
│   │   ├── middleware.go           # Middleware (logging, errors)
│   │   └── router.go               # Route setup
│   ├── database/
│   │   ├── db.go                   # Database connection
│   │   ├── migrations.go           # Schema setup
│   │   └── queries.go              # Query helpers
│   ├── models/
│   │   └── note.go                 # Note struct
│   ├── storage/
│   │   └── note_store.go           # Note CRUD operations
│   ├── utils/
│   │   ├── logger.go               # Logging utility
│   │   └── errors.go               # Error handling
│   └── config/
│       └── config.go               # Configuration loading
├── web/
│   ├── index.html                  # Main page
│   ├── public/
│   │   ├── css/
│   │   │   └── style.css
│   │   └── js/
│   │       └── app.js
├── data/                           # SQLite database stored here
├── tests/
│   ├── unit/
│   └── integration/
├── .kiro/                          # Kiro configuration
├── go.mod
├── go.sum
├── Makefile
├── docker-compose.yml
└── README.md
```

## Technology Choices (Phase 1)

| Component | Choice | Why |
|-----------|--------|-----|
| Backend | Go + Echo/Chi | Fast, simple, easy to deploy to Pi |
| Database | SQLite | Zero setup, local, portable |
| Frontend | Vanilla HTML/JS + simple CSS | Lightweight, no build step needed, easy to iterate |
| Port | 8080 | Standard, easy to remember |
| Storage | SQLite in ./data/ | Simple, portable, no external deps |

## Frontend (Phase 1) - Simple Web UI

**Single page with:**
1. **New Note Form** - Title, Content (textarea), Type dropdown, Tags input
2. **Notes List** - Recent notes, filter by type
3. **Note Detail View** - Click to open, edit inline, delete button
4. **Simple Search** - Search by title/content

**No frameworks** - just vanilla JS fetching API endpoints. Keep it lightweight.

## CLI Option (Phase 1) - Simple Terminal Interface

Users can also interact via CLI:
```bash
# Create a note
duha-brain note create "My thought" "Full content here" --type thought --tag golang

# List notes
duha-brain note list --type thought

# Get a note
duha-brain note get <id>

# Update a note
duha-brain note update <id> "Updated content"

# Delete a note
duha-brain note delete <id>
```

## Development Workflow

### 1. Setup
- Go 1.21+
- Make or manual commands
- SQLite (bundled with Go)

### 2. Build
```bash
make build
# or
go build -o bin/duha-brain ./cmd/duha-brain
```

### 3. Run
```bash
make run
# or
./bin/duha-brain
```

### 4. Access
- Web UI: `http://localhost:8080`
- API: `http://localhost:8080/api/v1/...`

## Configuration (Phase 1)

Simple config file or env vars:
```yaml
# config.yaml
server:
  port: 8080
  host: localhost

database:
  path: ./data/duha.db

logging:
  level: info
  format: json
```

Or env vars:
```
DUHA_PORT=8080
DUHA_DB_PATH=./data/duha.db
DUHA_LOG_LEVEL=info
```

## Testing Strategy (Phase 1)

1. **Unit tests** for storage/database operations
2. **Integration tests** for API endpoints
3. **Manual testing** via Postman/curl for now

```bash
make test
# or
go test ./...
```

## Deployment (Phase 1)

**Laptop:** Just run `make run` or `./bin/duha-brain`

**Future (Pi):** Single binary + SQLite db, no external dependencies. Copy binary and run.

## What We DON'T Do in Phase 1

- Multi-device sync (will add in Phase 5)
- Web scraping (Phase 2)
- Audio/OCR (Phase 2)
- RSS feeds (Phase 2)
- Jira integration (Phase 2.5)
- LLM/embeddings (Phase 3)
- Background processing (Phase 4)
- Advanced UI visualizations (Phase 6)

## Success Criteria for Phase 1

- [ ] Can create a note via web UI or CLI
- [ ] Can read/update/delete notes
- [ ] Can list and filter notes
- [ ] Simple search works
- [ ] API is documented
- [ ] No external dependencies (except SQLite which comes with Go)
- [ ] Runs on laptop locally
- [ ] Data persists in SQLite

## Next Steps After Phase 1

Once Phase 1 is done and validated:
1. Review the architecture - does it feel right?
2. Refine based on learnings
3. Start Phase 2 (multi-format ingestion)

---

## Implementation Checklist

- [ ] Setup Go project structure
- [ ] Create database schema and migrations
- [ ] Build Note model and storage layer
- [ ] Create REST API with CRUD endpoints
- [ ] Build simple web UI (HTML/JS)
- [ ] Add CLI interface
- [ ] Add logging and error handling
- [ ] Write tests
- [ ] Documentation (API, setup, usage)
