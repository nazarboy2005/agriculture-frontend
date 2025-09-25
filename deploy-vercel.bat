@echo off
echo ========================================
echo   Agriculture Frontend - Vercel Deploy
echo ========================================

echo.
echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Testing build locally...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed locally
    pause
    exit /b 1
)

echo.
echo ✅ Local build successful!
echo.
echo Next steps:
echo 1. Go to Vercel Dashboard
echo 2. Set these environment variables:
echo    - REACT_APP_API_BASE_URL = https://agriculture-backend-production.railway.app/api
echo    - REACT_APP_GOOGLE_CLIENT_ID = 1077945709935-l5tcsn6el2b1rqh51l229aja2klio170.apps.googleusercontent.com
echo    - GENERATE_SOURCEMAP = false
echo    - NODE_ENV = production
echo 3. Trigger a new deployment
echo.
echo Your frontend should be available at:
echo https://agriculture-frontend-two.vercel.app/
echo.
pause
