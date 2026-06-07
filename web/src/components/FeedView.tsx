import { useEffect, useState } from 'react'
import { FeedItem } from '../types/feed'
import { api } from '../api'
import FeedItemCard from './FeedItemCard'

interface Props {
  feedId: string
  feedTitle: string
  onItemSaved: () => void
}

export default function FeedView({ feedId, feedTitle, onItemSaved }: Props) {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    loadItems()
  }, [feedId])

  const loadItems = async () => {
    setLoading(true)
    try {
      const data = await api.getFeedItems(feedId, 50)
      setItems(data || [])
    } catch (err) {
      console.error('Failed to load feed items:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await api.refreshFeed(feedId)
      await loadItems()
    } catch (err) {
      alert('Failed to refresh feed')
    } finally {
      setRefreshing(false)
    }
  }

  const handleSaveItem = async (itemId: string) => {
    setSavingId(itemId)
    try {
      await api.saveFeedItem(itemId)
      setItems(items.map(item => item.id === itemId ? { ...item, isSaved: true } : item))
      onItemSaved()
    } catch (err) {
      alert('Failed to save item')
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <p>Loading articles...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-100">{feedTitle}</h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-semibold disabled:opacity-50 transform hover:scale-105 active:scale-95 transition-all duration-200"
          >
            {refreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
        </div>
        <p className="text-sm text-slate-400 mt-2">{items.length} articles</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {items.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No articles yet. Click Refresh to fetch.</p>
        ) : (
          items.map(item => (
            <FeedItemCard
              key={item.id}
              item={item}
              onSave={handleSaveItem}
              isSaving={savingId === item.id}
            />
          ))
        )}
      </div>
    </div>
  )
}
