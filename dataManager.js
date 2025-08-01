class DataManager {
    constructor() {
        this.STORAGE_KEY = 'bookmarkManagerData';
        this.data = this.loadData();
        this.initializeDefaultData();
    }

    loadData() {
        const savedData = localStorage.getItem(this.STORAGE_KEY);
        return savedData ? JSON.parse(savedData) : null;
    }

    saveData() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    }

    initializeDefaultData() {
        if (!this.data) {
        this.data = {
        categories: [
            {id:this.generateId(),name:'💼 Work'},
            {id:this.generateId(),name:'💬 Social'},
            {id:this.generateId(),name:'🎮 Entertainment'},
            {id:this.generateId(),name:'📚 Learning'},
            {id:this.generateId(),name:'🛠️ Utilities'}
        ],
        bookmarks: []
        };
        let c=this.data.categories;
        this.data.bookmarks=[
        {id:this.generateId(),name:'GitHub',url:'https://github.com',categoryId:c[0].id},
        {id:this.generateId(),name:'Stack Overflow',url:'https://stackoverflow.com',categoryId:c[0].id},
        {id:this.generateId(),name:'LinkedIn',url:'https://linkedin.com',categoryId:c[0].id},
        {id:this.generateId(),name:'Notion',url:'https://notion.so',categoryId:c[0].id},
        {id:this.generateId(),name:'Slack',url:'https://slack.com',categoryId:c[0].id},
        {id:this.generateId(),name:'Twitter',url:'https://twitter.com',categoryId:c[1].id},
        {id:this.generateId(),name:'Reddit',url:'https://reddit.com',categoryId:c[1].id},
        {id:this.generateId(),name:'Facebook',url:'https://facebook.com',categoryId:c[1].id},
        {id:this.generateId(),name:'Instagram',url:'https://instagram.com',categoryId:c[1].id},
        {id:this.generateId(),name:'Discord',url:'https://discord.com',categoryId:c[1].id},
        {id:this.generateId(),name:'YouTube',url:'https://youtube.com',categoryId:c[2].id},
        {id:this.generateId(),name:'Netflix',url:'https://netflix.com',categoryId:c[2].id},
        {id:this.generateId(),name:'Spotify',url:'https://spotify.com',categoryId:c[2].id},
        {id:this.generateId(),name:'Twitch',url:'https://twitch.tv',categoryId:c[2].id},
        {id:this.generateId(),name:'Hotstar',url:'https://hotstar.com',categoryId:c[2].id},
        {id:this.generateId(),name:'Khan Academy',url:'https://khanacademy.org',categoryId:c[3].id},
        {id:this.generateId(),name:'Coursera',url:'https://coursera.org',categoryId:c[3].id},
        {id:this.generateId(),name:'GeeksforGeeks',url:'https://geeksforgeeks.org',categoryId:c[3].id},
        {id:this.generateId(),name:'W3Schools',url:'https://w3schools.com',categoryId:c[3].id},
        {id:this.generateId(),name:'Google Drive',url:'https://drive.google.com',categoryId:c[4].id}
        ];
        this.saveData();
        }
        }
        

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Category methods
    getCategories() {
        return this.data.categories;
    }

    addCategory(name) {
        const newCategory = {
            id: this.generateId(),
            name: name.trim()
        };
        this.data.categories.push(newCategory);
        this.saveData();
        return newCategory;
    }

    updateCategory(id, newName) {
        const category = this.data.categories.find(cat => cat.id === id);
        if (category) {
            category.name = newName.trim();
            this.saveData();
            return true;
        }
        return false;
    }

    deleteCategory(id) {
        const initialLength = this.data.categories.length;
        this.data.categories = this.data.categories.filter(cat => cat.id !== id);
        
        // Also remove bookmarks in this category
        this.data.bookmarks = this.data.bookmarks.filter(bookmark => bookmark.categoryId !== id);
        
        if (initialLength !== this.data.categories.length) {
            this.saveData();
            return true;
        }
        return false;
    }

    // Track bookmark usage
    incrementUsage(bookmarkId) {
        const bookmark = this.data.bookmarks.find(b => b.id === bookmarkId);
        if (bookmark) {
            // Initialize if not exists
            if (bookmark.usageCount === undefined) {
                bookmark.usageCount = 0;
                bookmark.lastUsed = 0;
            }
            // Increment usage count and update last used timestamp
            bookmark.usageCount++;
            bookmark.lastUsed = Date.now();
            this.saveData();
        }
    }

    // Get most frequently used bookmarks
    getFrequentlyUsed(limit = 6) {
        // Make sure all bookmarks have usage data
        const bookmarksWithUsage = this.data.bookmarks.map(bookmark => ({
            ...bookmark,
            usageCount: bookmark.usageCount || 0,
            lastUsed: bookmark.lastUsed || 0
        }));

        // Sort by usage count (descending), then by last used (newest first)
        return [...bookmarksWithUsage]
            .sort((a, b) => {
                if (b.usageCount !== a.usageCount) {
                    return b.usageCount - a.usageCount;
                }
                return b.lastUsed - a.lastUsed;
            })
            .slice(0, limit);
    }

    // Bookmark methods
    getBookmarks(categoryId = null) {
        if (categoryId) {
            return this.data.bookmarks.filter(bookmark => bookmark.categoryId === categoryId);
        }
        return this.data.bookmarks;
    }

    addBookmark(name, url, categoryId) {
        const newBookmark = {
            id: this.generateId(),
            name: name.trim(),
            url: this.normalizeUrl(url),
            categoryId: categoryId
        };
        this.data.bookmarks.push(newBookmark);
        this.saveData();
        return newBookmark;
    }

    updateBookmark(id, updates) {
        const bookmark = this.data.bookmarks.find(b => b.id === id);
        if (bookmark) {
            if (updates.name) bookmark.name = updates.name.trim();
            if (updates.url) bookmark.url = this.normalizeUrl(updates.url);
            if (updates.categoryId) bookmark.categoryId = updates.categoryId;
            this.saveData();
            return true;
        }
        return false;
    }

    deleteBookmark(id) {
        const initialLength = this.data.bookmarks.length;
        this.data.bookmarks = this.data.bookmarks.filter(bookmark => bookmark.id !== id);
        if (initialLength !== this.data.bookmarks.length) {
            this.saveData();
            return true;
        }
        return false;
    }

    // Helper methods
    normalizeUrl(url) {
        if (!url.match(/^https?:\/\//i)) {
            return 'https://' + url;
        }
        return url;
    }

    getCategoryById(id) {
        return this.data.categories.find(cat => cat.id === id);
    }

    getBookmarkById(id) {
        return this.data.bookmarks.find(bookmark => bookmark.id === id);
    }

    // Export/Import
    exportData() {
        const dataStr = JSON.stringify({
            version: '1.0',
            exportedAt: new Date().toISOString(),
            ...this.data
        }, null, 2);
        
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        return {
            dataStr,
            dataUrl: url,
            fileName: `bookmarks-${new Date().toISOString().split('T')[0]}.json`
        };
    }

    importData(jsonString) {
        try {
            const importedData = JSON.parse(jsonString);
            
            // Handle both old and new format
            const dataToImport = importedData.categories !== undefined ? 
                importedData : 
                { categories: [], bookmarks: [] };
            
            if (Array.isArray(dataToImport.categories) && Array.isArray(dataToImport.bookmarks)) {
                // Clear existing data
                this.data = {
                    categories: [],
                    bookmarks: []
                };
                
                // Import categories
                const categoryMap = {};
                dataToImport.categories.forEach(cat => {
                    const newCategory = this.addCategory(cat.name);
                    categoryMap[cat.id] = newCategory.id;
                });
                
                // Import bookmarks with updated category references
                dataToImport.bookmarks.forEach(bookmark => {
                    const categoryId = categoryMap[bookmark.categoryId] || null;
                    this.addBookmark(bookmark.name, bookmark.url, categoryId);
                });
                
                return true;
            }
        } catch (e) {
            console.error('Failed to import data:', e);
        }
        return false;
    }
}

// Initialize a global instance
const dataManager = new DataManager();
