import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../api';
import FeedItemCard from './FeedItemCard';
export default function FeedView({ feedId, feedTitle, onItemSaved }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [savingId, setSavingId] = useState(null);
    useEffect(() => {
        loadItems();
    }, [feedId]);
    const loadItems = async () => {
        setLoading(true);
        try {
            const data = await api.getFeedItems(feedId, 50);
            setItems(data || []);
        }
        catch (err) {
            console.error('Failed to load feed items:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await api.refreshFeed(feedId);
            await loadItems();
        }
        catch (err) {
            alert('Failed to refresh feed');
        }
        finally {
            setRefreshing(false);
        }
    };
    const handleSaveItem = async (itemId) => {
        setSavingId(itemId);
        try {
            await api.saveFeedItem(itemId);
            setItems(items.map(item => item.id === itemId ? { ...item, isSaved: true } : item));
            onItemSaved();
        }
        catch (err) {
            alert('Failed to save item');
        }
        finally {
            setSavingId(null);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-full text-slate-500", children: _jsx("p", { children: "Loading articles..." }) }));
    }
    return (_jsxs("div", { className: "flex flex-col h-full overflow-hidden", children: [_jsxs("div", { className: "p-6 border-b border-slate-800 bg-slate-900", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-2xl font-bold text-slate-100", children: feedTitle }), _jsx("button", { onClick: handleRefresh, disabled: refreshing, className: "px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-semibold disabled:opacity-50 transform hover:scale-105 active:scale-95 transition-all duration-200", children: refreshing ? '⟳ Refreshing...' : '⟳ Refresh' })] }), _jsxs("p", { className: "text-sm text-slate-400 mt-2", children: [items.length, " articles"] })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-6 space-y-3", children: items.length === 0 ? (_jsx("p", { className: "text-slate-500 text-center py-8", children: "No articles yet. Click Refresh to fetch." })) : (items.map(item => (_jsx(FeedItemCard, { item: item, onSave: handleSaveItem, isSaving: savingId === item.id }, item.id)))) })] }));
}
