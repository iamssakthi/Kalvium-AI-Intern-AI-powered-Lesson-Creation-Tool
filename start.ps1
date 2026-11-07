# ==============================================================================
# AI-Powered Lesson Creation & Research Platform
# Startup script for Windows PowerShell (runs both Backend & Frontend)
# ==============================================================================

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   AI-Powered Lesson Creation Platform -- Launcher" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

$ROOT_DIR = $PSScriptRoot
$BACKEND_DIR = Join-Path $ROOT_DIR "backend"
$FRONTEND_DIR = Join-Path $ROOT_DIR "frontend"

# Check for .env file
if (-not (Test-Path (Join-Path $ROOT_DIR ".env"))) {
    Write-Host "[!] .env file not found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item (Join-Path $ROOT_DIR ".env.example") (Join-Path $ROOT_DIR ".env")
}

# 1. Start Backend in separate window
Write-Host "`n[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
$backendCmd = "`$env:PYTHONPATH='$BACKEND_DIR'; python -m uvicorn app.main:app --app-dir '$BACKEND_DIR' --host 127.0.0.1 --port 8000 --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

# 2. Start Frontend in separate window
Write-Host "[2/2] Starting React Vite Frontend on http://localhost:5173 ..." -ForegroundColor Green
$frontendCmd = "cd '$FRONTEND_DIR'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Start-Sleep -Seconds 2

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "   Application is Live in 2 new windows!" -ForegroundColor Green
Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   - Backend:  http://127.0.0.1:8000" -ForegroundColor White
Write-Host "   - Swagger:  http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
