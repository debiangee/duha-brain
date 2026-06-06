export type NoteType = 'thought' | 'snippet' | 'article' | 'voice' | 'image' | 'video' | 'meeting' | 'jira' | 'goal' | 'feed'
export type NoteSource = 'manual' | 'url' | 'file' | 'integration'
export type NoteStatus = 'draft' | 'active' | 'archived'

export interface Note {
  id: string
  title: string
  content: string
  type: NoteType
  tags: string[]
  source: NoteSource
  createdAt: string
  updatedAt: string
  metadata: Record<string, any>
  status: NoteStatus
}

export interface CreateNoteRequest {
  title: string
  content: string
  type: NoteType
  tags: string[]
  source: NoteSource
  metadata?: Record<string, any>
}

export interface ListNotesResponse {
  data: Note[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}
