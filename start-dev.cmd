@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"

start "Key Craft API" cmd /k "cd /d "%~dp0server" && npm.cmd start"
start "Key Craft Web" cmd /k "cd /d "%~dp0" && npm.cmd start"
timeout /t 2 /nobreak >nul
start "" "http://localhost:5173/"
