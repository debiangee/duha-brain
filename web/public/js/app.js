const API_BASE = '/api/v1';

// DOM elements
const noteForm = document.getElementById('noteForm');
const notesList = document.getElementById('notesList');
const searchInput = document.getElementById('searchInput');
const filterType = document.getElementById('filterType');
const noteModal = document.getElementById('noteModal');
const editNoteForm = document.getElementById('editNoteForm');

// Search on input change (debounced)
let searchTimeout;
searchInput.addEventListener('input', () => {
	clearTimeout(searchTimeout);
	searchTimeout = setTimeout(loadNotes, 300);
});

// Filter on change
filterType.addEventListener('change', loadNotes);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
	loadNotes();
	setupEventListeners();
});

// Event listeners
function setupEventListeners() {
	noteForm.addEventListener('submit', createNote);
	editNoteForm.addEventListener('submit', updateNote);
}

// Helper function to focus on new note form
function focusNewNoteForm() {
	document.getElementById('title').focus();
	document.querySelector('.new-note-section').scrollIntoView({ behavior: 'smooth' });
}

// Handle search input
function handleSearch() {
	clearTimeout(searchTimeout);
	searchTimeout = setTimeout(loadNotes, 300);
}

// Create a new note
async function createNote(e) {
	e.preventDefault();

	const title = document.getElementById('title').value.trim();
	const content = document.getElementById('content').value.trim();
	const type = document.getElementById('type').value;
	const tagsInput = document.getElementById('tags').value.trim();
	const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];

	if (!title || !content) {
		showAlert('Title and content are required', 'error');
		return;
	}

	try {
		const response = await fetch(`${API_BASE}/notes`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				title,
				content,
				type,
				tags,
				source: 'manual',
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const note = await response.json();
		showAlert('✓ Note created', 'success');
		noteForm.reset();
		loadNotes();
	} catch (error) {
		console.error('Error creating note:', error);
		showAlert('Failed to create note', 'error');
	}
}

// Load and display notes
async function loadNotes() {
	const search = searchInput.value.trim();
	const type = filterType.value.trim();

	let url = `${API_BASE}/notes?limit=100&offset=0`;
	if (search) url += `&search=${encodeURIComponent(search)}`;
	if (type) url += `&type=${encodeURIComponent(type)}`;

	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		renderNotes(data.data || []);
	} catch (error) {
		console.error('Error loading notes:', error);
		notesList.innerHTML = '<p class="loading">Failed to load notes</p>';
	}
}

// Render notes
function renderNotes(notes) {
	if (notes.length === 0) {
		notesList.innerHTML = '<div class="empty"><p>No notes yet. Create one to get started!</p></div>';
		document.getElementById('statTotal').textContent = '0';
		return;
	}

	// Update stat
	document.getElementById('statTotal').textContent = notes.length;

	const typeEmojis = {
		thought: '💭',
		snippet: '✂️',
		article: '📰',
		voice: '🎤',
		image: '🖼️',
		video: '🎥',
		meeting: '👥',
		jira: '🎯',
		goal: '🎪',
		feed: '📡'
	};

	const html = notes
		.map(
			note => `
		<div class="note-card" onclick="openNoteModal('${note.id}')">
			<span class="note-type">${typeEmojis[note.type] || '📝'} ${note.type}</span>
			<div class="note-title">${escapeHtml(note.title)}</div>
			<div class="note-meta">
				<span>📅 ${formatDate(note.createdAt)}</span>
			</div>
			<div class="note-content">${escapeHtml(note.content)}</div>
			${
				note.tags && note.tags.length > 0
					? `<div class="note-tags">${note.tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}</div>`
					: ''
			}
		</div>
	`
		)
		.join('');

	notesList.innerHTML = html;
}

// Open note modal for editing
async function openNoteModal(id) {
	try {
		const response = await fetch(`${API_BASE}/notes/${id}`);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const note = await response.json();

		document.getElementById('editNoteId').value = note.id;
		document.getElementById('editTitle').value = note.title;
		document.getElementById('editContent').value = note.content;
		document.getElementById('editType').value = note.type;
		document.getElementById('editTags').value = note.tags ? note.tags.join(', ') : '';

		noteModal.classList.add('active');
	} catch (error) {
		console.error('Error opening note:', error);
		showAlert('Failed to load note', 'error');
	}
}

// Close note modal
function closeNoteModal() {
	noteModal.classList.remove('active');
	editNoteForm.reset();
}

function closeNoteModalOnBg(event) {
	if (event.target === noteModal) {
		closeNoteModal();
	}
}

// Update note
async function updateNote(e) {
	e.preventDefault();

	const id = document.getElementById('editNoteId').value;
	const title = document.getElementById('editTitle').value.trim();
	const content = document.getElementById('editContent').value.trim();
	const type = document.getElementById('editType').value;
	const tagsInput = document.getElementById('editTags').value.trim();
	const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];

	try {
		const response = await fetch(`${API_BASE}/notes/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				title,
				content,
				type,
				tags,
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		showAlert('✓ Note updated', 'success');
		closeNoteModal();
		loadNotes();
	} catch (error) {
		console.error('Error updating note:', error);
		showAlert('Failed to update note', 'error');
	}
}

// Delete note
async function deleteCurrentNote() {
	const id = document.getElementById('editNoteId').value;

	if (!confirm('Delete this note? This cannot be undone.')) {
		return;
	}

	try {
		const response = await fetch(`${API_BASE}/notes/${id}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		showAlert('✓ Note deleted', 'success');
		closeNoteModal();
		loadNotes();
	} catch (error) {
		console.error('Error deleting note:', error);
		showAlert('Failed to delete note', 'error');
	}
}

// Utility functions

// Format date
function formatDate(dateString) {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

// Escape HTML
function escapeHtml(text) {
	const map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;',
	};
	return text.replace(/[&<>"']/g, m => map[m]);
}

// Show alert
function showAlert(message, type = 'info') {
	// Create alert element
	const alertDiv = document.createElement('div');
	alertDiv.className = `alert alert-${type}`;
	alertDiv.textContent = message;

	// Insert at top right
	document.body.appendChild(alertDiv);

	// Remove after 4 seconds
	setTimeout(() => {
		alertDiv.remove();
	}, 4000);
}

// Close modal when clicking outside
window.addEventListener('click', e => {
	if (e.target === noteModal) {
		closeNoteModal();
	}
});
