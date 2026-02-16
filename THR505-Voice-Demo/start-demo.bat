@echo off
echo ============================================
echo  THR505 Voice Demo - Startup Script
echo ============================================
echo.

:: Resolve the folder where this .bat file lives (works from any location)
set "ROOT=%~dp0"

:: Kill any existing node processes
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: Start server in new window
start "THR505 Server" cmd /k "cd /d "%ROOT%server" && npm run dev"

:: Wait for server to start
timeout /t 3 /nobreak >nul

:: Start client in new window
start "THR505 Client" cmd /k "cd /d "%ROOT%client" && npm run dev"

echo.
echo Both servers starting in separate windows.
echo Server: http://localhost:3001
echo Client: http://localhost:5173
echo.
echo Once both windows show "ready", open http://localhost:5173 in Edge or Chrome.
echo.
pause
