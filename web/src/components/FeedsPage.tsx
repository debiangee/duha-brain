import { useEffect, useState } from 'react'
import { api } from '../api'
import { Feed, FeedItem } from '../types/feed'

interface Props {
  onAddToNotebook: (item: FeedItem) => void
}

const DEFAULT_FEEDS = [
  { title: 'MarkTechPost', url: 'https://www.marktechpost.com/feed/' },
  { title: 'OpenAI News', url: 'https://openai.com/news/rss.xml' },
  { title: 'Hugging Face Blog', url: 'https://huggingface.co/blog/feed.xml' },
  { title: 'MIT Technology Review (AI)', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/' },
  { title: 'arXiv cs.AI', url: 'https://rss.arxiv.org/rss/cs.AI' },
  { title: 'Hacker News', url: 'https://hnrss.org/frontpage?points=100' },
  { title: 'The Pragmatic Engineer', url: 'https://blog.pragmaticengineer.com/rss/' },
  { title: 'GitHub Blog', url: 'https://github.blog/feed/' },
  { title: "Simon Willison's Weblog", url: 'https://simonwillison.net/atom/entries/' },
  { title: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { title: 'GMA Public Affairs', url: 'https://data.gmanetwork.com/gno/rss/publicaffairs/feed.xml' }
]

const cleanArticleTitle = (title: string): string => {
  // Remove arXiv IDs and similar patterns
  title = title.replace(/\[arXiv:\d+\.\d+v\d+\]/g, '').trim()
  title = title.replace(/arXiv:\d+\.\d+v\d+/g, '').trim()
  // Remove other common noise patterns
  title = title.replace(/^\d+\.\s+/, '').trim()
  title = title.replace(/\s*\([^)]*arXiv[^)]*\)\s*$/gi, '').trim()
  return title
}

