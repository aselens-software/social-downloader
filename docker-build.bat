@echo off
echo.
echo =========================================
echo Aselens - Docker Build and Run Script
echo =========================================
echo.

echo [1/2] Building Docker image...
docker build -t aselens .
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Docker build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Starting Docker container...
echo (You can access the app at http://localhost:3169^)
echo.
docker run -p 3169:3169 --name aselens -d aselens
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Docker run failed! Did you already have a container named 'aselens'?
    echo If so, you can remove it with: docker rm -f aselens
    pause
    exit /b %errorlevel%
)

echo.
echo =========================================
echo Success! The container is running in the background.
echo To stop the container, run: docker stop aselens
echo To view logs, run: docker logs -f aselens
echo =========================================
pause
