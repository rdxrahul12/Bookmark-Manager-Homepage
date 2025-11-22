# 🚀 Release Checklist for Developers

## Before Creating a Release

### 1. Update Version
- [ ] Update version in `manifest.json`
- [ ] Update version in README if mentioned

### 2. Test Everything
- [ ] Test on fresh Chrome install
- [ ] Test all drag-drop functionality
- [ ] Test light/dark mode toggle
- [ ] Test import/export
- [ ] Test with empty data
- [ ] Test with lots of bookmarks

### 3. Clean the Project
```powershell
# Remove development files
Remove-Item -Recurse -Force .git, node_modules, .vscode -ErrorAction SilentlyContinue
Remove-Item -Force .gitignore, package*.json, *.log -ErrorAction SilentlyContinue
```

### 4. Create ZIP Package
```powershell
# From project root
Compress-Archive -Path * -DestinationPath bookmark-manager-extension.zip -Force
```

## Creating GitHub Release

1. Go to repository → Releases → "Draft a new release"
2. **Tag version**: `v1.0.0` (follow semantic versioning)
3. **Release title**: `Bookmark Manager v1.0.0`
4. **Description**: Include:
   - What's new
   - Bug fixes
   - Installation instructions link
5. **Attach files**: Upload `bookmark-manager-extension.zip`
6. Click **"Publish release"**

## Post-Release

- [ ] Test download link works
- [ ] Update README with latest version number
- [ ] Announce on social media (if applicable)
- [ ] Monitor GitHub issues for bug reports

## Files to Include in ZIP

✅ Required:
- `manifest.json`
- `index.html`
- `app.js`
- `dataManager.js`
- `styles.css`
- `sw.js`
- Icon files (if you have them)

❌ Exclude:
- `.git/`
- `node_modules/`
- `.gitignore`
- `package.json`
- `README.md` (optional, but users won't need it)
- Development/build files
