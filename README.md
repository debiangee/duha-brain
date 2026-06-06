# Duha Brain
A personal knowledge management system—your second brain. Write thoughts, collect book snippets, save articles, sync work tasks, and let a local LLM connect it all.

## Vision
Build a system where you can:

### Knowledge & Learning
1. **Write and organize thoughts** - Capture your ideas as you think them
2. **Collect book snippets** - Paste excerpts from books you're reading with context
3. **Save articles & URLs** - Archive web content and articles for later reference
4. **RSS feed integration** - Subscribe to blogs, Reddit communities, news sources
5. **Smart notifications** - Get notified when new RSS content matches your interests or relates to your current work
6. **Voice dumps** - Record audio thoughts → auto-transcribed into notes
7. **Capture handwritten notes** - Take photos of notebook/paper → OCR extraction → organized into system
8. **Import meeting recordings** - Upload Google Meet recordings (or other video/audio files) → auto-transcribed into notes

### Work & Productivity
7. **Sync personal goals & deadlines** - Track your personal and professional goals in one place
8. **Jira integration** - Dump Jira issues, tasks, and updates directly into the system
9. **Calendar sync** - Pull in your schedule, deadlines, and commitments
10. **Project tracking** - See all your projects (personal & work) at a glance

### Intelligence & Connections
11. **Automatic background processing** - Every hour (configurable), the LLM scours your notes to:
    - Link related thoughts and ideas
    - Suggest completions for vague/incomplete thoughts
    - Flag connections to your work tasks and goals
    - Generate research suggestions or follow-up questions
12. **Inbox of insights** - Get notified with suggestions, research leads, and thought completions when you return to the app
13. **Smart insights** - Get recommendations like "this article relates to your current Jira task" or "remember this goal when you read this"
14. **Unified search** - Find anything across all your content, work items, and knowledge

### Privacy & Control
14. **Local & private** - Core data stays on your machine (or Pi). LLM inference can be local, on a trusted device, or via paid API—your choice.

**The Goal**: One unified brain where everything you need to know, do, and remember lives. Your scattered thoughts, notes, meetings, goals, tasks, and deadlines become one searchable, intelligent, actionable knowledge base. Built for your laptop, scalable to a Raspberry Pi server, with flexible compute options.

## Tech Stack
- **Backend**: Go (API, orchestration, storage, web server)
- **Python**: Data processing, LLM integration, knowledge extraction, OCR, transcription
- **LLM & Embeddings** (flexible options):
  - Local: Ollama or Llama.cpp on a separate device
  - Cloud: OpenRouter API or similar (pay-per-use, more powerful)
  - Hybrid: Use local for fast queries, API for heavy lifting
