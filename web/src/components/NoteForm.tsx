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

  // Tokenize content for syntax highlighting
  const tokenizeContent = (text: string) => {
    const tokens: Array<{ type: 'tag' | 'text', value: string }> = []
    const regex = /#\w+/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(text)) !== null) {
      // Add text before tag
      if (match.index > lastIndex) {
        tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) })
      }
      // Add tag
      tokens.push({ type: 'tag', value: match[0] })
      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      tokens.push({ type: 'text', value: text.slice(lastIndex) })
    }

    return tokens.length === 0 ? [{ type: 'text' as const, value: text }] : tokens
  }

  const highlightedContent = tokenizeContent(content)

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 rounded-lg border border-slate-800 p-6 space-y-4 animate-fade-in">
      {/* Syntax highlighted display layer */}
      <div className="relative rounded-lg overflow-hidden">
        {/* Highlighted text display (background layer) */}
        <pre className="absolute inset-0 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 pointer-events-none overflow-hidden whitespace-pre-wrap break-words m-0"
          style={{
            padding: '12px 16px',
            fontSize: '14px',
            lineHeight: '24px',
            fontFamily: "'JetBrains Mono', 'Courier New', monospace"
          }}
        >
          <code>
            {highlightedContent.map((token, idx) =>
              token.type === 'tag' ? (
                <span key={idx} style={{
                  backgroundColor: '#ca8a04',
                  color: '#f1f5f9',
                  fontWeight: '600',
                  backgroundImage: 'linear-gradient(135deg, #ca8a04 0%, #b8860b 100%)'
                }}>
                  {token.value}
                </span>
              ) : (
                <span key={idx}>{token.value}</span>
              )
            )}
          </code>
        </pre>

        {/* Actual textarea (foreground layer) */}
        <textarea
          placeholder="What's on your mind? Use #tags inline like this..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="relative w-full resize-none font-mono"
          style={{
            padding: '12px 16px',
            fontSize: '14px',
            lineHeight: '24px',
            backgroundColor: 'transparent',
            color: 'transparent',
            caretColor: '#e2e8f0',
            border: 'none',
            outline: 'none',
            fontFamily: "'JetBrains Mono', 'Courier New', monospace"
          }}
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
