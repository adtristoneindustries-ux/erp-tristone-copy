@echo off
echo ========================================
echo Installing Digital Classroom Dependencies
echo ========================================
echo.

cd frontend
echo Installing react-hot-toast and react-icons...
call npm install react-hot-toast@^2.4.1 react-icons@^4.11.0

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo You can now start the application using FIX_AND_START.bat
echo.
pause
