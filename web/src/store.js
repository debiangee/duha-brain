import { create } from 'zustand';
export const useStore = create((set) => ({
    notes: [],
    selectedNote: null,
    searchQuery: '',
    filterType: '',
    loading: false,
    toast: null,
    setNotes: (notes) => set({ notes }),
    setSelectedNote: (note) => set({ selectedNote: note }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setFilterType: (type) => set({ filterType: type }),
    setLoading: (loading) => set({ loading }),
    setToast: (toast) => set({ toast }),
    addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
    updateNote: (note) => set((state) => ({
        notes: state.notes.map(n => n.id === note.id ? note : n),
        selectedNote: state.selectedNote?.id === note.id ? note : state.selectedNote
    })),
    removeNote: (id) => set((state) => ({
        notes: state.notes.filter(n => n.id !== id),
        selectedNote: state.selectedNote?.id === id ? null : state.selectedNote
    }))
}));
