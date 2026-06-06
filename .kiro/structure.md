# Duha Brain - Project Structure Guide

## Overview

This document explains the structure of the Duha Brain project.

## Directory Layout

### Root Level
- `README.md` - Project overview and roadmap
- `QUICKSTART.md` - Quick start guide for developers
- `PHASE_1_COMPLETE.md` - Phase 1 completion summary
- `Makefile` - Build automation
- `go.mod` - Go module definition
- `go.sum` - Go dependencies checksums
- `.gitattributes` - Git attributes
- `LICENSE` - Project license

### `/docs` - All Documentation
- `api/API.md` - REST API reference
- `deployment/DEPLOYMENT.md` - Deployment instructions
- `design/PHASE_1_DESIGN.md` - Detailed Phase 1 architecture
- `design/PHASE_1_SUMMARY.md` - Phase 1 implementation summary

### `/cmd/duha-brain` - Application Entry Point
- `main.go` - Application bootstrap

### `/internal` - Core Application Code
#### `/internal/api` - HTTP API Layer
- `handlers.go` - HTTP request handlers for all endpoints
- `router.go` - Route registration and middleware setup

#### `/internal/database` - Database Layer
- `db.go` - Database connection and schema initialization

#### `/internal/models` - Data Models
- `note.go` - Note struct and request/response types

#### `/internal/storage` - Data Access Layer
- `note_store.go` - CRUD operations and queries

#### `/internal/utils` - Utilities
- `logger.go` - Logging functionality
- `errors.go` - Error types and HTTP status mapping

#### `/internal/config` - Configuration
- `config.go` - Configuration loading from env vars or files

### `/web` - Frontend User Interface
- `index.html` - Main HTML page
- `public/css/style.css` - Stylesheet
- `public/js/app.js` - Frontend JavaScript logic

### `/data` - Runtime Data
- `duha.db` - SQLite database file (created at runtime)
- Other runtime data files

### `/bin` - Compiled Binaries
- `duha-brain` - Compiled application binary

### `/tests` - Test Suite
- `unit/` - Unit tests (ready for implementation)
- `integration/` - Integration tests (ready for implementation)

### `/.kiro` - Kiro Configuration
- Kiro IDE configuration files (if using Kiro editor)

## Data Flow

```
User (Web Browser)
    ↓
Frontend (web/public/js/app.js)
    ↓
REST API (internal/api/handlers.go)
    ↓
Business Logic (internal/storage/note_store.go)
    ↓
Database (internal/database/db.go)
    ↓
SQLite (data/duha.db)
```

## Code Organization Principles

1. **Separation of Concerns**
   - API layer handles HTTP
   - Storage layer handles database
   - Models define data structures
   - Utils provide shared functionality

2. **Clean Architecture**
   - Internal code organized by functional area
   - Clear dependencies between layers
   - Testable components

3. **Configuration Management**
   - Environment variables override defaults
   - Config file support (config.yaml)
   - Centralized in one place

4. **Error Handling**
   - Consistent error types
   - HTTP status code mapping
   - Meaningful error messages

## Adding New Features

### To Add a New Endpoint

1. Create handler in `internal/api/handlers.go`
2. Add route in `internal/api/router.go`
3. Add storage method in `internal/storage/note_store.go` if needed
4. Document in `docs/api/API.md`
5. Add frontend functionality if needed

### To Add a New Data Type

1. Add struct to `internal/models/`
2. Create store in `internal/storage/`
3. Add database table in `internal/database/db.go`
4. Create API handlers in `internal/api/handlers.go`

### To Add Configuration

1. Add to config struct in `internal/config/config.go`
2. Set defaults and environment variable bindings
3. Document in README or QUICKSTART

## Key Files

### Most Important Files
- `cmd/duha-brain/main.go` - Application start
- `internal/api/handlers.go` - API endpoints
- `internal/storage/note_store.go` - Database operations
- `web/index.html` - User interface
- `web/public/js/app.js` - Frontend logic

### Reference Files
- `docs/design/PHASE_1_DESIGN.md` - Architecture reference
- `go.mod` - Dependency versions
- `Makefile` - Build commands

## Development Workflow

1. Modify code in `internal/` or `web/`
2. Run `make build` to compile
3. Run `make run` to start the application
4. Test via web UI or API
5. Commit changes when satisfied

## Build System

All common tasks are in `Makefile`:
- `make build` - Compile application
- `make run` - Run application
- `make test` - Run tests
- `make clean` - Clean build artifacts
- `make fmt` - Format code
- `make deps` - Download dependencies

## Database

- Type: SQLite 3
- Location: `./data/duha.db`
- Schema: Automatically created on first run
- Backup: Simple file copy of `data/duha.db`

## API Structure

```
/api/v1/
├── notes          - CRUD operations
│   └── :id       - Individual note endpoints
└── health        - Health check
```

## Frontend Structure

- Single HTML file: `web/index.html`
- One JavaScript file: `web/public/js/app.js`
- One CSS file: `web/public/css/style.css`
- No build step needed
- No npm/node required

## Deployment

1. Build: `go build -o bin/duha-brain ./cmd/duha-brain`
2. Run: `./bin/duha-brain`
3. Access: `http://localhost:8080`

Single binary, single database file - that's it!

## Testing

Tests go in `/tests`:
- Unit tests in `tests/unit/`
- Integration tests in `tests/integration/`
- Run with: `make test`

## Documentation

- **Quick Start**: `QUICKSTART.md`
- **API Reference**: `docs/api/API.md`
- **Design Details**: `docs/design/PHASE_1_DESIGN.md`
- **Deployment**: `docs/deployment/DEPLOYMENT.md`
- **Project Overview**: `README.md`

---

For more details, see the documentation files in `/docs`.
