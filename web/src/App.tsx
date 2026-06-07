import { useEffect, useState } from 'react'
import { api } from './api'
import { useStore } from './store'
import Sidebar from './components/Sidebar'
import NoteForm from './components/NoteForm'
import NoteList from './components/NoteList'
import RichNoteEditor from './components/RichNoteEditor'
import FeedsPage from './components/FeedsPage'
import Toast from './components/Toast'
import { NoteType } from './types'
import { FeedItem } from './types/feed'

export default function App() {
  const {
    notes, selectedNote, searchQuery, loading, toast,
    setNotes, setSelectedNote, setSearchQuery, setLoading, setToast
  } = useStore()

  const [openTabs, setOpenTabs] = useState<string[]>([])
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [showFeeds, setShowFeeds] = useState(false)

  console.log('App rendered', { notes: notes.length, loading, selectedTag })

  const loadNotes = async () => {
    setLoading(true)
    try {
      console.log('Loading notes with query:', searchQuery)
      const data = await api.getNotes(searchQuery)
      console.log('Loaded notes:', data)
      setNotes(data.data)
    } catch (err) {
      console.error('Failed to load notes:', err)
      setToast({ message: 'Failed to load notes', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadNotes, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const filteredNotes = selectedTag
    ? notes.filter(note => note.tags?.includes(selectedTag))
    : notes

  const handleCreateNote = async (data: { title: string; content: string; type: NoteType; tags: string[] }) => {
    try {
      setLoading(true)
      
      const newNote = await api.createNote({
        ...data,
        source: 'manual'
      })
      setToast({ message: '✓ Notebook created', type: 'success' })
      
      setOpenTabs([...openTabs, newNote.id])
      setSelectedNote(newNote)
      setIsCreatingNew(false)
      
      loadNotes()
    } catch (err) {
      setToast({ message: 'Failed to create notebook', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId)
    if (note) {
      if (!openTabs.includes(noteId)) {
        setOpenTabs([...openTabs, noteId])
      }
      setSelectedNote(note)
      setIsCreatingNew(false)
    }
  }

  const handleUpdateNote = (updatedNote: any) => {
    setSelectedNote(updatedNote)
    loadNotes()
  }

  const handleCloseTab = (noteId: string) => {
    const newTabs = openTabs.filter(id => id !== noteId)
    setOpenTabs(newTabs)
    
    if (selectedNote?.id === noteId) {
      if (newTabs.length > 0) {
        handleSelectNote(newTabs[newTabs.length - 1])
      } else {
        setSelectedNote(null)
      }
    }
  }

  const handleNewNote = () => {
    setIsCreatingNew(true)
    setSelectedNote(null)
    setShowFeeds(false)
  }

  const handleAddFeedToNotebook = async (item: FeedItem) => {
    const noteTitle = item.title
    const noteContent = `<p>${item.description || item.content || ''}</p>${
      item.link ? `<p><a href="${item.link}" target="_blank">View original</a></p>` : ''
    }`

    try {
      const newNote = await api.createNote({
        title: noteTitle,
        content: noteContent,
        type: 'thought' as NoteType,
        tags: [],
        source: 'manual'
      })
      setToast({ message: '✓ Added to notebooks', type: 'success' })
      setOpenTabs([...openTabs, newNote.id])
      setSelectedNote(newNote)
      setShowFeeds(false)
      loadNotes()
    } catch (err) {
      setToast({ message: 'Failed to add to notebooks', type: 'error' })
    }
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <Sidebar 
        totalNotes={notes.length}
        onFeedsClick={() => {
          setShowFeeds(true)
          setSelectedNote(null)
          setIsCreatingNew(false)
        }}
        onNotebooksClick={() => {
          setShowFeeds(false)
          setSelectedNote(null)
          setIsCreatingNew(false)
        }}
        isShowingFeeds={showFeeds}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="🔍 Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 max-w-2xl px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {selectedTag && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-600 rounded-lg">
                <span className="text-sm">#{selectedTag}</span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-white hover:opacity-70 transition-opacity"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-900 border-b border-slate-800 flex items-center overflow-x-auto px-6 py-0">
          {!showFeeds && (
            <>
              <button
                onClick={handleNewNote}
                className={`px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  isCreatingNew
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                + New
              </button>

              {openTabs.map(noteId => {
                const note = notes.find(n => n.id === noteId)
                if (!note) return null
                
                return (
                  <div
                    key={noteId}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors group cursor-pointer ${
                      selectedNote?.id === noteId
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-300'
                    }`}
                    onClick={() => handleSelectNote(noteId)}
                  >
                    <span className="truncate max-w-xs">{note.title || 'Untitled'}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCloseTab(noteId)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-300"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {showFeeds ? (
            <FeedsPage onAddToNotebook={handleAddFeedToNotebook} />
          ) : (
            <>
              {/* Notes List */}
              <div className="w-80 bg-slate-900 border-r border-slate-800 overflow-y-auto">
                {loading && filteredNotes.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <p>Loading...</p>
                  </div>
                ) : (
                  <NoteList
                    notes={filteredNotes}
                    onSelectNote={handleSelectNote}
                    selectedId={selectedNote?.id}
                    onTagClick={(tag) => {
                      setSelectedTag(selectedTag === tag ? null : tag)
                      setSelectedNote(null)
                    }}
                  />
                )}
              </div>

              {/* Editor Area */}
              <div className="flex-1 overflow-y-auto bg-slate-950">
                {isCreatingNew ? (
                  <div className="p-8">
                    <NoteForm onSubmit={handleCreateNote} loading={loading} />
                  </div>
                ) : selectedNote ? (
                  <RichNoteEditor note={selectedNote} onUpdate={handleUpdateNote} />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <p>Select a note or create a new one</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
