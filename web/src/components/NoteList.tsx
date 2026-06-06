import { Note } from '../types'
import NoteCard from './NoteCard'

interface Props {
  notes: Note[]
  onSelectNote: (noteId: string) => void
  selectedId?: string
  onTagClick?: (tag: string) => void
}

const typeEmojis: Record<string, string> = {
  thought: '💭', snippet: '✂️', article: '📰', voice: '🎤',
  image: '🖼️', video: '🎥', meeting: '👥', jira: '🎯',
  goal: '🎪', feed: '📡'
}

export default function NoteList({ notes, onSelectNote, selectedId, onTagClick }: Props) {
  if (notes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 p-4">
        <p className="text-center">No notes yet. Create your first thought!</p>
      </div>
    )
  }

  return (
    <div className="space-y-1 p-2">
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          emoji={typeEmojis[note.type] || '📝'}
          isSelected={note.id === selectedId}
          onClick={() => onSelectNote(note.id)}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  )
}