export default function FeedsPage({ onAddToNotebook }: Props) {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addingFeed, setAddingFeed] = useState(false)
  const [feedUrl, setFeedUrl] = useState('')
  const [error, setError] = useState('')
  const [configTab, setConfigTab] = useState<'feeds' | 'config'>('feeds')

  useEffect(() => {
    loadFeeds()
  }, [])

  useEffect(() => {
    if (feeds.length > 0) {
      loadFeedItems()
    } else {
      setLoading(false)
    }
  }, [feeds])

  const loadFeeds = async () => {
    try {
      const data = await api.getFeeds()
      setFeeds(data || [])
    } catch (err) {
      console.error('Failed to load feeds:', err)
      setLoading(false)
    }
  }

  const loadFeedItems = async () => {
    setLoading(true)
    try {
      const items = await api.getRecentFeedItems(200)
      setFeedItems(items || [])
    } catch (err) {
      console.error('Failed to load feed items:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedUrl.trim()) return

    try {
      setError('')
      await api.addFeed(feedUrl)
      setFeedUrl('')
      setAddingFeed(false)
      loadFeeds()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add feed')
    }
  }

  const handleAddDefaultFeeds = async () => {
    try {
      setError('')
      for (const feed of DEFAULT_FEEDS) {
        try {
          await api.addFeed(feed.url)
        } catch (err) {
          console.warn(`Failed to add ${feed.title}:`, err)
        }
      }
      await new Promise(r => setTimeout(r, 500))
      loadFeeds()
    } catch (err) {
      setError('Failed to add default feeds')
    }
  }

  const handleDeleteFeed = async (feedId: string) => {
    if (!confirm('Delete this feed?')) return
    try {
      await api.deleteFeed(feedId)
      loadFeeds()
    } catch (err) {
      console.error('Failed to delete feed:', err)
    }
  }

  const handleRefreshFeed = async (feedId: string) => {
    try {
      await api.refreshFeed(feedId)
      loadFeedItems()
    } catch (err) {
      console.error('Failed to refresh feed:', err)
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Feed Articles - Main Content */}
      <div className="flex-1 overflow-y-auto bg-slate-950">
        {loading && feedItems.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>Loading feeds...</p>
          </div>
        ) : feedItems.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-center p-8">
            <p>No articles yet. Add feeds to get started!</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4 p-6">
            {feedItems.map(item => (
              <div
                key={item.id}
                className={`bg-slate-900 rounded-lg border p-6 group ${
                  item.isSaved
                    ? 'border-slate-700 opacity-50'
                    : 'border-slate-800 hover:border-blue-600 transition-colors'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-100 mb-2 text-lg line-clamp-2 group-hover:text-blue-400 transition-colors"
                        style={{ fontFamily: "'Inter', sans-serif" }}>
                      {cleanArticleTitle(item.title)}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-slate-400 line-clamp-2 mb-3 leading-relaxed"
                         style={{ fontFamily: "'Inter', sans-serif" }}>
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-slate-500 gap-2">
                      <span style={{ fontFamily: "'Inter', sans-serif" }}>
                        📅 {new Date(item.pubDate || item.fetchedAt).toLocaleDateString()}
                      </span>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          Read →
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex gap-1">
                    <button
                      onClick={() => onAddToNotebook(item)}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors opacity-0 group-hover:opacity-100 whitespace-nowrap"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      + Add
                    </button>
                    <button
                      onClick={() => {
                        if (item.isSaved) {
                          alert('Already marked as read')
                        } else {
                          api.saveFeedItem(item.id).then(() => loadFeedItems()).catch(err => console.error('Error:', err))
                        }
                      }}
                      className={`px-2.5 py-1.5 rounded text-xs font-semibold transition-colors opacity-0 group-hover:opacity-100 whitespace-nowrap ${
                        item.isSaved
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      title={item.isSaved ? 'Already read' : 'Mark as read'}
                    >
                      {item.isSaved ? '✓' : '☐'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar - Config - FARTHEST RIGHT */}
      <div className="w-96 bg-slate-900 border-l-2 border-slate-700 overflow-y-auto flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-slate-700 flex-shrink-0 sticky top-0 bg-slate-900">
          <button
            onClick={() => setConfigTab('feeds')}
            className={`flex-1 px-4 py-4 text-sm font-semibold transition-all ${
              configTab === 'feeds'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            📡 Feed
          </button>
          <button
            onClick={() => setConfigTab('config')}
            className={`flex-1 px-4 py-4 text-sm font-semibold transition-all ${
              configTab === 'config'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ⚙️ Config
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 transition-all duration-200">
          {configTab === 'feeds' ? (
            // Feeds List Tab
            <div className="space-y-3 animate-fadeIn">
              {feeds.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500" style={{ fontFamily: "'Inter', sans-serif" }}>
                    No feeds yet
                  </p>
                  <p className="text-xs text-slate-600 mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Add feeds to start reading
                  </p>
                </div>
              ) : (
                feeds.map(feed => (
                  <div
                    key={feed.id}
                    className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-600 hover:bg-slate-750 transition-all duration-200 group"
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-100 text-sm leading-tight transition-colors duration-200 group-hover:text-blue-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {feed.title}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteFeed(feed.id)}
                        className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0 text-base"
                        title="Delete feed"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 truncate mb-3 transition-colors duration-200 group-hover:text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {feed.url}
                    </p>
                    <button
                      onClick={() => handleRefreshFeed(feed.id)}
                      className="w-full text-xs px-2 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-all duration-200 font-medium"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      🔄 Refresh
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Configuration Tab
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Add New Feed
                </h3>

                {!addingFeed ? (
                  <div className="space-y-3">
                    {feeds.length === 0 && (
                      <button
                        onClick={handleAddDefaultFeeds}
                        className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all duration-200"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        📰 Load 11 Defaults
                      </button>
                    )}
                    <button
                      onClick={() => setAddingFeed(true)}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all duration-200"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      + Add Feed
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAddFeed} className="space-y-3 animate-fadeIn">
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 transition-colors duration-200" style={{ fontFamily: "'Inter', sans-serif" }}>
                        RSS Feed URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://example.com/feed.xml"
                        value={feedUrl}
                        onChange={(e) => setFeedUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        autoFocus
                      />
                    </div>
                    {error && (
                      <p className="text-xs text-red-400 bg-red-900/20 p-2 rounded animate-fadeIn transition-all duration-200" style={{ fontFamily: "'Inter', sans-serif" }}>
                        ⚠️ {error}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all duration-200"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        Save Feed
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddingFeed(false)
                          setError('')
                          setFeedUrl('')
                        }}
                        className="flex-1 px-3 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-all duration-200"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="pt-4 border-t border-slate-700 transition-all duration-200">
                <p className="text-xs text-slate-500 transition-colors duration-200" style={{ fontFamily: "'Inter', sans-serif" }}>
                  💡 {feeds.length} feed{feeds.length !== 1 ? 's' : ''} subscribed
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
