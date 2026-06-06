package utils

import "net/http"

// APIError represents an API error response
type APIError struct {
	Message string      `json:"error"`
	Code    string      `json:"code"`
	Status  string      `json:"status"`
	Details interface{} `json:"details,omitempty"`
}

// NewAPIError creates a new API error
func NewAPIError(message, code string) *APIError {
	return &APIError{
		Message: message,
		Code:    code,
		Status:  "error",
	}
}

// WithDetails adds details to the error
func (e *APIError) WithDetails(details interface{}) *APIError {
	e.Details = details
	return e
}

// StatusCode returns the HTTP status code for the error
func (e *APIError) StatusCode() int {
	switch e.Code {
	case "VALIDATION_ERROR":
		return http.StatusBadRequest
	case "NOT_FOUND":
		return http.StatusNotFound
	case "CONFLICT":
		return http.StatusConflict
	case "UNAUTHORIZED":
		return http.StatusUnauthorized
	case "FORBIDDEN":
		return http.StatusForbidden
	default:
		return http.StatusInternalServerError
	}
}

// Common errors
var (
	ErrInvalidRequest    = NewAPIError("Invalid request", "VALIDATION_ERROR")
	ErrNoteNotFound      = NewAPIError("Note not found", "NOT_FOUND")
	ErrInternalServer    = NewAPIError("Internal server error", "INTERNAL_ERROR")
	ErrUnauthorized      = NewAPIError("Unauthorized", "UNAUTHORIZED")
	ErrForbidden         = NewAPIError("Forbidden", "FORBIDDEN")
	ErrConflict          = NewAPIError("Conflict", "CONFLICT")
	ErrDuplicateEntry    = NewAPIError("Duplicate entry", "DUPLICATE")
)
