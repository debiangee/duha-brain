@echo off
REM Duha Brain - Start Script
REM Starts backend + serves frontend

echo Starting Duha Brain...
echo.
echo Frontend: http://localhost:8080
echo API: http://localhost:8080/api/v1
echo.
echo To stop, close this window or press Ctrl+C
echo.

REM Start backend (it serves the frontend too)
.\bin\duha-brain.exe

pause
