// DOM Elements
const categoriesContainer = document.getElementById('categoriesContainer');
const bookmarksGrid = document.getElementById('bookmarksGrid');
const currentCategoryElement = document.getElementById('currentCategory');

// Modal Elements
const categoryModal = document.getElementById('categoryModal');
const bookmarkModal = document.getElementById('bookmarkModal');
const confirmModal = document.getElementById('confirmModal');

// Buttons
const addCategoryBtn = document.getElementById('addCategoryBtn');
const addBookmarkBtn = document.getElementById('addBookmarkBtn');

// Forms
const categoryForm = document.getElementById('categoryForm');
const bookmarkForm = document.getElementById('bookmarkForm');

// Other elements
const categoryNameInput = document.getElementById('categoryName');
const bookmarkNameInput = document.getElementById('bookmarkName');
const bookmarkUrlInput = document.getElementById('bookmarkUrl');
const bookmarkCategorySelect = document.getElementById('bookmarkCategory');

// State
let currentCategoryId = null;
let editMode = { active: false, id: null };
let confirmCallback = null;

// Track when a bookmark is opened
function trackBookmarkUsage(bookmarkId) {
    dataManager.incrementUsage(bookmarkId);
    // Update the UI to reflect the new usage
    updateFrequentlyUsed();
    
    // Also update the bookmark's last used timestamp in the current view
    const bookmarkElement = document.querySelector(`[data-bookmark-id="${bookmarkId}"]`);
    if (bookmarkElement) {
        bookmarkElement.classList.add('just-used');
        setTimeout(() => bookmarkElement.classList.remove('just-used'), 300);
    }
}

// Update the frequently used bookmarks section
function updateFrequentlyUsed() {
    const frequentlyUsedContainer = document.getElementById('frequentlyUsed');
    const frequentlyUsed = dataManager.getFrequentlyUsed();
    
    frequentlyUsedContainer.innerHTML = frequentlyUsed.map(bookmark => `
        <div class="relative group cursor-pointer">
            <a href="${bookmark.url}" target="_blank" 
               class="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full overflow-hidden 
                      bg-gray-900 hover:bg-gray-800 transition-all duration-200 border-2 border-transparent 
                      hover:border-netflix-red relative"
               onclick="trackBookmarkUsage('${bookmark.id}')">
                <img 
                    src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(bookmark.url)}&sz=256" 
                    alt="${bookmark.name}" 
                    class="w-8 h-8 object-contain"
                    onerror="this.onerror=null; 
                        this.src='https://icons.duckduckgo.com/ip2/' + new URL('${bookmark.url}').hostname + '.ico';
                        this.onerror=function(){ 
                            this.onerror=null; 
                            this.src='https://' + new URL('${bookmark.url}').hostname + '/favicon.ico';
                            this.onerror=function(){ this.style.display='none'; }
                        };">
            </a>
            <div class="absolute z-10 px-3 py-1.5 mt-2 text-sm text-white bg-gray-800 rounded shadow-lg 
                        opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200
                        top-full left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                ${bookmark.name}
                <div class="absolute top-0 left-1/2 w-2.5 h-2.5 -mt-1 -ml-1.5 transform -rotate-45 bg-gray-800"></div>
            </div>
        </div>
    `).join('');
}

