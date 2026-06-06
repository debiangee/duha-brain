import { Note, CreateNoteRequest, ListNotesResponse } from './types'

const API_BASE = '/api/v1'

export const api = {
  async createNote(req: CreateNoteRequest): Promise<Note> {
    const res = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    })
    if (!res.ok) throw new Error('Failed to create note')
    return res.json()
  },

  async getNotes(search?: string, type?: string, limit = 100, offset = 0): Promise<ListNotesResponse> {
    let url = `${API_BASE}/notes?limit=${limit}&offset=${offset}`
    if (search) url += `&search=${encodeURIComponent(search)}`
    if (type) url += `&type=${encodeURIComponent(type)}`
    
    console.log('Fetching from:', url)
    try {
      const res = await fetch(url)
      console.log('Response status:', res.status, res.ok)
      if (!res.ok) {
        const text = await res.text()
        console.error('Response error:', text)
        throw new Error(`HTTP ${res.status}: ${text}`)
      }
      const data = await res.json()
      console.log('Fetched data:', data)
      return data
    } catch (error) {
      console.error('Fetch error:', error)
      throw error
    }
  },

  async getNote(id: string): Promise<Note> {
    const res = await fetch(`${API_BASE}/notes/${id}`)
    if (!res.ok) throw new Error('Failed to fetch note')
    return res.json()
  },

  async updateNote(id: string, updates: Partial<CreateNoteRequest>): Promise<Note> {
    const res = await fetch(`${API_BASE}/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    if (!res.ok) throw new Error('Failed to update note')
    return res.json()
  },

  async deleteNote(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete note')
  }
}
