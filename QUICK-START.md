# 🚀 Quick Start - Install Bookmark Manager Extension

## For Users: 3 Simple Steps

### Step 1: Download
1. Download `bookmark-manager-extension.zip` from this repository
2. Extract it to a permanent folder (e.g., `C:\BookmarkManager`)
   - ⚠️ **Important**: Don't delete this folder after installation!

### Step 2: Open Chrome Extensions
1. Open Google Chrome
2. Type `chrome://extensions/` in the address bar and press Enter
3. Turn ON **"Developer mode"** (toggle switch in top-right corner)

### Step 3: Load Extension
1. Click the **"Load unpacked"** button
2. Browse to the folder where you extracted the files
3. Click **"Select Folder"**
4. Done! ✅

### Verify It Works
- Open a **new tab** - you should see the Bookmark Manager
- Click the theme toggle button (next to title) to test light/dark mode
- Try adding a bookmark!

---

## For Developers: Create Release Package

### Quick Package
```powershell
# Create package folder
mkdir extension-package

# Copy required files
Copy-Item manifest.json,index.html,app.js,dataManager.js,styles.css,sw.js extension-package\

# Create ZIP
Compress-Archive -Path extension-package\* -DestinationPath bookmark-manager-extension.zip -Force

# Cleanup
Remove-Item -Recurse extension-package
```

### Upload to GitHub Releases
1. Go to your repo → **Releases** → **"Draft a new release"**
2. **Tag**: `v2.0.0` (or your version)
3. **Title**: `Bookmark Manager v2.0.0`
4. **Upload**: `bookmark-manager-extension.zip`
5. **Description**: Copy the installation steps above
6. Click **"Publish release"**

---

## Troubleshooting

### Extension not loading?
- Make sure you extracted the ZIP (don't load the ZIP directly)
- Check that all 6 files are in the folder
- Try restarting Chrome

### New tab not showing?
- Disable other new tab extensions
- Click the refresh icon on the extension card
- Restart Chrome

### Lost your bookmarks?
- Check `chrome://extensions/` - is the extension still enabled?
- Your data is in localStorage - it persists unless you clear browser data

---

## Features

- 🎯 **Drag & Drop**: Move bookmarks or drag browser tabs to add
- 🌓 **Light/Dark Mode**: Beautiful rose-tinted light theme
- 🎨 **Smart Icons**: Auto-generated fallback icons
- 💾 **Offline**: Works without internet
- 🔄 **Import/Export**: Backup your bookmarks
- 🔒 **Private**: No tracking, all data stays local

---

## Need Help?

- **Issues**: [Report a bug](https://github.com/rdxrahul12/Bookmark-Manager-Homepage/issues)
- **Source**: [View code](https://github.com/rdxrahul12/Bookmark-Manager-Homepage)