// Update time and date display
function updateDateTime() {
    const now = new Date();
    const timeElement = document.getElementById('time');
    const dayElement = document.getElementById('day');
    const dateElement = document.getElementById('date');
    
    if (timeElement) {
        // Format time as 12-hour with AM/PM
        let hours = now.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const minutes = now.getMinutes().toString().padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes} ${ampm}`;
    }
    
    if (dayElement) {
        // Format day of week (e.g., 'Monday')
        const options = { weekday: 'long' };
        dayElement.textContent = now.toLocaleDateString('en-US', options);
    }
    
    if (dateElement) {
        // Format date as 'DD/MM/YYYY'
        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear();
        dateElement.textContent = `${day}/${month}/${year}`;
    }
}

// Initialize the application
function init() {
    // Initialize date and time
    updateDateTime();
    // Update time every minute
    setInterval(updateDateTime, 60000);
    
    // Load and display bookmarks with animation
    loadBookmarks().then(() => {
        // Initialize frequently used section
        updateFrequentlyUsed();
        // Animate bookmarks after loading
        const bookmarks = document.querySelectorAll('.bookmark-item');
        bookmarks.forEach((bookmark, index) => {
            // Set initial state
            bookmark.style.opacity = '0';
            bookmark.style.transform = 'scale(0.5)';
            
            // Animate in with staggered delay
            setTimeout(() => {
                bookmark.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                bookmark.style.opacity = '1';
                bookmark.style.transform = 'scale(1)';
            }, index * 50); // 50ms delay between each item
        });
    });
    
    // Load and display categories
    loadCategories();
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    // Add category button
    addCategoryBtn.addEventListener('click', () => openCategoryModal());
    
    // Add bookmark button
    addBookmarkBtn.addEventListener('click', () => openBookmarkModal());
    
    // Category form
    categoryForm.addEventListener('submit', handleCategorySubmit);
    
    // Bookmark form
    bookmarkForm.addEventListener('submit', handleBookmarkSubmit);
    
    // Modal close buttons
    document.getElementById('closeCategoryModal').addEventListener('click', () => closeModal(categoryModal));
    document.getElementById('closeBookmarkModal').addEventListener('click', () => closeModal(bookmarkModal));
    document.getElementById('cancelCategory').addEventListener('click', () => closeModal(categoryModal));
    document.getElementById('cancelBookmark').addEventListener('click', () => closeModal(bookmarkModal));
    
    // Confirmation modal buttons
    document.getElementById('confirmCancel').addEventListener('click', () => closeModal(confirmModal));
    document.getElementById('confirmAction').addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback();
            closeModal(confirmModal);
        }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === categoryModal) closeModal(categoryModal);
        if (e.target === bookmarkModal) closeModal(bookmarkModal);
        if (e.target === confirmModal) closeModal(confirmModal);
    });
}

// Load and display categories
function loadCategories() {
    const categories = dataManager.getCategories();
    
    // Add "All" category
    const allCategories = [{ id: null, name: 'All' }, ...categories];
    
    categoriesContainer.innerHTML = allCategories.map(category => {
        const isActive = currentCategoryId === category.id;
        const isAllTab = category.id === null;
        
        return `
            <div class="flex items-center group">
                <div data-category-id="${category.id || ''}" 
                     class="category-tab whitespace-nowrap px-4 py-2 rounded-l-full cursor-pointer 
                            ${isActive ? 'bg-netflix-red' : 'bg-gray-800 hover:bg-gray-700'}
                            transition-colors flex items-center min-w-0">
                    <span class="category-name truncate">${category.name}</span>
                    ${!isAllTab ? `
                        <button class="edit-category-btn ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <i class="fas fa-pen text-xs"></i>
                        </button>
                    ` : ''}
                </div>
                ${!isAllTab ? `
                    <button data-category-id="${category.id}" 
                            class="delete-category-btn h-full px-2 rounded-r-full bg-gray-800 hover:bg-red-700 text-gray-300 hover:text-white 
                                   ${isActive ? 'bg-red-700' : 'hover:bg-gray-700'}
                                   transition-colors">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            </div>
        `;
    }).join('');
    
    // Add event listeners to category tabs and edit buttons
    document.querySelectorAll('.category-tab').forEach(tab => {
        const categoryId = tab.dataset.categoryId || null;
        const isAllTab = categoryId === null;
        
        // Handle category click (navigation)
        tab.addEventListener('click', (e) => {
            // Don't navigate if clicking the delete or edit button
            if (e.target.closest('.delete-category-btn') || 
                e.target.closest('.edit-category-btn') ||
                tab.querySelector('input')) {
                return;
            }
            
            currentCategoryId = categoryId;
            loadBookmarks(categoryId);
            loadCategories();
        });
        
        // Handle edit button click
        if (!isAllTab) {
            const editBtn = tab.querySelector('.edit-category-btn');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    startEditingCategory(categoryId, tab);
                });
            }
        }
    });
    
    // Handle double-click on category names for editing
    document.querySelectorAll('.category-name').forEach(nameEl => {
        nameEl.addEventListener('dblclick', (e) => {
            const tab = e.target.closest('.category-tab');
            if (tab) {
                const categoryId = tab.dataset.categoryId;
                if (categoryId) {  // Don't allow editing the "All" category
                    e.stopPropagation();
                    startEditingCategory(categoryId, tab);
                }
            }
        });
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const categoryId = btn.dataset.categoryId;
            if (categoryId) {
                showConfirmDialog(
                    'Delete Category',
                    'Are you sure you want to delete this category? All bookmarks in this category will also be deleted.',
                    () => deleteCategory(categoryId)
                );
            }
        });
    });
}

