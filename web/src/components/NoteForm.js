import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export default function NoteForm({ onSubmit, loading }) {
    const [content, setContent] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim())
            return;
        const lines = content.trim().split('\n');
        const title = lines[0].substring(0, 60);
        // Extract tags from content (words starting with #)
        const tagMatches = content.match(/#\w+/g) || [];
        const tags = [...new Set(tagMatches.map(t => t.substring(1).toLowerCase()))];
        await onSubmit({
            title,
            content,
            type: 'thought',
            tags
        });
        setContent('');
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "bg-slate-900 rounded-lg border border-slate-800 p-6 space-y-4 animate-fade-in", children: [_jsx("textarea", { placeholder: "What's on your mind? Use #tags inline like this...", value: content, onChange: (e) => setContent(e.target.value), rows: 8, className: "w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none", required: true, autoFocus: true }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "submit", disabled: loading, className: "px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transform hover:scale-105 active:scale-95 transition-all duration-200", children: loading ? 'Saving...' : 'Save' }), _jsx("button", { type: "reset", onClick: () => setContent(''), className: "px-6 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 transform hover:scale-105 active:scale-95 transition-all duration-200", children: "Clear" })] })] }));
}
