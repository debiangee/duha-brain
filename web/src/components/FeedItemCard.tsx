import { FeedItem } from '../types/feed'

interface Props {
  item: FeedItem
  onSave: (itemId: string) => void
  isSaving?: boolean
}

export default function FeedItemCard({ item, onSave, isSaving }: Props) {
  const pubDate = item.pubDate ? new Date(item.pubDate).toLocaleDateString() : ''

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 group transition-all duration-200">
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-400 hover:text-blue-300 break-words transition-colors duration-200"
          >
            {item.title}
          </a>
          {item.description && (
            <p className="text-sm text-slate-300 mt-2 line-clamp-2">{item.description}</p>
          )}
          <div className="flex gap-3 text-xs text-slate-500 mt-3">
            {pubDate && <span>📅 {pubDate}</span>}
            {item.isSaved && <span className="text-green-400">✓ Saved</span>}
          </div>
        </div>
        <button
          onClick={() => onSave(item.id)}
          disabled={isSaving || item.isSaved}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transform hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap"
          title="Save to notebook"
        >
          {item.isSaved ? '✓' : 'Save'}
        </button>
      </div>
    </div>
  )
}
