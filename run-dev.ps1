<#
run-dev.ps1

Helper script to install dependencies, ensure `.env.local` exists,
warn if the GEMINI API key is a placeholder, and start the dev server.

Usage (PowerShell):
  .\run-dev.ps1
#>

Set-StrictMode -Version Latest

$projectRoot = Split-Path -Path $PSScriptRoot -Parent | ForEach-Object { if ($_ -eq $null -or $_ -eq '') { Get-Location } else { $_ } }
if (-not $projectRoot) { $projectRoot = Get-Location }
Set-Location -Path $PSScriptRoot

Write-Host "Project folder: $PWD"

Write-Host "Checking Node.js..."
try {
    $nodeVer = & node -v 2>$null
    if ($LASTEXITCODE -ne 0) { throw }
    Write-Host "Found Node: $nodeVer"
} catch {
    Write-Error "Node.js not found in PATH. Install Node.js (LTS) from https://nodejs.org/ before continuing."
    exit 1
}

if (-not (Test-Path -Path "package.json")) {
    Write-Error "package.json not found in this folder. Run this script from the project root."
    exit 1
}

Write-Host "Installing dependencies (this may take a minute)..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm install failed. Check the output above for errors."
    exit $LASTEXITCODE
}

$envFile = Join-Path $PSScriptRoot ".env.local"
$envExample = Join-Path $PSScriptRoot ".env.local.example"
if (-not (Test-Path -Path $envFile)) {
    if (Test-Path -Path $envExample) {
        Copy-Item -Path $envExample -Destination $envFile
        Write-Host "Copied .env.local.example -> .env.local. Please set your real API key in .env.local before deploying."
    } else {
        Write-Warning ".env.local.example not found. Create .env.local with GEMINI_API_KEY before running."
    }
}

# Check for placeholder API key
$placeholder = 'your_gemini_api_key_here'
try {
    $envContent = Get-Content -Path $envFile -Raw -ErrorAction Stop
    if ($envContent -match [regex]::Escape($placeholder)) {
        Write-Warning ".env.local contains placeholder GEMINI API key. Open .env.local and replace the placeholder with your real key."
        Read-Host "Press Enter to continue after updating .env.local (or Ctrl+C to abort)"
    }
} catch {
    # file may not exist; ignore
}

Write-Host "Starting dev server (npm run dev). Press Ctrl+C to stop."
npm run dev
