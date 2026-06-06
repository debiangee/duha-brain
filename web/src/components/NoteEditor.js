import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { api } from '../api';
export default function NoteEditor({ note, onUpdate, loading }) {
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newEntryContent, setNewEntryContent] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    // Parse content into timestamped entries - parse by timestamp lines
    const entries = useMemo(() => {
        if (!note.content.trim())
            return [];
        const blocks = [];
        const lines = note.content.split('\n');
        let currentTimestamp = '';
        let currentContent = [];
        for (const line of lines) {
            // Check if line is a timestamp (matches date format)
            if (line.match(/\d{2}\/\d{2}\/\d{4}/)) {
                // Save previous entry if exists
                if (currentTimestamp) {
                    blocks.push({
                        timestamp: currentTimestamp,
                        content: currentContent.join('\n').trim()
                    });
                }
                currentTimestamp = line.trim();
                currentContent = [];
            }
            else if (currentTimestamp) {
                // Add to current entry's content
                currentContent.push(line);
            }
        }
        // Don't forget the last entry
        if (currentTimestamp) {
            blocks.push({
                timestamp: currentTimestamp,
                content: currentContent.join('\n').trim()
            });
        }
        console.log('Parsed entries:', blocks);
        return blocks;
    }, [note.content]);
    const handleAddEntry = async () => {
        if (!newEntryContent.trim())
            return;
        setIsSaving(true);
        try {
            const timestamp = new Date().toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            const newContent = note.content
                ? `${note.content}\n\n${timestamp}\n${newEntryContent}`
                : `${timestamp}\n${newEntryContent}`;
            const updated = await api.updateNote(note.id, {
                title: note.title,
                content: newContent,
                type: note.type,
                tags: note.tags,
                source: note.source
            });
            onUpdate(updated);
            setIsAddingNew(false);
            setNewEntryContent('');
        }
        catch (err) {
            console.error('Failed to save:', err);
            alert('Failed to save note');
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleEditEntry = (index) => {
        setEditingIndex(index);
        setEditContent(entries[index].content);
    };
    const handleSaveEdit = async (index) => {
        setIsSaving(true);
        try {
            const updatedTimestamp = new Date().toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            // Rebuild content: each entry is TIMESTAMP\nCONTENT, separated by \n\n
            const newEntries = entries.map((entry, idx) => {
                if (idx === index) {
                    return `${updatedTimestamp}\n${editContent}`;
                }
                return `${entry.timestamp}\n${entry.content}`;
            });
            const newContent = newEntries.join('\n\n');
            const updated = await api.updateNote(note.id, {
                title: note.title,
                content: newContent,
                type: note.type,
                tags: note.tags,
                source: note.source
            });
            onUpdate(updated);
            setEditingIndex(null);
            setEditContent('');
        }
        catch (err) {
            console.error('Failed to save:', err);
            alert('Failed to save note');
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleDeleteEntry = async (index) => {
        if (!confirm('Delete this entry?'))
            return;
        setIsDeleting(true);
        try {
            const newEntries = entries.filter((_, idx) => idx !== index);
            const newContent = newEntries.map(e => `${e.timestamp}\n${e.content}`).join('\n\n');
            const updated = await api.updateNote(note.id, {
                title: note.title,
                content: newContent,
                type: note.type,
                tags: note.tags,
                source: note.source
            });
            onUpdate(updated);
        }
        catch (err) {
            console.error('Failed to delete:', err);
            alert('Failed to delete entry');
        }
        finally {
            setIsDeleting(false);
        }
    };
    const handleDeleteNote = async () => {
        if (!confirm('Delete this entire note?'))
            return;
        setIsDeleting(true);
        try {
            await api.deleteNote(note.id);
            alert('Note deleted');
            window.location.reload();
        }
        catch (err) {
            console.error('Failed to delete:', err);
            alert('Failed to delete note');
        }
        finally {
            setIsDeleting(false);
        }
    };
    if (isAddingNew) {
        return (_jsxs("div", { className: "p-8 max-w-4xl animate-fade-in", children: [_jsx("h2", { className: "text-3xl font-bold text-slate-100 mb-6", children: note.title }), _jsx("textarea", { value: newEntryContent, onChange: (e) => setNewEntryContent(e.target.value), className: "w-full h-64 bg-slate-800 rounded-lg p-4 border border-slate-700 text-slate-200 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none", placeholder: "Add your entry...", autoFocus: true }), _jsxs("div", { className: "flex gap-2 mt-6", children: [_jsx("button", { onClick: handleAddEntry, disabled: isSaving || loading, className: "px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transform hover:scale-105 active:scale-95 transition-all duration-200", children: isSaving ? 'Saving...' : 'Save Entry' }), _jsx("button", { onClick: () => { setIsAddingNew(false); setNewEntryContent(''); }, className: "px-6 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 transform hover:scale-105 active:scale-95 transition-all duration-200", children: "Cancel" })] })] }));
    }
    if (editingIndex !== null) {
        return (_jsxs("div", { className: "p-8 max-w-4xl animate-fade-in", children: [_jsx("h2", { className: "text-3xl font-bold text-slate-100 mb-2", children: note.title }), _jsxs("div", { className: "text-sm text-slate-400 mb-6", children: ["Editing: ", entries[editingIndex].timestamp] }), _jsx("textarea", { value: editContent, onChange: (e) => setEditContent(e.target.value), className: "w-full h-64 bg-slate-800 rounded-lg p-4 border border-slate-700 text-slate-200 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none", placeholder: "Edit entry...", autoFocus: true }), _jsxs("div", { className: "flex gap-2 mt-6", children: [_jsx("button", { onClick: () => handleSaveEdit(editingIndex), disabled: isSaving || loading, className: "px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transform hover:scale-105 active:scale-95 transition-all duration-200", children: isSaving ? 'Saving...' : 'Save Changes' }), _jsx("button", { onClick: () => { setEditingIndex(null); setEditContent(''); }, className: "px-6 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 transform hover:scale-105 active:scale-95 transition-all duration-200", children: "Cancel" })] })] }));
    }
    return (_jsxs("div", { className: "p-8 max-w-4xl animate-fade-in", children: [_jsxs("div", { className: "mb-8 flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold text-slate-100 mb-2", children: note.title }), _jsx("div", { className: "flex gap-4 text-sm text-slate-400", children: _jsxs("span", { children: ["\uD83D\uDCC5 Created: ", new Date(note.createdAt).toLocaleString()] }) })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setIsAddingNew(true), className: "px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-semibold transform hover:scale-105 active:scale-95 transition-all duration-200", children: "+ New" }), _jsx("button", { onClick: handleDeleteNote, disabled: isDeleting, className: "px-4 py-2 bg-red-900 text-red-200 rounded-lg hover:bg-red-800 font-semibold transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50", title: "Delete entire note", children: isDeleting ? 'Deleting...' : '🗑️' })] })] }), _jsx("div", { className: "space-y-6", children: entries.length === 0 ? (_jsx("div", { className: "text-slate-500 text-center py-8", children: _jsx("p", { children: "No entries yet. Click \"+ Add Entry\" to start." }) })) : (entries.map((entry, idx) => {
                    // Highlight tags in content
                    let highlightedContent = entry.content;
                    if (note.tags && note.tags.length > 0) {
                        note.tags.forEach(tag => {
                            const regex = new RegExp(`(#${tag}|\\b${tag}\\b)`, 'gi');
                            highlightedContent = highlightedContent.replace(regex, '<mark class="bg-yellow-600 text-slate-100 px-1 rounded font-semibold">$1</mark>');
                        });
                    }
                    return (_jsxs("div", { className: "bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 group transition-all duration-200", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsx("div", { className: "text-xs font-mono text-blue-400", children: entry.timestamp }), _jsxs("div", { className: "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200", children: [_jsx("button", { onClick: () => handleEditEntry(idx), className: "px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs hover:bg-slate-600 transform hover:scale-105 active:scale-95 transition-all duration-200", children: "\u270F\uFE0F" }), _jsx("button", { onClick: () => handleDeleteEntry(idx), className: "px-2 py-1 bg-red-900 text-red-200 rounded text-xs hover:bg-red-800 transform hover:scale-105 active:scale-95 transition-all duration-200", children: "\uD83D\uDDD1\uFE0F" })] })] }), _jsx("div", { className: "text-slate-200 whitespace-pre-wrap leading-relaxed", dangerouslySetInnerHTML: { __html: highlightedContent } })] }, idx));
                })) })] }));
}
