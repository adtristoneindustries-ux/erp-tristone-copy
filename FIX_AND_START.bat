@echo off
echo ========================================
echo    SCHOOL ERP SYSTEM - AUTO FIX & START
echo ========================================
echo.

:: Check if MongoDB is running
echo [1/6] Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MongoDB is running
) else (
    echo ❌ MongoDB is not running. Starting MongoDB...
    net start MongoDB 2>NUL
    if errorlevel 1 (
        echo ⚠️  Could not start MongoDB service. Please start it manually.
        echo    Run: net start MongoDB
        pause
        exit /b 1
    )
    echo ✅ MongoDB started
)

:: Install backend dependencies
echo.
echo [2/6] Installing backend dependencies...
cd /d "%~dp0backend"
if not exist node_modules (
    echo Installing backend packages...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Backend dependencies already installed
)

:: Install frontend dependencies
echo.
echo [3/6] Installing frontend dependencies...
cd /d "%~dp0frontend"
if not exist node_modules (
    echo Installing frontend packages...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Frontend dependencies already installed
)

:: Seed database
echo.
echo [4/6] Setting up database...
cd /d "%~dp0backend"
echo Seeding database with sample data...
node seed.js
if errorlevel 1 (
    echo ⚠️  Database seeding had issues, but continuing...
) else (
    echo ✅ Database seeded successfully
)

:: Start backend server
echo.
echo [5/6] Starting backend server...
start "ERP Backend" cmd /k "cd /d %~dp0backend && echo Starting backend server on port 5000... && npm run dev"
timeout /t 3 /nobreak >nul

:: Start frontend server
echo.
echo [6/6] Starting frontend server...
start "ERP Frontend" cmd /k "cd /d %~dp0frontend && echo Starting frontend server on port 3000... && npm run dev"

echo.
echo ========================================
echo    🚀 SCHOOL ERP SYSTEM STARTED!
echo ========================================
echo.
echo ✅ Backend: http://localhost:5000
echo ✅ Frontend: http://localhost:3000
echo.
echo 🔑 Demo Credentials:
echo    Admin:   admin@school.com   / admin123
echo    Staff:   staff@school.com   / staff123
echo    Student: student@school.com / student123
echo.
echo ⏳ Waiting for servers to start...
timeout /t 5 /nobreak >nul
echo.
echo 🌐 Opening application in browser...
start http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul