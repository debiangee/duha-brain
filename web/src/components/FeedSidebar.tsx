import { useState } from 'react'
import { Feed } from '../types/feed'
import { api } from '../api'

interface Props {
  feeds: Feed[]
  selectedFeedId?: string
  onSelectFeed: (feedId: string) => void
  onFeedAdded: () => void
  onFeedDeleted: () => void
}

export default function FeedSidebar({ feeds, selectedFeedId, onSelectFeed, onFeedAdded, onFeedDeleted }: Props) {
  const [isAddingFeed, setIsAddingFeed] = useState(false)
  const [feedUrl, setFeedUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedUrl.trim()) return

    setLoading(true)
    setError('')
    try {
      await api.addFeed(feedUrl)
      setFeedUrl('')
      setIsAddingFeed(false)
      onFeedAdded()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add feed')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFeed = async (feedId: string) => {
    if (!confirm('Delete this feed?')) return
    try {
      await api.deleteFeed(feedId)
      onFeedDeleted()
    } catch (err) {
      alert('Failed to delete feed')
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      <div className="p-4 border-b border-slate-800">
        <h2 className="font-bold text-slate-100 mb-4">Feeds</h2>
        <button
          onClick={() => setIsAddingFeed(!isAddingFeed)}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transform hover:scale-105 active:scale-95 transition-all duration-200"
        >
          + Add Feed
        </button>

        {isAddingFeed && (
          <form onSubmit={handleAddFeed} className="mt-4 space-y-2">
            <input
              type="text"
              placeholder="Paste RSS feed URL..."
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setIsAddingFeed(false)}
                className="flex-1 px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 p-2">
        {feeds.length === 0 ? (
          <p className="text-xs text-slate-500 p-2">No feeds yet</p>
        ) : (
          feeds.map(feed => (
            <div
              key={feed.id}
              onClick={() => onSelectFeed(feed.id)}
              className={`p-2 rounded cursor-pointer text-sm transition-all duration-200 group ${
                selectedFeedId === feed.id
                  ? 'bg-blue-600/30 border border-blue-500'
                  : 'hover:bg-slate-800 border border-transparent'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-100 truncate">{feed.title}</p>
                  <p className="text-xs text-slate-400 truncate">{feed.url}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteFeed(feed.id)
                  }}
                  className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
