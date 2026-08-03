param(
    [string]$ApiUrl = "https://sacco-backend.onrender.com"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontend = Join-Path $root "frontend"
$outDir = Join-Path $root ".deploy"
$dist = Join-Path $frontend "dist"

Push-Location $frontend
try {
    if (-not (Test-Path "node_modules")) { npm install }
    $env:VITE_API_URL = $ApiUrl
    npm run build
} finally {
    Pop-Location
}

$htaccess = @'
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
'@
Set-Content -LiteralPath (Join-Path $dist ".htaccess") -Value $htaccess -Encoding ASCII

if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
$zip = Join-Path $outDir "sacco-frontend.zip"
if (Test-Path $zip) { Remove-Item -LiteralPath $zip }
Compress-Archive -Path (Join-Path $dist "*") -DestinationPath $zip

Write-Host ""
Write-Host "Built frontend with VITE_API_URL=$ApiUrl"
Write-Host "Package: $zip"
Write-Host "Upload the CONTENTS of this zip to htdocs/sacco/ (InfinityFree File Manager)."
