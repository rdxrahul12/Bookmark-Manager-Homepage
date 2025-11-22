Write-Host "Bookmark Manager Extension Packager" -ForegroundColor Cyan
Write-Host ""

# Get version from manifest
$manifest = Get-Content "manifest.json" | ConvertFrom-Json
$version = $manifest.version
Write-Host "Packaging version: $version" -ForegroundColor Green

# Create temp directory
$tempDir = "temp-build"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Copy files
$files = @("manifest.json", "index.html", "app.js", "dataManager.js", "styles.css", "sw.js")
foreach ($file in $files) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $tempDir
        Write-Host "Copied: $file"
    }
}

# Create ZIP
$zipName = "bookmark-manager-v$version.zip"
if (Test-Path $zipName) { Remove-Item $zipName -Force }
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipName

# Cleanup
Remove-Item -Recurse -Force $tempDir

Write-Host ""
Write-Host "Success! Created: $zipName" -ForegroundColor Green
Write-Host "Size: $([math]::Round((Get-Item $zipName).Length / 1KB, 2)) KB"
