import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../api';
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
];
const cleanArticleTitle = (title) => {
    // Remove arXiv IDs and similar patterns
    title = title.replace(/\[arXiv:\d+\.\d+v\d+\]/g, '').trim();
    title = title.replace(/arXiv:\d+\.\d+v\d+/g, '').trim();
    // Remove other common noise patterns
    title = title.replace(/^\d+\.\s+/, '').trim();
    title = title.replace(/\s*\([^)]*arXiv[^)]*\)\s*$/gi, '').trim();
    return title;
};
export default function FeedsPage({ onAddToNotebook }) {
    const [feeds, setFeeds] = useState([]);
    const [feedItems, setFeedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingFeed, setAddingFeed] = useState(false);
    const [feedUrl, setFeedUrl] = useState('');
    const [error, setError] = useState('');
    const [configTab, setConfigTab] = useState('feeds');
    useEffect(() => {
        loadFeeds();
    }, []);
    useEffect(() => {
        if (feeds.length > 0) {
            loadFeedItems();
        }
        else {
            setLoading(false);
        }
    }, [feeds]);
    const loadFeeds = async () => {
        try {
            const data = await api.getFeeds();
            setFeeds(data || []);
        }
        catch (err) {
            console.error('Failed to load feeds:', err);
            setLoading(false);
        }
    };
    const loadFeedItems = async () => {
        setLoading(true);
        try {
            const items = await api.getRecentFeedItems(200);
            setFeedItems(items || []);
        }
        catch (err) {
            console.error('Failed to load feed items:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddFeed = async (e) => {
        e.preventDefault();
        if (!feedUrl.trim())
            return;
        try {
            setError('');
            await api.addFeed(feedUrl);
            setFeedUrl('');
            setAddingFeed(false);
            loadFeeds();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add feed');
        }
    };
    const handleAddDefaultFeeds = async () => {
        try {
            setError('');
            for (const feed of DEFAULT_FEEDS) {
                try {
                    await api.addFeed(feed.url);
                }
                catch (err) {
                    console.warn(`Failed to add ${feed.title}:`, err);
                }
            }
            await new Promise(r => setTimeout(r, 500));
            loadFeeds();
        }
        catch (err) {
            setError('Failed to add default feeds');
        }
    };
    const handleDeleteFeed = async (feedId) => {
        if (!confirm('Delete this feed?'))
            return;
        try {
            await api.deleteFeed(feedId);
            loadFeeds();
        }
        catch (err) {
            console.error('Failed to delete feed:', err);
        }
    };
    const handleRefreshFeed = async (feedId) => {
        try {
            await api.refreshFeed(feedId);
            loadFeedItems();
        }
        catch (err) {
            console.error('Failed to refresh feed:', err);
        }
    };
    return (_jsxs("div", { className: "flex h-full overflow-hidden", children: [_jsx("div", { className: "flex-1 overflow-y-auto bg-slate-950", children: loading && feedItems.length === 0 ? (_jsx("div", { className: "flex items-center justify-center h-full text-slate-500", children: _jsx("p", { children: "Loading feeds..." }) })) : feedItems.length === 0 ? (_jsx("div", { className: "flex items-center justify-center h-full text-slate-500 text-center p-8", children: _jsx("p", { children: "No articles yet. Add feeds to get started!" }) })) : (_jsx("div", { className: "max-w-2xl mx-auto space-y-4 p-6", children: feedItems.map(item => (_jsx("div", { className: `bg-slate-900 rounded-lg border p-6 group ${item.isSaved
                            ? 'border-slate-700 opacity-50'
                            : 'border-slate-800 hover:border-blue-600 transition-colors'}`, children: _jsxs("div", { className: "flex justify-between items-start gap-4", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "font-semibold text-slate-100 mb-2 text-lg line-clamp-2 group-hover:text-blue-400 transition-colors", style: { fontFamily: "'Inter', sans-serif" }, children: cleanArticleTitle(item.title) }), item.description && (_jsx("p", { className: "text-sm text-slate-400 line-clamp-2 mb-3 leading-relaxed", style: { fontFamily: "'Inter', sans-serif" }, children: item.description })), _jsxs("div", { className: "flex items-center justify-between text-xs text-slate-500 gap-2", children: [_jsxs("span", { style: { fontFamily: "'Inter', sans-serif" }, children: ["\uD83D\uDCC5 ", new Date(item.pubDate || item.fetchedAt).toLocaleDateString()] }), item.link && (_jsx("a", { href: item.link, target: "_blank", rel: "noopener noreferrer", className: "text-blue-400 hover:text-blue-300 transition-colors", style: { fontFamily: "'Inter', sans-serif" }, children: "Read \u2192" }))] })] }), _jsxs("div", { className: "flex-shrink-0 flex gap-1", children: [_jsx("button", { onClick: () => onAddToNotebook(item), className: "px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors opacity-0 group-hover:opacity-100 whitespace-nowrap", style: { fontFamily: "'Inter', sans-serif" }, children: "+ Add" }), _jsx("button", { onClick: () => {
                                                if (item.isSaved) {
                                                    alert('Already marked as read');
                                                }
                                                else {
                                                    api.saveFeedItem(item.id).then(() => loadFeedItems()).catch(err => console.error('Error:', err));
                                                }
                                            }, className: `px-2.5 py-1.5 rounded text-xs font-semibold transition-colors opacity-0 group-hover:opacity-100 whitespace-nowrap ${item.isSaved
                                                ? 'bg-green-600 text-white'
                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`, style: { fontFamily: "'Inter', sans-serif" }, title: item.isSaved ? 'Already read' : 'Mark as read', children: item.isSaved ? '✓' : '☐' })] })] }) }, item.id))) })) }), _jsxs("div", { className: "w-96 bg-slate-900 border-l-2 border-slate-700 overflow-y-auto flex flex-col", children: [_jsxs("div", { className: "flex border-b border-slate-700 flex-shrink-0 sticky top-0 bg-slate-900", children: [_jsx("button", { onClick: () => setConfigTab('feeds'), className: `flex-1 px-4 py-4 text-sm font-semibold transition-all ${configTab === 'feeds'
                                    ? 'border-b-2 border-blue-500 text-blue-400'
                                    : 'text-slate-500 hover:text-slate-400'}`, style: { fontFamily: "'Inter', sans-serif" }, children: "\uD83D\uDCE1 Feed" }), _jsx("button", { onClick: () => setConfigTab('config'), className: `flex-1 px-4 py-4 text-sm font-semibold transition-all ${configTab === 'config'
                                    ? 'border-b-2 border-blue-500 text-blue-400'
                                    : 'text-slate-500 hover:text-slate-400'}`, style: { fontFamily: "'Inter', sans-serif" }, children: "\u2699\uFE0F Config" })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-5 transition-all duration-200", children: configTab === 'feeds' ? (
                        // Feeds List Tab
                        _jsx("div", { className: "space-y-3 animate-fadeIn", children: feeds.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("p", { className: "text-sm text-slate-500", style: { fontFamily: "'Inter', sans-serif" }, children: "No feeds yet" }), _jsx("p", { className: "text-xs text-slate-600 mt-2", style: { fontFamily: "'Inter', sans-serif" }, children: "Add feeds to start reading" })] })) : (feeds.map(feed => (_jsxs("div", { className: "p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-600 hover:bg-slate-750 transition-all duration-200 group", children: [_jsxs("div", { className: "flex justify-between items-start gap-2 mb-2", children: [_jsx("div", { className: "flex-1 min-w-0", children: _jsx("p", { className: "font-semibold text-slate-100 text-sm leading-tight transition-colors duration-200 group-hover:text-blue-400", style: { fontFamily: "'Inter', sans-serif" }, children: feed.title }) }), _jsx("button", { onClick: () => handleDeleteFeed(feed.id), className: "text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0 text-base", title: "Delete feed", children: "\u2715" })] }), _jsx("p", { className: "text-xs text-slate-500 truncate mb-3 transition-colors duration-200 group-hover:text-slate-400", style: { fontFamily: "'Inter', sans-serif" }, children: feed.url }), _jsx("button", { onClick: () => handleRefreshFeed(feed.id), className: "w-full text-xs px-2 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-all duration-200 font-medium", style: { fontFamily: "'Inter', sans-serif" }, children: "\uD83D\uDD04 Refresh" })] }, feed.id)))) })) : (
                        // Configuration Tab
                        _jsxs("div", { className: "space-y-4 animate-fadeIn", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-slate-100 mb-4", style: { fontFamily: "'Inter', sans-serif" }, children: "Add New Feed" }), !addingFeed ? (_jsxs("div", { className: "space-y-3", children: [feeds.length === 0 && (_jsx("button", { onClick: handleAddDefaultFeeds, className: "w-full px-4 py-3 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all duration-200", style: { fontFamily: "'Inter', sans-serif" }, children: "\uD83D\uDCF0 Load 11 Defaults" })), _jsx("button", { onClick: () => setAddingFeed(true), className: "w-full px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all duration-200", style: { fontFamily: "'Inter', sans-serif" }, children: "+ Add Feed" })] })) : (_jsxs("form", { onSubmit: handleAddFeed, className: "space-y-3 animate-fadeIn", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-400 mb-2 transition-colors duration-200", style: { fontFamily: "'Inter', sans-serif" }, children: "RSS Feed URL" }), _jsx("input", { type: "text", placeholder: "https://example.com/feed.xml", value: feedUrl, onChange: (e) => setFeedUrl(e.target.value), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200", style: { fontFamily: "'Inter', sans-serif" }, autoFocus: true })] }), error && (_jsxs("p", { className: "text-xs text-red-400 bg-red-900/20 p-2 rounded animate-fadeIn transition-all duration-200", style: { fontFamily: "'Inter', sans-serif" }, children: ["\u26A0\uFE0F ", error] })), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "submit", className: "flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all duration-200", style: { fontFamily: "'Inter', sans-serif" }, children: "Save Feed" }), _jsx("button", { type: "button", onClick: () => {
                                                                setAddingFeed(false);
                                                                setError('');
                                                                setFeedUrl('');
                                                            }, className: "flex-1 px-3 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-all duration-200", style: { fontFamily: "'Inter', sans-serif" }, children: "Cancel" })] })] }))] }), _jsx("div", { className: "pt-4 border-t border-slate-700 transition-all duration-200", children: _jsxs("p", { className: "text-xs text-slate-500 transition-colors duration-200", style: { fontFamily: "'Inter', sans-serif" }, children: ["\uD83D\uDCA1 ", feeds.length, " feed", feeds.length !== 1 ? 's' : '', " subscribed"] }) })] })) })] })] }));
}
