# Duha Brain API Documentation

## Base URL
```
http://localhost:8080/api/v1
```

## Authentication
Phase 1: No authentication required (local development)
Phase 5+: Will add token-based auth for multi-device access

## Endpoints

See PHASE_1_DESIGN.md for detailed endpoint specifications.

### Core Endpoints
- `POST /notes` - Create a note
- `GET /notes` - List notes (with pagination and filtering)
- `GET /notes/:id` - Get a specific note
- `PUT /notes/:id` - Update a note
- `DELETE /notes/:id` - Delete a note

## Response Format

All responses are JSON.

### Success Response
```json
{
  "data": { ... },
  "status": "success",
  "timestamp": "2026-06-06T10:30:00Z"
}
```

### Error Response
```json
{
  "error": "error message",
  "status": "error",
  "code": "ERROR_CODE",
  "timestamp": "2026-06-06T10:30:00Z"
}
```

## Pagination

List endpoints support pagination:
- `limit` - Number of results (default: 10, max: 100)
- `offset` - Offset for results (default: 0)

Example:
```
GET /notes?limit=20&offset=40
```

Response includes:
```json
{
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 40,
    "hasMore": true
  }
}
```

## Filtering

Supported query parameters:
- `type` - Filter by note type (thought, snippet, article, etc.)
- `tag` - Filter by tag
- `status` - Filter by status (active, archived, draft)
- `search` - Full-text search on title and content
- `createdAfter` - Created after date (ISO8601)
- `createdBefore` - Created before date (ISO8601)

## Rate Limiting

Phase 1: No rate limiting (local development)
Phase 5+: Will add rate limiting for remote access

## Error Codes

- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable

See PHASE_1_DESIGN.md for implementation details.
