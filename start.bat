@echo off
title Banana Puzzle Game Launcher
echo ========================================================
echo        Starting Banana Puzzle Game (Full Stack)
echo ========================================================
echo.

echo [1/2] Starting Backend API on http://localhost:5000 ...
start "Banana Backend (Port 5000)" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend on http://localhost:3000 ...
start "Banana Frontend (Port 3000)" cmd /k "cd frontend && npm start"

echo.
echo Both servers have been launched in separate windows!
echo Once the frontend compiles, open: http://localhost:3000
echo ========================================================

