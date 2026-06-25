<#
push-to-github.ps1

Initialize git repo, commit all changes, and push to GitHub.

Usage:
  .\push-to-github.ps1

The script will prompt for your GitHub repo URL (e.g., https://github.com/username/repo.git).
#>

Set-StrictMode -Version Latest

Write-Host "Git Sync to GitHub"
Write-Host "=================="
Write-Host ""

# Check if git is available
try {
    $gitVersion = & git --version 2>$null
    if ($LASTEXITCODE -ne 0) { throw }
    Write-Host "Found: $gitVersion"
} catch {
    Write-Error "Git not found in PATH. Install Git (https://git-scm.com/) and add it to PATH before running this script."
    exit 1
}

$repoUrl = Read-Host "Enter your GitHub repo URL (e.g., https://github.com/username/promptqi.git)"

if (-not $repoUrl) {
    Write-Error "Repo URL is required."
    exit 1
}

Write-Host ""
Write-Host "Step 1: Initialize git repo (if not already)..."
if (-not (Test-Path -Path '.git')) {
    & git init
    Write-Host "Git repo initialized."
} else {
    Write-Host "Git repo already initialized."
}

Write-Host ""
Write-Host "Step 2: Add remote origin..."
$remoteExists = & git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Remote already set to: $remoteExists"
    $updateRemote = Read-Host "Update remote to $repoUrl ? (y/n)"
    if ($updateRemote -eq 'y') {
        & git remote set-url origin $repoUrl
        Write-Host "Remote updated."
    }
} else {
    & git remote add origin $repoUrl
    Write-Host "Remote added."
}

Write-Host ""
Write-Host "Step 3: Stage all changes..."
& git add .
Write-Host "All files staged."

Write-Host ""
Write-Host "Step 4: Commit changes..."
$commitMessage = Read-Host "Enter commit message (default: 'chore: sync project to GitHub')"
if (-not $commitMessage) {
    $commitMessage = "chore: sync project to GitHub"
}
& git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nothing to commit or commit failed."
}

Write-Host ""
Write-Host "Step 5: Push to GitHub..."
Write-Host "Pushing to $repoUrl on branch 'main'..."
& git branch -M main
& git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Success! Your code is now on GitHub."
    Write-Host "Repository: $repoUrl"
} else {
    Write-Host ""
    Write-Error "Push failed. Check your credentials and repo URL."
    exit 1
}
