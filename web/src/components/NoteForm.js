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
    // Tokenize content for syntax highlighting
    const tokenizeContent = (text) => {
        const tokens = [];
        const regex = /#\w+/g;
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(text)) !== null) {
            // Add text before tag
            if (match.index > lastIndex) {
                tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) });
            }
            // Add tag
            tokens.push({ type: 'tag', value: match[0] });
            lastIndex = match.index + match[0].length;
        }
        // Add remaining text
        if (lastIndex < text.length) {
            tokens.push({ type: 'text', value: text.slice(lastIndex) });
        }
        return tokens.length === 0 ? [{ type: 'text', value: text }] : tokens;
    };
    const highlightedContent = tokenizeContent(content);
    return (_jsxs("form", { onSubmit: handleSubmit, className: "bg-slate-900 rounded-lg border border-slate-800 p-6 space-y-4 animate-fade-in", children: [_jsxs("div", { className: "relative rounded-lg overflow-hidden", children: [_jsx("pre", { className: "absolute inset-0 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 pointer-events-none overflow-hidden whitespace-pre-wrap break-words m-0", style: {
                            padding: '12px 16px',
                            fontSize: '14px',
                            lineHeight: '24px',
                            fontFamily: "'JetBrains Mono', 'Courier New', monospace"
                        }, children: _jsx("code", { children: highlightedContent.map((token, idx) => token.type === 'tag' ? (_jsx("span", { style: {
                                    backgroundColor: '#ca8a04',
                                    color: '#f1f5f9',
                                    fontWeight: '600',
                                    backgroundImage: 'linear-gradient(135deg, #ca8a04 0%, #b8860b 100%)'
                                }, children: token.value }, idx)) : (_jsx("span", { children: token.value }, idx))) }) }), _jsx("textarea", { placeholder: "What's on your mind? Use #tags inline like this...", value: content, onChange: (e) => setContent(e.target.value), rows: 8, className: "relative w-full resize-none font-mono", style: {
                            padding: '12px 16px',
                            fontSize: '14px',
                            lineHeight: '24px',
                            backgroundColor: 'transparent',
                            color: 'transparent',
                            caretColor: '#e2e8f0',
                            border: 'none',
                            outline: 'none',
                            fontFamily: "'JetBrains Mono', 'Courier New', monospace"
                        }, required: true, autoFocus: true })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "submit", disabled: loading, className: "px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transform hover:scale-105 active:scale-95 transition-all duration-200", children: loading ? 'Saving...' : 'Save' }), _jsx("button", { type: "reset", onClick: () => setContent(''), className: "px-6 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 transform hover:scale-105 active:scale-95 transition-all duration-200", children: "Clear" })] })] }));
}
