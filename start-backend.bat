@echo off
REM Script to start the Spring Boot backend

echo Starting Spring Boot Backend...
echo.

REM Get the directory where this script is located
cd /d "%~dp0"

REM Check if port 8080 is in use and kill the process
echo Checking if port 8080 is available...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
    echo Port 8080 is already in use. Stopping existing process with PID %%a...
    taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)

REM Navigate to backend directory
if not exist "backend" (
    echo ERROR: backend directory not found!
    pause
    exit /b 1
)

cd backend

REM Check if Maven is installed
where mvn >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Maven is not installed or not in PATH!
    echo Please install Maven and add it to your system PATH.
    pause
    exit /b 1
)

REM Start Spring Boot
echo Starting Maven...
echo.
call mvn spring-boot:run

REM Pause if there's an error
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start backend!
    pause
)
