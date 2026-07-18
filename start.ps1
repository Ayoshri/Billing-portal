# start.ps1 - Run both Backend and Frontend dev servers concurrently
$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

$nodeDestDir = "C:\Users\AYOSHRI DUTTA\.gemini\antigravity\scratch\mern-task-manager\node-v20"

if (-not (Test-Path $nodeDestDir)) {
    Write-Host "Error: Node.js runtime not found at $nodeDestDir" -ForegroundColor Red
    Exit 1
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Starting SaaS Billing Portal Servers..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "1. Launching Backend (Port 5000)..." -ForegroundColor Yellow
Write-Host "2. Launching Frontend Dev (Port 5173)..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Close the popped-up PowerShell windows to stop servers." -ForegroundColor Yellow

# Launch Backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -LiteralPath '$root\backend'; `$env:PATH='$nodeDestDir;' + `$env:PATH; npm run dev"

# Launch Frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -LiteralPath '$root\frontend'; `$env:PATH='$nodeDestDir;' + `$env:PATH; npm run dev"

Write-Host "Dev servers successfully started!" -ForegroundColor Green