// Delete a category
function deleteCategory(categoryId) {
    const success = dataManager.deleteCategory(categoryId);
    if (success) {
        // If the deleted category was selected, switch to 'All' view
        if (currentCategoryId === categoryId) {
            currentCategoryId = null;
        }
        loadCategories();
        loadBookmarks(currentCategoryId);
    }
}

// Animate bookmarks with a staggered effect
function animateBookmarks() {
    const bookmarks = document.querySelectorAll('.bookmark-item');
    bookmarks.forEach((bookmark, index) => {
        // Reset initial state
        bookmark.style.opacity = '0';
        bookmark.style.transform = 'scale(0.5)';
        
        // Clear any existing transitions
        bookmark.style.transition = 'none';
        
        // Force reflow to ensure the reset takes effect
        void bookmark.offsetWidth;
        
        // Animate in with staggered delay
        setTimeout(() => {
            bookmark.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            bookmark.style.opacity = '1';
            bookmark.style.transform = 'scale(1)';
        }, index * 50);
    });
}

// Load and display bookmarks
async function loadBookmarks(categoryId = null) {
    const bookmarks = dataManager.getBookmarks(categoryId);
    const category = categoryId ? dataManager.getCategoryById(categoryId) : null;
    
    // Update current category display
    currentCategoryElement.textContent = category ? category.name : 'All Bookmarks';
    
    if (bookmarks.length === 0) {
        bookmarksGrid.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-500">
                <i class="fas fa-bookmark text-4xl mb-2"></i>
                <p>No bookmarks found. Add some bookmarks to get started!</p>
            </div>
        `;
        return;
    }
    
    bookmarksGrid.innerHTML = bookmarks.map(bookmark => `
        <div class="bookmark-item group relative transform transition-all duration-300 hover:scale-105 hover:z-10" data-bookmark-id="${bookmark.id}">
            <a href="${bookmark.url}" target="_blank" rel="noopener noreferrer" 
               class="flex flex-col items-center p-2 bg-gray-950 rounded-5xl
               hover:bg-gray-800/80 transition-all duration-300 h-full border-2 border-transparent hover:border-netflix-red shadow-lg hover:shadow-xl hover:shadow-black/20">
                <div class="w-16 h-16 mb-3 flex items-center justify-center bg-transparent rounded-lg overflow-hidden transition-all duration-300 group-hover:w-18 group-hover:h-18">
                    <img 
                        src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(bookmark.url)}&sz=256" 
                        alt="" 
                        class="w-12 h-12 rounded-3xl object-contain"
                        onerror="this.onerror=null; 
                            this.src='https://icons.duckduckgo.com/ip2/' + new URL(bookmark.url).hostname + '.ico';
                            this.onerror=function(){ 
                                this.onerror=null; 
                                this.src='https://' + new URL(bookmark.url).hostname + '/favicon.ico';
                                this.onerror=function(){ 
                                    this.onerror=null; 
                                    this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2U1MDkxNCIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bS0xIDE4aDJ2LTJoLTJ2MnptMi4wNy03Ljc1bC0uOS45MkMxMS40NSAxMy4xMSAxMSAxMy41MSAxIDE0aC0ydi0uNk0xMSA1aDJ2NmgtMlY1eiIvPjwvc3ZnPg==';
                                };
                            };
                        "
                        loading="lazy"
                    />
                </div>
                <span class="text-sm text-center text-gray-300 group-hover:text-white font-medium truncate w-full transform transition-all duration-300 group-hover:scale-110">${bookmark.name}</span>
            </a>
            <div class="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="edit-bookmark p-1 bg-gray-700 rounded hover:bg-gray-600" 
                        data-id="${bookmark.id}">
                    <i class="fas fa-edit text-xs"></i>
                </button>
                <button class="delete-bookmark p-1 bg-red-700 rounded hover:bg-red-600" 
                        data-id="${bookmark.id}">
                    <i class="fas fa-trash-alt text-xs"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Animate the bookmarks after they're added to the DOM
    requestAnimationFrame(() => {
        animateBookmarks();
    });
    
    // Add event listeners to bookmark actions
    document.querySelectorAll('.edit-bookmark').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const bookmarkId = btn.dataset.id;
            editBookmark(bookmarkId);
        });
    });
    
    document.querySelectorAll('.delete-bookmark').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const bookmarkId = btn.dataset.id;
            showConfirmDialog(
                'Delete Bookmark',
                'Are you sure you want to delete this bookmark?',
                () => deleteBookmark(bookmarkId)
            );
        });
    });
    
    // Add click handler for bookmark links to track usage
    document.querySelectorAll('.bookmark-item > a').forEach(link => {
        link.addEventListener('click', (e) => {
            // Don't track if clicking on the delete button
            if (e.target.closest('.delete-bookmark') || e.target.closest('.edit-bookmark')) {
                return;
            }
            
            const bookmarkItem = link.closest('.bookmark-item');
            const bookmarkId = bookmarkItem.dataset.bookmarkId;
            if (bookmarkId) {
                trackBookmarkUsage(bookmarkId);
            }
            
            // Add a visual feedback class
            bookmarkItem.classList.add('clicked');
            setTimeout(() => {
                bookmarkItem.classList.remove('clicked');
            }, 200);
        });
    });
}

