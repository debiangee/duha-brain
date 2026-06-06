import { jsx as _jsx } from "react/jsx-runtime";
import NoteCard from './NoteCard';
const typeEmojis = {
    thought: '💭', snippet: '✂️', article: '📰', voice: '🎤',
    image: '🖼️', video: '🎥', meeting: '👥', jira: '🎯',
    goal: '🎪', feed: '📡'
};
export default function NoteList({ notes, onSelectNote, selectedId, onTagClick }) {
    if (notes.length === 0) {
        return (_jsx("div", { className: "flex items-center justify-center h-full text-slate-500 p-4", children: _jsx("p", { className: "text-center", children: "No notes yet. Create your first thought!" }) }));
    }
    return (_jsx("div", { className: "space-y-1 p-2", children: notes.map(note => (_jsx(NoteCard, { note: note, emoji: typeEmojis[note.type] || '📝', isSelected: note.id === selectedId, onClick: () => onSelectNote(note.id), onTagClick: onTagClick }, note.id))) }));
}
