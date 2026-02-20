@echo off
echo Starting School ERP with Fresh Authentication State...
echo.

REM Clear any existing authentication state
echo Clearing browser storage...
echo.

REM Start the backend
echo Starting backend server...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start the frontend
echo Starting frontend server...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo To force clear authentication, visit: http://localhost:3000/login?clearAuth=true
echo.
pause