@echo off
echo Starting THR505 Demo servers...
echo.

:: Kill any existing node processes
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: Start server in new window
start "THR505 Server" cmd /k "cd /d C:\Demos\THR505-Voice-Demo\server && npm run dev"

:: Wait for server to start
timeout /t 3 /nobreak >nul

:: Start client in new window  
start "THR505 Client" cmd /k "cd /d C:\Demos\THR505-Voice-Demo\client && npm run dev"

echo.
echo Both servers starting in separate windows.
echo Server: http://localhost:3001
echo Client: http://localhost:5173
echo.
pause
