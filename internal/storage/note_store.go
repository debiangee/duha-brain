package storage

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/cheenee/duha-brain/internal/models"
	"github.com/google/uuid"
)

// NoteStore handles note persistence
type NoteStore struct {
	db *sql.DB
}

// NewNoteStore creates a new note store
func NewNoteStore(db *sql.DB) *NoteStore {
	return &NoteStore{db: db}
}

// Create creates a new note
func (s *NoteStore) Create(ctx context.Context, req *models.CreateNoteRequest) (*models.Note, error) {
	note := &models.Note{
		ID:        uuid.New().String(),
		Title:     req.Title,
		Content:   req.Content,
		Type:      req.Type,
		Tags:      req.Tags,
		Source:    req.Source,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Metadata:  req.Metadata,
		Status:    models.StatusActive,
	}

	if note.Metadata == nil {
		note.Metadata = make(map[string]interface{})
	}

	// Marshal tags and metadata to JSON
	tagsJSON, _ := json.Marshal(note.Tags)
	metadataJSON, _ := json.Marshal(note.Metadata)

	query := `
	INSERT INTO notes (id, title, content, type, tags, source, created_at, updated_at, metadata, status)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := s.db.ExecContext(ctx, query,
		note.ID,
		note.Title,
		note.Content,
		note.Type,
		string(tagsJSON),
		note.Source,
		note.CreatedAt,
		note.UpdatedAt,
		string(metadataJSON),
		note.Status,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create note: %w", err)
	}

	return note, nil
}

// GetByID retrieves a note by ID
func (s *NoteStore) GetByID(ctx context.Context, id string) (*models.Note, error) {
	note := &models.Note{}
	var tagsJSON, metadataJSON string

	query := `
	SELECT id, title, content, type, tags, source, created_at, updated_at, metadata, status
	FROM notes WHERE id = ?
	`

	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&note.ID,
		&note.Title,
		&note.Content,
		&note.Type,
		&tagsJSON,
		&note.Source,
		&note.CreatedAt,
		&note.UpdatedAt,
		&metadataJSON,
		&note.Status,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("note not found")
		}
		return nil, fmt.Errorf("failed to get note: %w", err)
	}

	// Unmarshal JSON
	_ = json.Unmarshal([]byte(tagsJSON), &note.Tags)
	_ = json.Unmarshal([]byte(metadataJSON), &note.Metadata)

	return note, nil
}

// Update updates an existing note
func (s *NoteStore) Update(ctx context.Context, id string, req *models.UpdateNoteRequest) (*models.Note, error) {
	// Get existing note
	note, err := s.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Update fields
	if req.Title != nil {
		note.Title = *req.Title
	}
	if req.Content != nil {
		note.Content = *req.Content
	}
	if req.Type != nil {
		note.Type = *req.Type
	}
	if len(req.Tags) > 0 {
		note.Tags = req.Tags
	}
	if req.Metadata != nil {
		note.Metadata = req.Metadata
	}
	if req.Status != nil {
		note.Status = *req.Status
	}

	note.UpdatedAt = time.Now()

	// Marshal JSON
	tagsJSON, _ := json.Marshal(note.Tags)
	metadataJSON, _ := json.Marshal(note.Metadata)

	query := `
	UPDATE notes
	SET title = ?, content = ?, type = ?, tags = ?, metadata = ?, status = ?, updated_at = ?
	WHERE id = ?
	`

	_, err = s.db.ExecContext(ctx, query,
		note.Title,
		note.Content,
		note.Type,
		string(tagsJSON),
		string(metadataJSON),
		note.Status,
		note.UpdatedAt,
		id,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to update note: %w", err)
	}

	return note, nil
}

// Delete soft-deletes a note by setting status to archived
func (s *NoteStore) Delete(ctx context.Context, id string) error {
	query := `UPDATE notes SET status = ?, updated_at = ? WHERE id = ?`
	result, err := s.db.ExecContext(ctx, query, models.StatusArchived, time.Now(), id)

	if err != nil {
		return fmt.Errorf("failed to delete note: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get affected rows: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("note not found")
	}

	return nil
}

// List retrieves notes with filtering and pagination
func (s *NoteStore) List(ctx context.Context, query *models.ListNotesQuery) (*models.ListNotesResponse, error) {
	// Set defaults
	if query.Limit <= 0 || query.Limit > 100 {
		query.Limit = 10
	}
	if query.Offset < 0 {
		query.Offset = 0
	}

	// Build WHERE clause
	where := []string{"status != ?"}
	args := []interface{}{models.StatusArchived}

	if query.Type != nil && *query.Type != "" {
		where = append(where, "type = ?")
		args = append(args, *query.Type)
	}

	if query.Tag != nil && *query.Tag != "" {
		where = append(where, "tags LIKE ?")
		args = append(args, "%"+*query.Tag+"%")
	}

	if query.Status != nil && *query.Status != "" {
		where = append(where, "status = ?")
		args = append(args, *query.Status)
	}

	if query.Search != nil && *query.Search != "" {
		search := "%" + *query.Search + "%"
		where = append(where, "(title LIKE ? OR content LIKE ?)")
		args = append(args, search, search)
	}

	if query.CreatedAfter != nil && *query.CreatedAfter != "" {
		where = append(where, "created_at >= ?")
		args = append(args, *query.CreatedAfter)
	}

	if query.CreatedBefore != nil && *query.CreatedBefore != "" {
		where = append(where, "created_at <= ?")
		args = append(args, *query.CreatedBefore)
	}

	whereSQL := strings.Join(where, " AND ")

	// Get total count
	countQuery := "SELECT COUNT(*) FROM notes WHERE " + whereSQL
	var total int64
	err := s.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count notes: %w", err)
	}

	// Get paginated results
	listQuery := fmt.Sprintf(`
	SELECT id, title, content, type, tags, source, created_at, updated_at, metadata, status
	FROM notes
	WHERE %s
	ORDER BY created_at DESC
	LIMIT ? OFFSET ?
	`, whereSQL)

	args = append(args, query.Limit, query.Offset)

	rows, err := s.db.QueryContext(ctx, listQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list notes: %w", err)
	}
	defer rows.Close()

	notes := []models.Note{}
	for rows.Next() {
		var note models.Note
		var tagsJSON, metadataJSON string

		err := rows.Scan(
			&note.ID,
			&note.Title,
			&note.Content,
			&note.Type,
			&tagsJSON,
			&note.Source,
			&note.CreatedAt,
			&note.UpdatedAt,
			&metadataJSON,
			&note.Status,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan note: %w", err)
		}

		_ = json.Unmarshal([]byte(tagsJSON), &note.Tags)
		_ = json.Unmarshal([]byte(metadataJSON), &note.Metadata)

		notes = append(notes, note)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to read rows: %w", err)
	}

	hasMore := int64(query.Offset+query.Limit) < total

	return &models.ListNotesResponse{
		Data: notes,
		Pagination: models.Pagination{
			Total:   total,
			Limit:   query.Limit,
			Offset:  query.Offset,
			HasMore: hasMore,
		},
	}, nil
}
