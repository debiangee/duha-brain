.PHONY: build run test clean help fmt lint

# Default target
help:
	@echo "Duha Brain - Build commands"
	@echo ""
	@echo "make build          - Build the application"
	@echo "make run            - Run the application"
	@echo "make test           - Run tests"
	@echo "make clean          - Clean build artifacts"
	@echo "make fmt            - Format code"
	@echo "make deps           - Download dependencies"
	@echo ""

# Build the application
build:
	@echo "Building Duha Brain..."
	@mkdir -p bin
	@go build -o bin/duha-brain.exe ./cmd/duha-brain
	@echo "Build complete: bin/duha-brain.exe"

# Run the application
run: build
	@echo "Running Duha Brain..."
	@.\bin\duha-brain.exe

# Run tests
test:
	@echo "Running tests..."
	@go test -v -race ./...

# Clean build artifacts
clean:
	@echo "Cleaning up..."
	@rm -rf bin/
	@go clean
	@echo "Clean complete"

# Format code
fmt:
	@echo "Formatting code..."
	@go fmt ./...
	@echo "Format complete"

# Download dependencies
deps:
	@echo "Downloading dependencies..."
	@go mod download
	@go mod tidy
	@echo "Dependencies installed"

# Install linter (optional)
lint:
	@echo "Running linter..."
	@go vet ./...

# Development mode with hot reload (requires entr or similar)
dev:
	@echo "Starting development mode..."
	@make deps
	@make build
	@make run