- **OCR**: Tesseract or PaddleOCR (local, for handwritten notes)
- **Speech-to-Text**: Whisper (local, offline transcription)
- **Database**: SQLite (lightweight, good for Pi)
- **Integrations**: Jira API, Calendar API (Google Calendar, Outlook)
- **Frontend**: Web UI (accessible locally and remotely) with:
  - **Knowledge graph visualization** (like Obsidian's graph view - see connections between notes)
  - **Calendar view** (goals, deadlines, Jira due dates, meetings all in one place)
  - **Gantt chart** (project timelines, milestone tracking)
  - **Timeline view** (chronological view of your notes and activities)
  - **List/table views** (search results, task lists, RSS feeds)
  - CLI for power users
- **Deployment**: Laptop (dev), Raspberry Pi (production server), optional GPU device for LLM

## Roadmap

### Phase 1: Foundation
- [ ] Project structure & configuration
- [ ] Basic note storage (local file system or SQLite)
- [ ] Simple API to create/read/update notes
- [ ] CLI or basic UI for text input

**Goal**: Be able to write and save a thought locally.

### Phase 2: Multi-Format Data Ingestion
- [ ] Accept pasted text (thoughts, book snippets)
- [ ] Accept URL + article content (web scraping or paste)
- [ ] **RSS feed subscriptions** (add feeds from blogs, Reddit, news sources)
- [ ] **Feed polling** (fetch new articles on schedule)
- [ ] **Notification system** (alert on new items, especially ones matching your interests)
- [ ] **One-click save** (add interesting feed items to knowledge base)
- [ ] **Upload & OCR photos of handwritten notes** (camera/image → text extraction)
- [ ] **Upload & transcribe audio files** (voice memo → text transcription)
- [ ] **Upload & transcribe video files** (Google Meet recordings → text transcription)
- [ ] Metadata capture (source, date, tags, context, input method, meeting participants if available)
- [ ] Simple search/retrieve functionality

**Goal**: Collect all types of content from different sources (text, audio, video, images, RSS feeds) and retrieve it. Knowledge flows in from your curated feeds.

### Phase 2.5: Work & Productivity Integrations
- [ ] **Jira integration** (fetch issues, sprints, status updates)
- [ ] **Calendar sync** (import goals, deadlines, commitments)
- [ ] **Goal tracking** (personal & professional goals with deadlines)
- [ ] Store as structured data (not just text)
- [ ] Search and filter by type (Jira issues vs. notes vs. goals)

**Goal**: Have your work life (Jira, calendar, goals) and personal life (notes, thoughts, learning) in one system.

### Phase 3: LLM Integration & RAG
- [ ] Set up LLM provider (local Ollama, or OpenRouter API)
- [ ] Python service for LLM calls & embeddings
- [ ] **Flexible provider config** (switch between local and API without code changes)
- [ ] Embed all stored content (from text, OCR, transcriptions, Jira, goals)
- [ ] **RAG pipeline** - Retrieve relevant content from your knowledge base when generating suggestions
- [ ] Semantic search (find related items by meaning, not just keywords)

**Goal**: Build a powerful RAG system that understands your knowledge base deeply. LLM can run local or remote depending on your hardware.

### Phase 3.5: Web Search Integration (Optional)
- [ ] **DuckDuckGo API integration** (privacy-respecting web search)
- [ ] **Hybrid RAG** - Search YOUR knowledge first, then web if needed
- [ ] Use web search to enhance research suggestions, complete vague thoughts
- [ ] Cache results to minimize API calls
- [ ] User can toggle web search on/off

**Goal**: Your research partner can consult the internet when needed, combining your knowledge with current web info. Stay private with DuckDuckGo.

### Phase 4: Background Intelligence Engine
- [ ] **Scheduled LLM processing** (configurable, default hourly)
- [ ] **Thought completion** - LLM suggests completions for vague/incomplete notes (uses RAG + optional web search)
- [ ] **Link discovery** - Auto-link related thoughts, ideas, and content
- [ ] **Research suggestions** - Generate follow-up questions and research leads (from your knowledge + optionally the web)
- [ ] **Task connections** - Suggest links between personal notes and work tasks (Jira, goals)
- [ ] **Feed intelligence** - When new RSS items arrive, check if they relate to your current work/interests and surface relevant ones
- [ ] **Inbox system** - Store all AI-generated suggestions + notifications in a unified inbox
- [ ] User can accept/reject/refine suggestions (feedback loop improves quality)

**Goal**: Your notes get smarter while you sleep. You return to an inbox of insights, completions, connections, and curated feed items waiting for you.

### Phase 5: Intelligent Connections
- [ ] Visualization of relationships and dependencies (knowledge graph)
- [ ] Smart dashboard showing emerging themes from your notes
- [ ] Trend detection (what topics are you thinking about most?)
- [ ] Personalization based on feedback (learn what kinds of connections you care about)

**Goal**: See patterns and connections emerge from your scattered thoughts automatically.

### Phase 6: Polish & Features
- [ ] **Modern web UI** with multiple views:
  - Knowledge graph (node-link visualization of connected notes, ideas, tasks)
  - Calendar (integrated view of goals, deadlines, meetings, Jira due dates)
  - Gantt chart (project timelines, milestone tracking)
  - Timeline (chronological view of notes and activities)
  - List/table views (search results, task lists, RSS feeds)
- [ ] Full-text search + filters + metadata search
- [ ] Export (markdown, PDF, HTML)
- [ ] Responsive design (works on laptop, tablet, mobile)
- [ ] Dark/light mode
- [ ] Dashboard (customizable widgets)
- [ ] Obsidian plugin or browser extension (optional)
- [ ] Batch upload (multiple voice memos, multiple photos)
- [ ] Performance optimization
- [ ] Backup & sync options

**Goal**: Make it a beautiful, intuitive tool you actually want to use daily. Multiple views for different thinking modes.

## Project Structure

```
duha-brain/
├── docs/                           # All documentation
│   ├── design/
│   │   └── PHASE_1_DESIGN.md      # Architecture & design for Phase 1
│   ├── api/
│   │   └── API.md                 # API documentation
│   └── deployment/
│       └── DEPLOYMENT.md          # Deployment guide
├── cmd/
│   └── duha-brain/                # Application entry point
│       └── main.go
├── internal/                       # Core application logic
│   ├── api/                        # HTTP handlers and routes
│   ├── database/                   # Database operations
│   ├── models/                     # Data structures
│   ├── storage/                    # Storage layer
│   ├── utils/                      # Utilities
│   └── config/                     # Configuration
├── web/                            # Frontend UI
│   ├── index.html
│   └── public/                     # Static assets
│       ├── css/
│       └── js/
├── data/                           # Runtime data (SQLite db, logs)
├── tests/                          # Test suite
│   ├── unit/
│   └── integration/
├── .kiro/                          # Kiro configuration
├── go.mod
├── go.sum
├── Makefile
├── docker-compose.yml
└── README.md                       # You are here
```

## Setup & Development

### Prerequisites
- Go 1.21+
- Make (optional)

### Quick Start

1. **Build**
```bash
make build
# or: go build -o bin/duha-brain ./cmd/duha-brain
```

2. **Run**
```bash
make run
# or: ./bin/duha-brain
```

3. **Access**
- Web UI: `http://localhost:8080`
- API: `http://localhost:8080/api/v1/...`

### Testing
```bash
make test
# or: go test ./...
```

## Contributing

### Before You Start
1. Read `docs/design/PHASE_1_DESIGN.md` to understand the architecture
2. Check `README.md` (this file) for the current roadmap
3. Review relevant design docs in `docs/`

### Development Workflow
1. Create a branch for your feature
2. Write code following Go conventions
3. Add tests for new functionality
4. Submit changes with clear commit messages
5. Reference the phase in your commit: `feat(phase1): Add note creation API`

### Code Style
- Use `gofmt` for formatting
- Write clear, readable code
- Add comments for complex logic
- Keep functions small and focused

### Testing Requirements
- Write unit tests for storage and business logic
- Write integration tests for API endpoints
- All tests must pass before merge: `make test`

## Development Process

We build incrementally:
1. **Agree on phase goals** - Clarify what we're building
2. **Design the phase** - Document architecture in `docs/design/`
3. **Implement step-by-step** - Code in small, testable chunks
4. **Test and iterate** - Validate before moving on
5. **Move to next phase** - Lock in learning, start next phase

No rushing into code—just building when we have clarity on what we're building.

## Documentation

- **Architecture**: See `docs/design/PHASE_1_DESIGN.md`
- **API**: See `docs/api/API.md`
- **Deployment**: See `docs/deployment/DEPLOYMENT.md`
- **Roadmap**: See this README (Vision & Roadmap sections)

## License

(To be determined)

## Contact

For questions or discussions about Duha Brain, create an issue or discussion in the repository.
