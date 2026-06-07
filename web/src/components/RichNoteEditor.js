import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useEffect, useRef, useCallback, useState } from 'react';
import { api } from '../api';
import { toTitleCase } from '../utils/text';
// Helper to extract tags from HTML content
const extractTagsFromHtml = (html) => {
    const tagMatches = html.match(/#\w+/g) || [];
    return [...new Set(tagMatches.map(t => t.substring(1).toLowerCase()))];
};
export default function RichNoteEditor({ note, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [lastSaveTime, setLastSaveTime] = useState(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editingTitle, setEditingTitle] = useState(note.title);
    const saveTimeoutRef = useRef(null);
    const contentRef = useRef(note.content);
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                paragraph: {
                    HTMLAttributes: {
                        class: 'text-slate-200 leading-relaxed'
                    }
                },
                heading: {
                    levels: [1, 2, 3],
                    HTMLAttributes: {
                        class: 'font-bold text-slate-100'
                    }
                },
                codeBlock: {
                    HTMLAttributes: {
                        class: 'bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto'
                    }
                },
                bulletList: {
                    HTMLAttributes: {
                        class: 'list-disc list-inside ml-4 text-slate-200'
                    }
                },
                orderedList: {
                    HTMLAttributes: {
                        class: 'list-decimal list-inside ml-4 text-slate-200'
                    }
                },
                listItem: {
                    HTMLAttributes: {
                        class: 'text-slate-200'
                    }
                },
                blockquote: {
                    HTMLAttributes: {
                        class: 'border-l-4 border-slate-600 pl-4 text-slate-400 italic'
                    }
                }
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-2xl my-4'
                }
            }),
            Link.configure({
                HTMLAttributes: {
                    class: 'text-blue-400 underline hover:text-blue-300'
                }
            })
        ],
        content: note.content,
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none text-slate-100'
            },
            handlePaste(_view, event) {
                const items = event.clipboardData?.items;
                if (!items)
                    return false;
                for (const item of items) {
                    if (item.type.indexOf('image') === 0) {
                        event.preventDefault();
                        const file = item.getAsFile();
                        if (file) {
                            // Upload the image
                            api.uploadImage(file)
                                .then(url => {
                                editor?.chain().focus().setImage({ src: url }).run();
                            })
                                .catch(err => {
                                console.error('Failed to upload image:', err);
                                alert('Failed to upload image');
                            });
                            return true;
                        }
                    }
                }
                return false;
            }
        },
        onUpdate: ({ editor }) => {
            contentRef.current = editor.getHTML();
            setIsEditing(true);
            // Debounce save
            if (saveTimeoutRef.current)
                clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(async () => {
                await handleSave();
            }, 2000); // Save after 2 seconds of inactivity
        }
    });
    const handleSave = useCallback(async () => {
        if (!editor || contentRef.current === note.content) {
            setIsEditing(false);
            return;
        }
        try {
            // Extract tags from HTML content
            const tags = extractTagsFromHtml(contentRef.current);
            const updated = await api.updateNote(note.id, {
                title: note.title,
                content: contentRef.current,
                type: note.type,
                tags,
                source: note.source
            });
            onUpdate(updated);
            setLastSaveTime(new Date());
            setIsEditing(false);
        }
        catch (err) {
            console.error('Failed to save:', err);
        }
    }, [editor, note, onUpdate]);
    const handleDeleteNote = async () => {
        if (!confirm('Delete this entire notebook?'))
            return;
        try {
            await api.deleteNote(note.id);
            alert('Notebook deleted');
            window.location.reload();
        }
        catch (err) {
            console.error('Failed to delete:', err);
            alert('Failed to delete notebook');
        }
    };
    const handleSaveTitle = async () => {
        if (!editingTitle.trim()) {
            setEditingTitle(note.title);
            setIsEditingTitle(false);
            return;
        }
        const formattedTitle = toTitleCase(editingTitle);
        if (formattedTitle === note.title) {
            setIsEditingTitle(false);
            return;
        }
        try {
            const updated = await api.updateNote(note.id, {
                title: formattedTitle,
                content: note.content,
                type: note.type,
                tags: note.tags,
                source: note.source
            });
            onUpdate(updated);
            setIsEditingTitle(false);
            setEditingTitle(formattedTitle);
        }
        catch (err) {
            console.error('Failed to save title:', err);
            alert('Failed to save title');
            setEditingTitle(note.title);
        }
    };
    useEffect(() => {
        // Update editor content when note changes
        if (editor && note) {
            editor.commands.setContent(note.content);
            contentRef.current = note.content;
            setEditingTitle(note.title);
            setIsEditing(false);
            setLastSaveTime(null);
        }
    }, [note.id, editor]);
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current)
                clearTimeout(saveTimeoutRef.current);
        };
    }, []);
    if (!editor) {
        return _jsx("div", { className: "p-8 text-slate-500", children: "Loading editor..." });
    }
    return (_jsxs("div", { className: "p-8 max-w-4xl mx-auto animate-fade-in", children: [_jsxs("div", { className: "mb-8 flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [isEditingTitle ? (_jsx("input", { type: "text", value: editingTitle, onChange: (e) => setEditingTitle(e.target.value), onBlur: handleSaveTitle, onKeyDown: (e) => {
                                    if (e.key === 'Enter')
                                        handleSaveTitle();
                                    if (e.key === 'Escape') {
                                        setEditingTitle(note.title);
                                        setIsEditingTitle(false);
                                    }
                                }, autoFocus: true, className: "text-4xl font-bold text-slate-100 mb-2 bg-slate-800 border border-slate-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" })) : (_jsx("h1", { onClick: () => setIsEditingTitle(true), className: "text-4xl font-bold text-slate-100 mb-2 select-none cursor-pointer hover:text-slate-200 transition-colors", children: editingTitle })), _jsxs("div", { className: "flex gap-4 text-xs text-slate-500", children: [_jsxs("span", { children: ["\uD83D\uDCC5 Created: ", new Date(note.createdAt).toLocaleString()] }), lastSaveTime && (_jsxs("span", { children: ["\uD83D\uDCBE Saved: ", lastSaveTime.toLocaleTimeString()] })), isEditing && (_jsx("span", { className: "text-amber-400", children: "\u270E Editing..." }))] })] }), _jsx("button", { onClick: handleDeleteNote, className: "px-4 py-2 bg-red-900 text-red-200 rounded-lg hover:bg-red-800 font-semibold transform hover:scale-105 active:scale-95 transition-all duration-200", title: "Delete entire note", children: "\uD83D\uDDD1\uFE0F" })] }), _jsxs("div", { className: "mb-6 flex flex-wrap gap-2 p-4 bg-slate-900 rounded-lg border border-slate-800", children: [_jsx("button", { onClick: () => editor.chain().focus().toggleBold().run(), className: `px-3 py-1.5 rounded font-semibold text-sm transition-all duration-200 ${editor.isActive('bold')
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`, title: "Bold (Ctrl+B)", children: _jsx("strong", { children: "B" }) }), _jsx("button", { onClick: () => editor.chain().focus().toggleItalic().run(), className: `px-3 py-1.5 rounded font-semibold text-sm transition-all duration-200 ${editor.isActive('italic')
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`, title: "Italic (Ctrl+I)", children: _jsx("em", { children: "I" }) }), _jsx("button", { onClick: () => editor.chain().focus().toggleStrike().run(), className: `px-3 py-1.5 rounded font-semibold text-sm transition-all duration-200 ${editor.isActive('strike')
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`, title: "Strikethrough", children: _jsx("s", { children: "S" }) }), _jsx("div", { className: "w-px bg-slate-700" }), _jsx("button", { onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), className: `px-3 py-1.5 rounded font-semibold text-sm transition-all duration-200 ${editor.isActive('heading', { level: 1 })
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`, title: "Heading 1", children: "H1" }), _jsx("button", { onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), className: `px-3 py-1.5 rounded font-semibold text-sm transition-all duration-200 ${editor.isActive('heading', { level: 2 })
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`, title: "Heading 2", children: "H2" }), _jsx("div", { className: "w-px bg-slate-700" }), _jsx("button", { onClick: () => editor.chain().focus().toggleBulletList().run(), className: `px-3 py-1.5 rounded font-semibold text-sm transition-all duration-200 ${editor.isActive('bulletList')
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`, title: "Bullet list", children: "\u2022 List" }), _jsx("button", { onClick: () => editor.chain().focus().toggleOrderedList().run(), className: `px-3 py-1.5 rounded font-semibold text-sm transition-all duration-200 ${editor.isActive('orderedList')
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`, title: "Ordered list", children: "1. List" }), _jsx("div", { className: "w-px bg-slate-700" }), _jsx("button", { onClick: () => editor.chain().focus().toggleCodeBlock().run(), className: `px-3 py-1.5 rounded font-semibold text-sm transition-all duration-200 ${editor.isActive('codeBlock')
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`, title: "Code block", children: "</>" }), _jsx("div", { className: "w-px bg-slate-700" }), _jsx("button", { onClick: () => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    try {
                                        const url = await api.uploadImage(file);
                                        editor.chain().focus().setImage({ src: url }).run();
                                    }
                                    catch (err) {
                                        console.error('Failed to upload image:', err);
                                        alert('Failed to upload image');
                                    }
                                }
                            };
                            input.click();
                        }, className: "px-3 py-1.5 rounded font-semibold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all duration-200", title: "Insert image", children: "\uD83D\uDDBC\uFE0F Image" }), _jsx("div", { className: "w-px bg-slate-700" }), _jsx("button", { onClick: () => editor.chain().focus().clearNodes().run(), className: "px-3 py-1.5 rounded font-semibold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all duration-200", title: "Clear formatting", children: "\u21BA Clear" })] }), _jsx("div", { className: "bg-slate-900 rounded-lg border border-slate-800 p-6 min-h-96 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200", children: _jsx(EditorContent, { editor: editor }) }), _jsx("div", { className: "mt-4 text-xs text-slate-500 text-center", children: "\uD83D\uDCA1 Tip: Paste images directly, use #tags for organization, auto-saves as you type" })] }));
}
