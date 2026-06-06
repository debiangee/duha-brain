# Quick Start Guide - Duha Brain

## Prerequisites
- Go 1.21 or higher
- Node.js 18+ (for React frontend)
- npm or yarn

## Installation & Setup

### Option 1: Quick Start (Windows)
Simply run the batch file:
```bash
run.bat
```

This will:
1. Ensure the frontend is built
2. Start the backend on `http://localhost:8080`

### Option 2: Manual Setup

#### Backend
```bash
# From project root
go build -o bin/duha-brain.exe ./cmd/duha-brain
./bin/duha-brain.exe
```

#### Frontend
```bash
# From web folder
npm install
npm run build
```

## Starting the Application

### On Windows
```bash
run.bat
```

### On macOS/Linux
```bash
make run
# or
go run ./cmd/duha-brain/main.go
```

You should see:
```
Starting Duha Brain...
Frontend: http://localhost:8080
API: http://localhost:8080/api/v1
```

## Accessing the Application

1. Open your browser to: **http://localhost:8080**
2. You should see the Duha Brain interface with:
   - Left sidebar with folder navigation
   - Top search bar
   - Main content area with note form and list

## Using the App

### Create a Note
1. Type in the text area under "What's on your mind?"
2. Click **Save** - the title is auto-detected from the first line
3. Your note appears in the list below

### Search Notes
1. Use the search bar at the top
2. Type to search by title or content
3. Results update in real-time

### View Note Details
1. Click on any note card
2. The note is highlighted/selected

## Debugging White Screen Issue

If you see a blank white page:

1. **Open Browser DevTools** (F12)
2. Check the **Console** tab for errors
3. Check the **Network** tab:
   - JavaScript files should load (index-*.js)
   - CSS files should load (index-*.css)
   - API calls to `/api/v1/notes` should work

4. **Common issues**:
   - API returning errors: Check backend logs
   - CORS issues: Check browser console
   - Missing assets: Rebuild with `npm run build`

5. **Quick fix**:
   ```bash
   cd web
   npm run build
   cd ..
   go build -o bin/duha-brain.exe ./cmd/duha-brain
   run.bat
   ```

## Using the API

### Create a Note
```bash
curl -X POST http://localhost:8080/api/v1/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Thought",
    "content": "This is what I am thinking about",
    "type": "thought",
    "tags": [],
    "source": "manual"
  }'
```

### List Notes
```bash
curl http://localhost:8080/api/v1/notes
```

### Search Notes
```bash
curl "http://localhost:8080/api/v1/notes?search=keyword"
```

### Get a Note
```bash
curl http://localhost:8080/api/v1/notes/{noteId}
```

### Update a Note
```bash
curl -X PUT http://localhost:8080/api/v1/notes/{noteId} \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

### Delete a Note
```bash
curl -X DELETE http://localhost:8080/api/v1/notes/{noteId}
```

## Configuration

Default settings (in `internal/config/config.go`):
- Port: `8080`
- Database: `./data/duha.db`
- Log Level: `info`

To customize, set environment variables:
```bash
set DUHA_PORT=8080
set DUHA_HOST=localhost
set DUHA_DB_PATH=./data/duha.db
set DUHA_LOG_LEVEL=info
```

## Development

### Frontend Development
```bash
cd web
npm run dev
# Opens dev server on http://localhost:5173
# Backend proxy configured for API calls
```

### Backend Development
```bash
go run ./cmd/duha-brain/main.go
# Watch for changes and rebuild as needed
```

## Stopping the Application

- Press **Ctrl+C** in the terminal running the backend
- Or close the `run.bat` window

## Common Commands

```bash
# Build everything
make build

# Run everything
make run

# Run tests
make test

# Format code
make fmt

# Clean build artifacts
make clean

# Install dependencies
make deps
```

## Architecture

```
duha-brain/
├── cmd/duha-brain/        # Entry point
├── internal/
│   ├── api/              # HTTP handlers & routes
│   ├── database/         # SQLite setup
│   ├── storage/          # Note persistence
│   ├── models/           # Data structures
│   ├── config/           # Configuration
│   └── utils/            # Logging, errors
├── web/                  # React frontend
│   ├── src/              # TypeScript/React source
│   ├── dist/             # Built assets
│   └── package.json
├── data/                 # SQLite database
└── docs/                 # Documentation
```

## What's Next?

Phase 1 foundation complete! Upcoming phases:
- **Phase 2**: Multi-format ingestion (audio, images, URLs, RSS feeds)
- **Phase 3**: LLM integration (embeddings, search, suggestions)
- **Phase 4**: Background processing (linking notes, auto-completion)
- **Phase 5**: Advanced visualization (graph view, calendar, Gantt charts)

## Documentation

- **Design**: `docs/design/PHASE_1_DESIGN.md`
- **API Reference**: `docs/api/API.md`
- **Deployment**: `docs/deployment/DEPLOYMENT.md`

Happy building! 🧠✨

