#!/usr/bin/env bash

# ==============================================================================
# AI-Powered Lesson Creation & Research Platform
# Startup script for Linux/macOS/Git Bash (runs both Backend & Frontend)
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}   AI-Powered Lesson Creation Platform — Launcher           ${NC}"
echo -e "${BLUE}============================================================${NC}"

# Check for .env file
if [ ! -f "$ROOT_DIR/.env" ]; then
    echo -e "${YELLOW}[!] .env file not found. Copying from .env.example...${NC}"
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
fi

# Cleanup child processes on exit (Ctrl+C)
cleanup() {
    echo -e "\n${YELLOW}[!] Shutting down backend and frontend processes...${NC}"
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    echo -e "${GREEN}[✓] All services stopped cleanly.${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start FastAPI Backend
echo -e "\n${GREEN}[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...${NC}"
export PYTHONPATH="$BACKEND_DIR"

if command -v python3 &>/dev/null; then
    PY_CMD="python3"
elif command -v python &>/dev/null; then
    PY_CMD="python"
else
    echo -e "${RED}[✗] Python not found. Please install Python 3.10+${NC}"
    exit 1
fi

$PY_CMD -m uvicorn app.main:app --app-dir "$BACKEND_DIR" --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!
echo -e "${GREEN}[✓] Backend running (PID: $BACKEND_PID)${NC}"

# Wait 2 seconds for backend to initialize
sleep 2

# 2. Start Vite/React Frontend
echo -e "\n${GREEN}[2/2] Starting Vite React Frontend on http://localhost:5173 ...${NC}"
cd "$FRONTEND_DIR"

if ! command -v npm &>/dev/null; then
    echo -e "${RED}[✗] npm not found. Please install Node.js and npm.${NC}"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}[!] Installing frontend dependencies with npm install...${NC}"
    npm install
fi

npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}[✓] Frontend running (PID: $FRONTEND_PID)${NC}"

echo -e "\n${BLUE}============================================================${NC}"
echo -e "${GREEN}   Application is Live!${NC}"
echo -e "   👉 Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "   👉 Backend:  ${BLUE}http://127.0.0.1:8000${NC}"
echo -e "   👉 Swagger:  ${BLUE}http://127.0.0.1:8000/docs${NC}"
echo -e "${BLUE}============================================================${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers at any time.${NC}\n"

# Keep script running and wait for background jobs
wait $BACKEND_PID $FRONTEND_PID
