import { useState } from 'react'
import { NoteType } from '../types'

interface Props {
  onSubmit: (data: { title: string; content: string; type: NoteType; tags: string[] }) => Promise<void>
  loading?: boolean
}

export default function NoteForm({ onSubmit, loading }: Props) {
  const [content, setContent] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    const lines = content.trim().split('\n')
    const title = lines[0].substring(0, 60)

    // Extract tags from content (words starting with #)
    const tagMatches = content.match(/#\w+/g) || []
    const tags = [...new Set(tagMatches.map(t => t.substring(1).toLowerCase()))]

    await onSubmit({
      title,
      content,
      type: 'thought',
      tags
    })
    setContent('')
  }

  // Highlight tags in real-time
  const getHighlightedContent = () => {
    let html = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/#\w+/g, '<mark class="bg-yellow-600 text-slate-100 font-semibold rounded px-0.5">$&</mark>')
    
    return html
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 rounded-lg border border-slate-800 p-6 space-y-4 animate-fade-in">
      <div className="relative">
        {/* Hidden div for highlighting */}
        <div className="absolute top-0 left-0 w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 pointer-events-none overflow-hidden whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: getHighlightedContent() }} />
        
        {/* Actual textarea on top */}
        <textarea
          placeholder="What's on your mind? Use #tags inline like this..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="relative w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-transparent caret-slate-100"
          style={{ backgroundColor: 'transparent' }}
          required
          autoFocus
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transform hover:scale-105 active:scale-95 transition-all duration-200"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          type="reset"
          onClick={() => setContent('')}
          className="px-6 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 transform hover:scale-105 active:scale-95 transition-all duration-200"
        >
          Clear
        </button>
      </div>
    </form>
  )
}
