# Deployment Guide

## Phase 1: Local Development

### Prerequisites
- Go 1.21 or higher
- Make (optional, but recommended)

### Setup

1. Clone the repository (if applicable)
2. Install dependencies:
```bash
go mod download
```

3. Build the application:
```bash
make build
# or
go build -o bin/duha-brain ./cmd/duha-brain
```

4. Run the application:
```bash
make run
# or
./bin/duha-brain
```

5. Access the web UI:
Open `http://localhost:8080` in your browser

### Configuration

Environment variables:
```bash
export DUHA_PORT=8080
export DUHA_HOST=localhost
export DUHA_DB_PATH=./data/duha.db
export DUHA_LOG_LEVEL=info
```

Or create a `.env` file:
```
DUHA_PORT=8080
DUHA_HOST=localhost
DUHA_DB_PATH=./data/duha.db
DUHA_LOG_LEVEL=info
```

## Phase 5+: Raspberry Pi Deployment

The binary can be copied to a Raspberry Pi and run directly:

```bash
# On your laptop, build for Pi
GOOS=linux GOARCH=arm64 go build -o bin/duha-brain-pi ./cmd/duha-brain

# Copy to Pi
scp bin/duha-brain-pi pi@your-pi-ip:~/duha-brain/

# SSH into Pi and run
ssh pi@your-pi-ip
chmod +x ~/duha-brain/duha-brain-pi
~/duha-brain/duha-brain-pi
```

## Docker (Optional)

A Dockerfile is included for containerization:

```bash
docker build -t duha-brain .
docker run -p 8080:8080 -v duha-data:/app/data duha-brain
```

See `docker-compose.yml` for local development with Docker.

## Database

SQLite database is stored in `./data/duha.db`

No migration tool needed - schema is created automatically on first run.

### Backup

Simple file copy:
```bash
cp ./data/duha.db ./data/duha.db.backup
```

## Troubleshooting

### Port already in use
```bash
# Change port
export DUHA_PORT=8081
./bin/duha-brain
```

### Database locked
Make sure only one instance is running.

### Permission denied on Linux/Pi
```bash
chmod +x ./bin/duha-brain
```

---

See docs/design/PHASE_1_DESIGN.md for technical architecture.
