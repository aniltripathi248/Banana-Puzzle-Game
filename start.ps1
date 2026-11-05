Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "       Starting Banana Puzzle Game (Full Stack)         " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Yellow

$portOpen = Test-NetConnection -ComputerName 127.0.0.1 -Port 27017 -WarningAction SilentlyContinue
if (-not $portOpen.TcpTestSucceeded) {
    Write-Host "`n[0/2] Starting local MongoDB server..." -ForegroundColor Cyan
    $mongoExe = "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
    if (Test-Path $mongoExe) {
        $dbPath = Join-Path $PSScriptRoot "backend\data\db"
        if (-not (Test-Path $dbPath)) { New-Item -ItemType Directory -Force -Path $dbPath | Out-Null }
        Start-Process $mongoExe -ArgumentList "--dbpath `"$dbPath`" --bind_ip 127.0.0.1 --port 27017" -WindowStyle Minimized
        Start-Sleep -Seconds 2
    }
}

Write-Host "`n[1/2] Starting Backend API on http://localhost:5000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm start"

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting Frontend on http://localhost:3000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start"

Write-Host "`nBoth servers have been launched in separate PowerShell windows!" -ForegroundColor Green
Write-Host "Once loaded, visit: http://localhost:3000" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Yellow
