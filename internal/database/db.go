package database

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

// DB wraps the database connection
type DB struct {
	conn *sql.DB
}

// New creates a new database connection
func New(dbPath string) (*DB, error) {
	conn, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test the connection
	if err := conn.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Configure connection pool
	conn.SetMaxOpenConns(25)
	conn.SetMaxIdleConns(5)

	db := &DB{conn: conn}

	// Initialize schema
	if err := db.initSchema(); err != nil {
		return nil, fmt.Errorf("failed to initialize schema: %w", err)
	}

	return db, nil
}

// Close closes the database connection
func (db *DB) Close() error {
	if db.conn != nil {
		return db.conn.Close()
	}
	return nil
}

// GetConn returns the underlying database connection
func (db *DB) GetConn() *sql.DB {
	return db.conn
}

// initSchema creates the necessary tables if they don't exist
func (db *DB) initSchema() error {
	schema := `
	CREATE TABLE IF NOT EXISTS notes (
		id TEXT PRIMARY KEY,
		title TEXT NOT NULL,
		content TEXT NOT NULL,
		type TEXT NOT NULL,
		tags TEXT,
		source TEXT NOT NULL,
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL,
		metadata TEXT,
		status TEXT DEFAULT 'active'
	);

	CREATE INDEX IF NOT EXISTS idx_type ON notes(type);
	CREATE INDEX IF NOT EXISTS idx_created_at ON notes(created_at);
	CREATE INDEX IF NOT EXISTS idx_status ON notes(status);
	CREATE INDEX IF NOT EXISTS idx_source ON notes(source);

	CREATE TABLE IF NOT EXISTS feeds (
		id TEXT PRIMARY KEY,
		title TEXT NOT NULL,
		url TEXT NOT NULL UNIQUE,
		description TEXT,
		last_fetched DATETIME,
		fetch_error TEXT,
		is_active BOOLEAN DEFAULT 1,
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL
	);

	CREATE INDEX IF NOT EXISTS idx_feed_url ON feeds(url);
	CREATE INDEX IF NOT EXISTS idx_feed_active ON feeds(is_active);
	CREATE INDEX IF NOT EXISTS idx_feed_last_fetched ON feeds(last_fetched);

	CREATE TABLE IF NOT EXISTS feed_items (
		id TEXT PRIMARY KEY,
		feed_id TEXT NOT NULL,
		title TEXT NOT NULL,
		link TEXT NOT NULL UNIQUE,
		description TEXT,
		content TEXT,
		pub_date DATETIME,
		guid TEXT,
		is_saved BOOLEAN DEFAULT 0,
		saved_note_id TEXT,
		fetched_at DATETIME NOT NULL,
		FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE,
		FOREIGN KEY (saved_note_id) REFERENCES notes(id) ON DELETE SET NULL
	);

	CREATE INDEX IF NOT EXISTS idx_feed_items_feed ON feed_items(feed_id);
	CREATE INDEX IF NOT EXISTS idx_feed_items_saved ON feed_items(is_saved);
	CREATE INDEX IF NOT EXISTS idx_feed_items_pub_date ON feed_items(pub_date);
	CREATE INDEX IF NOT EXISTS idx_feed_items_fetched ON feed_items(fetched_at);
	`

	if _, err := db.conn.Exec(schema); err != nil {
		return fmt.Errorf("failed to create schema: %w", err)
	}

	return nil
}
