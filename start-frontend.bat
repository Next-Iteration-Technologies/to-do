@echo off
REM Script to start the Angular frontend

echo Starting Angular Frontend...
echo.

REM Get the directory where this script is located
cd /d "%~dp0"

REM Check if port 4200 is in use and kill the process
echo Checking if port 4200 is available...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4200" ^| findstr "LISTENING"') do (
    echo Port 4200 is already in use. Stopping existing process with PID %%a...
    taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)

REM Navigate to frontend directory
if not exist "frontend" (
    echo ERROR: frontend directory not found!
    pause
    exit /b 1
)

cd frontend

REM Check if Node.js and npm are installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH!
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules\" (
    echo Installing dependencies...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
)

REM Check if Angular CLI is available
where ng >nul 2>&1
if %errorlevel% neq 0 (
    echo Angular CLI not found globally. Using npx...
    call npx ng serve
) else (
    echo Starting Angular dev server...
    echo.
    call ng serve
)

REM Pause if there's an error
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start frontend!
    pause
)
