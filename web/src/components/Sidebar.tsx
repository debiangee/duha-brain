interface Props {
  totalNotes: number
}

export default function Sidebar({ totalNotes }: Props) {
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-slate-100">📚 Duha</h1>
        <p className="text-sm text-slate-400 mt-1">Your Second Brain</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Info */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Info</h3>
            <div className="text-xs text-slate-400 space-y-1">
              <p>💡 Use #tags inline</p>
              <p>🏷️ Tags auto-extract</p>
            </div>
          </div>

          {/* Stats */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Stats</h3>
            <div className="text-sm text-slate-400">
              <p>{totalNotes} total notes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-800 text-xs text-slate-500">
        <p>Keep it simple, keep it organized</p>
      </div>
    </div>
  )
}
