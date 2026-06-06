package models

import (
	"encoding/json"
	"time"
)

// NoteType defines the type of note
type NoteType string

const (
	TypeThought NoteType = "thought"
	TypeSnippet NoteType = "snippet"
	TypeArticle NoteType = "article"
	TypeVoice   NoteType = "voice"
	TypeImage   NoteType = "image"
	TypeVideo   NoteType = "video"
	TypeMeeting NoteType = "meeting"
	TypeJira    NoteType = "jira"
	TypeGoal    NoteType = "goal"
	TypeFeed    NoteType = "feed"
)

// NoteSource defines where the note came from
type NoteSource string

const (
	SourceManual      NoteSource = "manual"
	SourceURL         NoteSource = "url"
	SourceFile        NoteSource = "file"
	SourceIntegration NoteSource = "integration"
)

// NoteStatus defines the status of a note
type NoteStatus string

const (
	StatusDraft    NoteStatus = "draft"
	StatusActive   NoteStatus = "active"
	StatusArchived NoteStatus = "archived"
)

// Note represents a single note in the system
type Note struct {
	ID        string                 `json:"id"`
	Title     string                 `json:"title"`
	Content   string                 `json:"content"`
	Type      NoteType               `json:"type"`
	Tags      []string               `json:"tags"`
	Source    NoteSource             `json:"source"`
	CreatedAt time.Time              `json:"createdAt"`
	UpdatedAt time.Time              `json:"updatedAt"`
	Metadata  map[string]interface{} `json:"metadata"`
	Status    NoteStatus             `json:"status"`
}

// CreateNoteRequest is the request body for creating a note
type CreateNoteRequest struct {
	Title    string                 `json:"title" validate:"required"`
	Content  string                 `json:"content" validate:"required"`
	Type     NoteType               `json:"type" validate:"required"`
	Tags     []string               `json:"tags"`
	Source   NoteSource             `json:"source"`
	Metadata map[string]interface{} `json:"metadata"`
}

// UpdateNoteRequest is the request body for updating a note
type UpdateNoteRequest struct {
	Title    *string                `json:"title"`
	Content  *string                `json:"content"`
	Type     *NoteType              `json:"type"`
	Tags     []string               `json:"tags"`
	Metadata map[string]interface{} `json:"metadata"`
	Status   *NoteStatus            `json:"status"`
}

// ListNotesQuery holds query parameters for listing notes
type ListNotesQuery struct {
	Type          *string `query:"type"`
	Tag           *string `query:"tag"`
	Status        *string `query:"status"`
	Search        *string `query:"search"`
	CreatedAfter  *string `query:"createdAfter"`
	CreatedBefore *string `query:"createdBefore"`
	Limit         int     `query:"limit"`
	Offset        int     `query:"offset"`
}

// ListNotesResponse is the response for listing notes
type ListNotesResponse struct {
	Data       []Note     `json:"data"`
	Pagination Pagination `json:"pagination"`
}

// Pagination holds pagination information
type Pagination struct {
	Total  int64 `json:"total"`
	Limit  int   `json:"limit"`
	Offset int   `json:"offset"`
	HasMore bool  `json:"hasMore"`
}

// MarshalJSON converts Metadata to JSON
func (n *Note) MarshalJSON() ([]byte, error) {
	type Alias Note
	return json.Marshal(&struct {
		*Alias
	}{
		Alias: (*Alias)(n),
	})
}

// UnmarshalJSON unmarshals JSON into Note
func (n *Note) UnmarshalJSON(data []byte) error {
	type Alias Note
	aux := &struct {
		*Alias
	}{
		Alias: (*Alias)(n),
	}
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}
	return nil
}
