@echo off
REM ==============================================================================
REM AI-Powered Lesson Creation & Research Platform
REM Double-click or run from CMD / PowerShell
REM ==============================================================================

echo ============================================================
echo    AI-Powered Lesson Creation Platform -- Launcher (Batch)
echo ============================================================

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"

if not exist "%ROOT_DIR%.env" (
    echo [!] .env file not found. Copying from .env.example...
    copy "%ROOT_DIR%.env.example" "%ROOT_DIR%.env"
)

echo.
echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Backend - FastAPI" cmd /k "cd /d %BACKEND_DIR% && set PYTHONPATH=%BACKEND_DIR% && python -m uvicorn app.main:app --app-dir %BACKEND_DIR% --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting React Vite Frontend on http://localhost:3001 ...
start "Frontend - Vite React" cmd /k "cd /d %FRONTEND_DIR% && npm run dev"

echo.
echo ============================================================
echo    Application is Live in 2 new windows!
echo    - Frontend: http://localhost:3001
echo    - Backend:  http://127.0.0.1:8000
echo    - Swagger:  http://127.0.0.1:8000/docs
echo ============================================================
