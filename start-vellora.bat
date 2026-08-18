@echo off
setlocal
title Vellora Startup Launcher
cd /d "%~dp0"

echo.
echo   ====================================================
echo                 VELLORA LOCAL LAUNCHER
echo   ====================================================
echo   Starting Vellora (Frontend + Backend)...
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo   Node.js was not found on this computer.
  echo   Vellora needs Node.js to run. Install it from: https://nodejs.org
  echo.
  pause
  exit /b 1
)

echo   [1/4] Running setup and database environment check...
node setup-check.cjs
if %errorlevel% neq 0 (
  echo   Setup check warning encountered, continuing...
)

echo   [2/4] Checking and installing frontend dependencies...
if not exist "node_modules" (
  call npm install
) else (
  echo   Frontend dependencies ready.
)

echo   [3/4] Checking and installing backend dependencies...
if not exist "backend\node_modules" (
  call npm run backend:install
) else (
  echo   Backend dependencies ready.
)

echo   [4/4] Syncing database schema and generating client...
set DATABASE_URL=postgresql://postgres.mjbwtydobpjvsnwacfaf:9j9KjVUzDvcHPLr2@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
call npx --prefix backend prisma db push --schema=backend/prisma/schema.prisma
call npx --prefix backend prisma generate --schema=backend/prisma/schema.prisma

echo.
echo   ====================================================
echo   🚀 Starting Vellora Dev Servers...
echo   Frontend: http://localhost:5173 (or http://localhost:5174)
echo   Backend:  http://localhost:4000
echo   ====================================================
echo.

call npm run dev:all
if %errorlevel% neq 0 (
  echo.
  echo   Vellora stopped.
  pause
  exit /b 1
)

pause
