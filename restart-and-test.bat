@echo off
echo ========================================
echo SIBMO API - Restart and Test Script
echo ========================================
echo.

echo Step 1: Stopping current server (PID: 11024)...
taskkill /PID 11024 /F
timeout /t 2 /nobreak >nul

echo.
echo Step 2: Starting server...
start "SIBMO Server" cmd /k "npm run start:dev"

echo.
echo Waiting for server to start (15 seconds)...
timeout /t 15 /nobreak

echo.
echo Step 3: Running comprehensive tests...
node test-all-endpoints.mjs

echo.
echo ========================================
echo Testing complete!
echo Check test-results-comprehensive.json for detailed results
echo ========================================
pause
