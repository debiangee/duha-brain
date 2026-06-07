import { Note } from '../types'
import { getPreview } from '../utils/text'

interface Props {
  note: Note
  emoji: string
  isSelected: boolean
  onClick: () => void
  onTagClick?: (tag: string) => void
}

export default function NoteCard({ note, emoji, isSelected, onClick, onTagClick }: Props) {
  const preview = getPreview(note.content, 80)
  const date = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer border-l-4 group transition-all duration-200 ease-out ${
        isSelected
          ? 'bg-slate-800 border-l-blue-500 shadow-lg scale-98'
          : 'bg-slate-800 border-l-slate-700 hover:bg-slate-700 border border-slate-700'
      } hover:scale-102 active:scale-95`}
    >
      <div className="flex gap-2">
        <div className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-200">{emoji}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-100 truncate text-sm">{note.title}</h3>
          <p className="text-xs text-slate-400 truncate mt-1">{preview}...</p>
          <div className="flex gap-2 items-center text-xs text-slate-500 mt-2">
            <span>📅 {date}</span>
            {note.tags && note.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {note.tags.map(tag => (
                  <button
                    key={tag}
                    onClick={(e) => {
                      e.stopPropagation()
                      onTagClick?.(tag)
                    }}
                    className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs hover:bg-blue-600 hover:text-white transform hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
