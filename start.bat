@echo off
title Banana Puzzle Game Launcher
echo ========================================================
echo        Starting Banana Puzzle Game (Full Stack)
echo ========================================================
echo.

rem Check if MongoDB is already listening on port 27017
netstat -ano | findstr 27017 >nul
if %errorlevel% neq 0 (
    echo [0/2] Starting local MongoDB server...
    if not exist "%~dp0backend\data\db" mkdir "%~dp0backend\data\db"
    if exist "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" (
        start "MongoDB Server" /min "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "%~dp0backend\data\db" --bind_ip 127.0.0.1 --port 27017
        timeout /t 2 /nobreak >nul
    )
)

echo [1/2] Starting Backend API on http://localhost:5000 ...
start "Banana Backend (Port 5000)" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend on http://localhost:3000 ...
start "Banana Frontend (Port 3000)" cmd /k "cd frontend && npm start"

echo.
echo Both servers have been launched in separate windows!
echo Once the frontend compiles, open: http://localhost:3000
echo ========================================================
