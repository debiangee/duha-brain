const API_BASE = '/api/v1';
export const api = {
    async createNote(req) {
        const res = await fetch(`${API_BASE}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req)
        });
        if (!res.ok)
            throw new Error('Failed to create note');
        return res.json();
    },
    async getNotes(search, type, limit = 100, offset = 0) {
        let url = `${API_BASE}/notes?limit=${limit}&offset=${offset}`;
        if (search)
            url += `&search=${encodeURIComponent(search)}`;
        if (type)
            url += `&type=${encodeURIComponent(type)}`;
        console.log('Fetching from:', url);
        try {
            const res = await fetch(url);
            console.log('Response status:', res.status, res.ok);
            if (!res.ok) {
                const text = await res.text();
                console.error('Response error:', text);
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            const data = await res.json();
            console.log('Fetched data:', data);
            return data;
        }
        catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    },
    async getNote(id) {
        const res = await fetch(`${API_BASE}/notes/${id}`);
        if (!res.ok)
            throw new Error('Failed to fetch note');
        return res.json();
    },
    async updateNote(id, updates) {
        const res = await fetch(`${API_BASE}/notes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!res.ok)
            throw new Error('Failed to update note');
        return res.json();
    },
    async deleteNote(id) {
        const res = await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' });
        if (!res.ok)
            throw new Error('Failed to delete note');
    },
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${API_BASE}/images`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok)
            throw new Error('Failed to upload image');
        const data = await res.json();
        return data.url;
    },
    // Feed endpoints
    async addFeed(url) {
        const res = await fetch(`${API_BASE}/feeds`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        if (!res.ok)
            throw new Error('Failed to add feed');
        return res.json();
    },
    async getFeeds() {
        const res = await fetch(`${API_BASE}/feeds`);
        if (!res.ok)
            throw new Error('Failed to get feeds');
        return res.json();
    },
    async getFeedItems(feedId, limit = 50) {
        const res = await fetch(`${API_BASE}/feeds/${feedId}/items?limit=${limit}`);
        if (!res.ok)
            throw new Error('Failed to get feed items');
        return res.json();
    },
    async getRecentFeedItems(limit = 100) {
        const res = await fetch(`${API_BASE}/feeds/items?limit=${limit}`);
        if (!res.ok)
            throw new Error('Failed to get recent items');
        return res.json();
    },
    async saveFeedItem(itemId, notebookId) {
        const res = await fetch(`${API_BASE}/feeds/items/${itemId}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notebookId: notebookId || null })
        });
        if (!res.ok)
            throw new Error('Failed to save feed item');
        return res.json();
    },
    async refreshFeed(feedId) {
        const res = await fetch(`${API_BASE}/feeds/${feedId}/refresh`, {
            method: 'POST'
        });
        if (!res.ok)
            throw new Error('Failed to refresh feed');
        return res.json();
    },
    async deleteFeed(feedId) {
        const res = await fetch(`${API_BASE}/feeds/${feedId}`, { method: 'DELETE' });
        if (!res.ok)
            throw new Error('Failed to delete feed');
    }
};
