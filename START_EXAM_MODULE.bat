@echo off
echo ========================================
echo   EXAM SCHEDULE MODULE SETUP
echo ========================================
echo.

echo [1/4] Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend dependencies installation failed!
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
echo.

echo [2/4] Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend dependencies installation failed!
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

echo [3/4] Checking MongoDB Connection...
cd ..\backend
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/school_erp').then(() => { console.log('MongoDB Connected!'); process.exit(0); }).catch(err => { console.error('MongoDB Connection Failed:', err.message); process.exit(1); });"
if %errorlevel% neq 0 (
    echo.
    echo ERROR: MongoDB is not running!
    echo Please start MongoDB service and try again.
    echo.
    echo To start MongoDB:
    echo   net start MongoDB
    echo.
    pause
    exit /b 1
)
echo.

echo [4/4] Starting Servers...
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop the servers
echo.

start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   EXAM SCHEDULE MODULE READY!
echo ========================================
echo.
echo Access the application at: http://localhost:3000
echo.
echo Features:
echo   - Admin: Full exam schedule management
echo   - Staff: Create tests and view exams
echo   - Student: View exams and download hall tickets
echo.
pause
