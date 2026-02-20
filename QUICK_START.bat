@echo off
echo ========================================
echo School ERP System - Quick Start
echo ========================================
echo.

echo Checking if MongoDB is running...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MongoDB is running
) else (
    echo ❌ MongoDB is not running
    echo Starting MongoDB...
    net start MongoDB
    if errorlevel 1 (
        echo ❌ Failed to start MongoDB. Please start it manually.
        pause
        exit /b 1
    )
    echo ✅ MongoDB started successfully
)

echo.
echo Installing backend dependencies...
cd backend
if not exist node_modules (
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
)

echo.
echo Seeding database with sample data...
node seed.js
if errorlevel 1 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)

echo.
echo Starting backend server...
start "Backend Server" cmd /k "npm run dev"

echo.
echo Installing frontend dependencies...
cd ..\frontend
if not exist node_modules (
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting frontend server...
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo ✅ School ERP System is starting up!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Demo Credentials:
echo Admin: admin@school.com / admin123
echo Staff: staff@school.com / staff123  
echo Student: student@school.com / student123
echo.
echo Press any key to exit this window...
pause > nul