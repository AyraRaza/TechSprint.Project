@echo off
REM Firebase Storage CORS Configuration Setup Script for Windows

echo.
echo ========================================
echo Firebase Storage CORS Setup
echo ========================================
echo.

REM Check if gsutil is installed
gsutil --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: gsutil not found!
    echo.
    echo Please install Google Cloud SDK first:
    echo 1. Download from: https://cloud.google.com/sdk/docs/install
    echo 2. Run the installer
    echo 3. Initialize with: gcloud init
    echo 4. Authenticate with your Google account
    echo 5. Run this script again
    echo.
    pause
    exit /b 1
)

echo gsutil found. Configuring CORS...
echo.

REM Apply CORS configuration to Firebase Storage bucket
echo Applying CORS configuration to bucket: prepbot-f9916.appspot.com
gsutil cors set cors.json gs://prepbot-f9916.appspot.com

if %errorlevel% equ 0 (
    echo.
    echo ✓ CORS configuration applied successfully!
    echo.
    echo Your Firebase Storage bucket is now configured for local development.
    echo You can now upload files from:
    echo   - http://localhost:5173
    echo   - http://localhost:8080
    echo.
) else (
    echo.
    echo ERROR: Failed to apply CORS configuration!
    echo Please check your Google Cloud SDK authentication.
    echo.
)

pause
