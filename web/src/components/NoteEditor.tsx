import { useState, useMemo } from 'react'
import { api } from '../api'
import { Note } from '../types'

interface EntryBlock {
  timestamp: string
  content: string
}

interface Props {
  note: Note
  onUpdate: (note: Note) => void
  loading?: boolean
}

export default function NoteEditor({ note, onUpdate, loading }: Props) {
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newEntryContent, setNewEntryContent] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editingTitle, setEditingTitle] = useState(note.title)

  // Parse content into timestamped entries - parse by timestamp lines
  const entries = useMemo(() => {
    if (!note.content.trim()) return []
    
    const blocks: EntryBlock[] = []
    const lines = note.content.split('\n')
    
    let currentTimestamp = ''
    let currentContent: string[] = []
    
    for (const line of lines) {
      // Check if line is a timestamp (matches date format)
      if (line.match(/\d{2}\/\d{2}\/\d{4}/)) {
        // Save previous entry if exists
        if (currentTimestamp) {
          blocks.push({
            timestamp: currentTimestamp,
            content: currentContent.join('\n').trim()
          })
        }
        currentTimestamp = line.trim()
        currentContent = []
      } else if (currentTimestamp) {
        // Add to current entry's content
        currentContent.push(line)
      }
    }
    
    // Don't forget the last entry
    if (currentTimestamp) {
      blocks.push({
        timestamp: currentTimestamp,
        content: currentContent.join('\n').trim()
      })
    }
    
    console.log('Parsed entries:', blocks)
    return blocks
  }, [note.content])

  const handleAddEntry = async () => {
    if (!newEntryContent.trim()) return

    setIsSaving(true)
    try {
      const timestamp = new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })

      const newContent = note.content 
        ? `${note.content}\n\n${timestamp}\n${newEntryContent}`
        : `${timestamp}\n${newEntryContent}`

      const updated = await api.updateNote(note.id, {
        title: note.title,
        content: newContent,
        type: note.type,
        tags: note.tags,
        source: note.source
      })
      
      onUpdate(updated)
      setIsAddingNew(false)
      setNewEntryContent('')
    } catch (err) {
      console.error('Failed to save:', err)
      alert('Failed to save note')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditEntry = (index: number) => {
    setEditingIndex(index)
    setEditContent(entries[index].content)
  }

  const handleSaveEdit = async (index: number) => {
    setIsSaving(true)
    try {
      const updatedTimestamp = new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })

      // Rebuild content: each entry is TIMESTAMP\nCONTENT, separated by \n\n
      const newEntries = entries.map((entry, idx) => {
        if (idx === index) {
          return `${updatedTimestamp}\n${editContent}`
        }
        return `${entry.timestamp}\n${entry.content}`
      })

      const newContent = newEntries.join('\n\n')

      const updated = await api.updateNote(note.id, {
        title: note.title,
        content: newContent,
        type: note.type,
        tags: note.tags,
        source: note.source
      })
      
      onUpdate(updated)
      setEditingIndex(null)
      setEditContent('')
    } catch (err) {
      console.error('Failed to save:', err)
      alert('Failed to save note')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteEntry = async (index: number) => {
    if (!confirm('Delete this entry?')) return

    setIsDeleting(true)
    try {
      const newEntries = entries.filter((_, idx) => idx !== index)
      const newContent = newEntries.map(e => `${e.timestamp}\n${e.content}`).join('\n\n')

      const updated = await api.updateNote(note.id, {
        title: note.title,
        content: newContent,
        type: note.type,
        tags: note.tags,
        source: note.source
      })
      
      onUpdate(updated)
    } catch (err) {
      console.error('Failed to delete:', err)
      alert('Failed to delete entry')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteNote = async () => {
    if (!confirm('Delete this entire note?')) return

    setIsDeleting(true)
    try {
      await api.deleteNote(note.id)
      alert('Note deleted')
      window.location.reload()
    } catch (err) {
      console.error('Failed to delete:', err)
      alert('Failed to delete note')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveTitle = async () => {
    if (!editingTitle.trim()) {
      setEditingTitle(note.title)
      setIsEditingTitle(false)
      return
    }

    if (editingTitle === note.title) {
      setIsEditingTitle(false)
      return
    }

    setIsSaving(true)
    try {
      const updated = await api.updateNote(note.id, {
        title: editingTitle,
        content: note.content,
        type: note.type,
        tags: note.tags,
        source: note.source
      })
      
      onUpdate(updated)
      setIsEditingTitle(false)
    } catch (err) {
      console.error('Failed to save title:', err)
      alert('Failed to save title')
      setEditingTitle(note.title)
    } finally {
      setIsSaving(false)
    }
  }

  if (isAddingNew) {
    return (
      <div className="p-8 max-w-4xl animate-fade-in">
        {isEditingTitle ? (
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold text-2xl"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle()
                if (e.key === 'Escape') {
                  setEditingTitle(note.title)
                  setIsEditingTitle(false)
                }
              }}
            />
            <button
              onClick={handleSaveTitle}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transform hover:scale-105 active:scale-95 transition-all duration-200"
            >
              ✓
            </button>
            <button
              onClick={() => {
                setEditingTitle(note.title)
                setIsEditingTitle(false)
              }}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 transform hover:scale-105 active:scale-95 transition-all duration-200"
            >
              ✕
            </button>
          </div>
        ) : (
          <h2
            onClick={() => setIsEditingTitle(true)}
            className="text-3xl font-bold text-slate-100 mb-6 cursor-pointer hover:text-blue-400 transition-colors duration-200"
            title="Click to edit title"
          >
            {note.title}
          </h2>
        )}

        <textarea
          value={newEntryContent}
          onChange={(e) => setNewEntryContent(e.target.value)}
          className="w-full h-64 bg-slate-800 rounded-lg p-4 border border-slate-700 text-slate-200 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Add your entry..."
          autoFocus
        />

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleAddEntry}
            disabled={isSaving || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transform hover:scale-105 active:scale-95 transition-all duration-200"
          >
            {isSaving ? 'Saving...' : 'Save Entry'}
          </button>
          <button
            onClick={() => { setIsAddingNew(false); setNewEntryContent(''); }}
            className="px-6 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 transform hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (editingIndex !== null) {
    return (
      <div className="p-8 max-w-4xl animate-fade-in">
        {isEditingTitle ? (
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold text-2xl"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle()
                if (e.key === 'Escape') {
                  setEditingTitle(note.title)
                  setIsEditingTitle(false)
                }
              }}
            />
            <button
              onClick={handleSaveTitle}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transform hover:scale-105 active:scale-95 transition-all duration-200"
            >
              ✓
            </button>
            <button
              onClick={() => {
                setEditingTitle(note.title)
                setIsEditingTitle(false)
              }}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 transform hover:scale-105 active:scale-95 transition-all duration-200"
            >
              ✕
            </button>
          </div>
        ) : (
          <h2
            onClick={() => setIsEditingTitle(true)}
            className="text-3xl font-bold text-slate-100 mb-2 cursor-pointer hover:text-blue-400 transition-colors duration-200"
            title="Click to edit title"
          >
            {note.title}
          </h2>
        )}
        <div className="text-sm text-slate-400 mb-6">Editing: {entries[editingIndex].timestamp}</div>

        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full h-64 bg-slate-800 rounded-lg p-4 border border-slate-700 text-slate-200 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Edit entry..."
          autoFocus
        />

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => handleSaveEdit(editingIndex)}
            disabled={isSaving || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transform hover:scale-105 active:scale-95 transition-all duration-200"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => { setEditingIndex(null); setEditContent(''); }}
            className="px-6 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 transform hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl animate-fade-in">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex-1">
          {isEditingTitle ? (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold text-2xl"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle()
                  if (e.key === 'Escape') {
                    setEditingTitle(note.title)
                    setIsEditingTitle(false)
                  }
                }}
              />
              <button
                onClick={handleSaveTitle}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setEditingTitle(note.title)
                  setIsEditingTitle(false)
                }}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                ✕
              </button>
            </div>
          ) : (
            <h2
              onClick={() => setIsEditingTitle(true)}
              className="text-3xl font-bold text-slate-100 mb-2 cursor-pointer hover:text-blue-400 transition-colors duration-200"
              title="Click to edit title"
            >
              {note.title}
            </h2>
          )}
          <div className="flex gap-4 text-sm text-slate-400">
            <span>📅 Created: {new Date(note.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-semibold transform hover:scale-105 active:scale-95 transition-all duration-200"
          >
            + New
          </button>
          <button
            onClick={handleDeleteNote}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-900 text-red-200 rounded-lg hover:bg-red-800 font-semibold transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
            title="Delete entire note"
          >
            {isDeleting ? 'Deleting...' : '🗑️'}
          </button>
        </div>
      </div>

      {/* Show all timestamped entries */}
      <div className="space-y-6">
        {entries.length === 0 ? (
          <div className="text-slate-500 text-center py-8">
            <p>No entries yet. Click "+ Add Entry" to start.</p>
          </div>
        ) : (
          entries.map((entry, idx) => {
            // Highlight tags in content
            let highlightedContent = entry.content
            if (note.tags && note.tags.length > 0) {
              note.tags.forEach(tag => {
                const regex = new RegExp(`(#${tag}|\\b${tag}\\b)`, 'gi')
                highlightedContent = highlightedContent.replace(
                  regex,
                  '<mark class="bg-yellow-600 text-slate-100 px-1 rounded font-semibold">$1</mark>'
                )
              })
            }

            return (
              <div key={idx} className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 group transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-xs font-mono text-blue-400">
                    {entry.timestamp}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleEditEntry(idx)}
                      className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs hover:bg-slate-600 transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(idx)}
                      className="px-2 py-1 bg-red-900 text-red-200 rounded text-xs hover:bg-red-800 transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="text-slate-200 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightedContent }} />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
