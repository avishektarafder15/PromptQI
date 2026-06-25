<#
deploy-vercel.ps1

Runs a non-interactive Vercel production deploy using a Vercel token from
the environment variable `VERCEL_TOKEN`. DO NOT put tokens in files or chat.

Usage (PowerShell):
  $env:VERCEL_TOKEN = 'your_token_here'
  .\deploy-vercel.ps1

This script will exit with an error if `VERCEL_TOKEN` is not set.
#>

Set-StrictMode -Version Latest

if (-not $env:VERCEL_TOKEN) {
    Write-Error "Environment variable VERCEL_TOKEN is not set. Create a token at https://vercel.com/account/tokens and set it in the current shell before running this script."
    exit 1
}

Write-Host "Using VERCEL_TOKEN from environment. Starting non-interactive deploy..."

# Use npx.cmd to avoid PowerShell execution policy blocking the .ps1 shim
& npx.cmd vercel --prod --token $env:VERCEL_TOKEN --confirm