// Category modal functions
function openCategoryModal(categoryId = null) {
    editMode.active = !!categoryId;
    editMode.id = categoryId;
    
    if (categoryId) {
        // Edit mode
        const category = dataManager.getCategoryById(categoryId);
        if (category) {
            categoryNameInput.value = category.name;
            document.querySelector('#categoryForm button[type="submit"]').textContent = 'Update Category';
        }
    } else {
        // Add mode
        categoryNameInput.value = '';
        document.querySelector('#categoryForm button[type="submit"]').textContent = 'Add Category';
    }
    
    openModal(categoryModal);
    categoryNameInput.focus();
}

function handleCategorySubmit(e) {
    e.preventDefault();
    const name = categoryNameInput.value.trim();
    
    if (!name) return;
    
    if (editMode.active && editMode.id) {
        // Update existing category
        const success = dataManager.updateCategory(editMode.id, name);
        if (success) {
            closeModal(categoryModal);
            loadCategories();
            loadBookmarks(currentCategoryId);
        }
    } else {
        // Add new category
        const newCategory = dataManager.addCategory(name);
        if (newCategory) {
            closeModal(categoryModal);
            currentCategoryId = newCategory.id;
            loadCategories();
            loadBookmarks(currentCategoryId);
        }
    }
}

// Bookmark modal functions
function openBookmarkModal(bookmarkId = null) {
    // Populate categories dropdown
    const categories = dataManager.getCategories();
    bookmarkCategorySelect.innerHTML = categories.map(cat => 
        `<option value="${cat.id}">${cat.name}</option>`
    ).join('');
    
    editMode.active = !!bookmarkId;
    editMode.id = bookmarkId;
    
    if (bookmarkId) {
        // Edit mode
        const bookmark = dataManager.getBookmarkById(bookmarkId);
        if (bookmark) {
            bookmarkNameInput.value = bookmark.name;
            bookmarkUrlInput.value = bookmark.url;
            bookmarkCategorySelect.value = bookmark.categoryId;
            document.querySelector('#bookmarkForm button[type="submit"]').textContent = 'Update Bookmark';
            document.getElementById('bookmarkModalTitle').textContent = 'Edit Bookmark';
        }
    } else {
        // Add mode
        bookmarkNameInput.value = '';
        bookmarkUrlInput.value = '';
        bookmarkCategorySelect.value = currentCategoryId || (categories[0]?.id || '');
        document.querySelector('#bookmarkForm button[type="submit"]').textContent = 'Add Bookmark';
        document.getElementById('bookmarkModalTitle').textContent = 'Add New Bookmark';
    }
    
    openModal(bookmarkModal);
    bookmarkNameInput.focus();
}

