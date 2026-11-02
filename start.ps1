Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "       Starting Banana Puzzle Game (Full Stack)         " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Yellow

Write-Host "`n[1/2] Starting Backend API on http://localhost:5000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm start"

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting Frontend on http://localhost:3000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start"

Write-Host "`nBoth servers have been launched in separate PowerShell windows!" -ForegroundColor Green
Write-Host "Once loaded, visit: http://localhost:3000" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Yellow

