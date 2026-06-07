import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { api } from '../api';
import { toTitleCase } from '../utils/text';
export default function NoteForm({ onSubmit, loading }) {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
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
            setContent(editor.getHTML());
        }
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim())
            return;
        // Extract tags from HTML content
        const tagMatches = content.match(/#\w+/g) || [];
        const tags = [...new Set(tagMatches.map(t => t.substring(1).toLowerCase()))];
        await onSubmit({
            title: toTitleCase(title),
            content,
            type: 'thought',
            tags
        });
        setTitle('');
        setContent('');
        editor?.commands.clearContent();
    };
    if (!editor) {
        return _jsx("div", { className: "text-slate-500", children: "Loading editor..." });
    }
    return (_jsxs("form", { onSubmit: handleSubmit, className: "bg-slate-900 rounded-lg border border-slate-800 p-6 space-y-4 animate-fade-in", children: [_jsx("input", { type: "text", placeholder: "Notebook title...", value: title, onChange: (e) => setTitle(e.target.value), className: "w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold text-lg", required: true }), _jsxs("div", { className: "flex flex-wrap gap-2 p-3 bg-slate-800 rounded-lg border border-slate-700", children: [_jsx("button", { type: "button", onClick: () => editor.chain().focus().toggleBold().run(), className: `px-2 py-1 rounded text-sm transition-all ${editor.isActive('bold')
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`, children: _jsx("strong", { children: "B" }) }), _jsx("button", { type: "button", onClick: () => editor.chain().focus().toggleItalic().run(), className: `px-2 py-1 rounded text-sm transition-all ${editor.isActive('italic')
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`, children: _jsx("em", { children: "I" }) }), _jsx("button", { type: "button", onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), className: `px-2 py-1 rounded text-sm transition-all ${editor.isActive('heading')
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`, children: "H" }), _jsx("button", { type: "button", onClick: () => editor.chain().focus().toggleBulletList().run(), className: `px-2 py-1 rounded text-sm transition-all ${editor.isActive('bulletList')
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`, children: "\u2022" }), _jsx("button", { type: "button", onClick: () => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    try {
                                        const url = await api.uploadImage(file);
                                        editor?.chain().focus().setImage({ src: url }).run();
                                    }
                                    catch (err) {
                                        console.error('Failed to upload image:', err);
                                        alert('Failed to upload image');
                                    }
                                }
                            };
                            input.click();
                        }, className: "px-2 py-1 rounded text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all", children: "\uD83D\uDDBC\uFE0F" })] }), _jsx("div", { className: "bg-slate-800 border border-slate-700 rounded-lg p-4 min-h-64 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200", children: _jsx(EditorContent, { editor: editor }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "submit", disabled: loading, className: "px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transform hover:scale-105 active:scale-95 transition-all duration-200", children: loading ? 'Saving...' : 'Create Notebook' }), _jsx("button", { type: "reset", onClick: () => {
                            setTitle('');
                            setContent('');
                            editor?.commands.clearContent();
                        }, className: "px-6 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 transform hover:scale-105 active:scale-95 transition-all duration-200", children: "Clear" })] })] }));
}