function handleBookmarkSubmit(e) {
    e.preventDefault();
    
    const name = bookmarkNameInput.value.trim();
    const url = bookmarkUrlInput.value.trim();
    const categoryId = bookmarkCategorySelect.value;
    
    if (!name || !url || !categoryId) return;
    
    if (editMode.active && editMode.id) {
        // Update existing bookmark
        const success = dataManager.updateBookmark(editMode.id, { name, url, categoryId });
        if (success) {
            closeModal(bookmarkModal);
            loadBookmarks(currentCategoryId);
        }
    } else {
        // Add new bookmark
        const newBookmark = dataManager.addBookmark(name, url, categoryId);
        if (newBookmark) {
            closeModal(bookmarkModal);
            loadBookmarks(currentCategoryId);
        }
    }
}

function editBookmark(bookmarkId) {
    openBookmarkModal(bookmarkId);
}

function deleteBookmark(bookmarkId) {
    const success = dataManager.deleteBookmark(bookmarkId);
    if (success) {
        loadBookmarks(currentCategoryId);
    }
}

// Confirmation dialog
function showConfirmDialog(title, message, callback) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = callback;
    openModal(confirmModal);
}

// Modal helpers
function openModal(modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    editMode = { active: false, id: null };
    confirmCallback = null;
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    setupImportExport();
});

// Setup import/export functionality
function setupImportExport() {
    const exportBtn = document.getElementById('exportBtn');
    const importFile = document.getElementById('importFile');
    
    // Export functionality
    exportBtn.addEventListener('click', () => {
        const { dataUrl, fileName } = dataManager.exportData();
        
        // Create a temporary link to trigger the download
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(dataUrl);
        }, 0);
    });
    
    // Import functionality
    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const fileContent = event.target.result;
            
            showConfirmDialog(
                'Import Bookmarks',
                'This will replace all your current bookmarks and categories. Are you sure?',
                () => {
                    if (dataManager.importData(fileContent)) {
                        currentCategoryId = null;
                        loadCategories();
                        loadBookmarks();
                        showNotification('Bookmarks imported successfully!');
                    } else {
                        showNotification('Failed to import bookmarks. The file might be corrupted.', 'error');
                    }
                }
            );
        };
        reader.readAsText(file);
        
        // Reset the input so the same file can be imported again
        importFile.value = '';
    });
}

// Start editing a category name
function startEditingCategory(categoryId, tabElement) {
    const category = dataManager.getCategoryById(categoryId);
    if (!category) return;
    
    const nameElement = tabElement.querySelector('.category-name');
    const originalName = category.name;
    
    // Create and style the input field
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalName;
    input.className = 'bg-transparent border-b border-white text-white focus:outline-none focus:border-netflix-red w-full';
    
    // Replace the name with the input field
    nameElement.style.display = 'none';
    tabElement.insertBefore(input, nameElement);
    
    // Focus and select all text
    input.focus();
    input.select();
    
    // Handle Enter key to save
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            saveCategoryEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    };
    
    // Handle click outside to save
    const handleClickOutside = (e) => {
        if (!tabElement.contains(e.target)) {
            saveCategoryEdit();
        }
    };
    
    // Save the edit
    const saveCategoryEdit = () => {
        const newName = input.value.trim();
        
        if (newName && newName !== originalName) {
            const success = dataManager.updateCategory(categoryId, newName);
            if (success) {
                loadCategories();
                loadBookmarks(currentCategoryId);
                showNotification('Category updated');
                return;
            }
        }
        
        // If save failed or name didn't change, revert
        nameElement.style.display = '';
        input.remove();
    };
    
    // Cancel editing
    const cancelEdit = () => {
        nameElement.style.display = '';
        input.remove();
    };
    
    // Add event listeners
    input.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside, { once: true });
    
    // Clean up
    input.addEventListener('blur', () => {
        document.removeEventListener('click', handleClickOutside);
    }, { once: true });
}

// Show a notification
function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
    } text-white flex items-center space-x-2`;
    
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
