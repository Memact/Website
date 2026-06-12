@echo off
setlocal
title Memact Local Run

cd /d "%~dp0"

echo.
echo ========================================
echo  Memact Local Run
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 20+ first.
  echo.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Install Node.js 20+ first.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing root workspace dependencies...
  call npm install
  if errorlevel 1 goto :fail
)

if not exist "capture\node_modules" (
  echo Installing Capture dependencies...
  call npm --prefix capture install
  if errorlevel 1 goto :fail
)

if not exist "interface\node_modules" (
  echo Installing Website dependencies...
  call npm --prefix interface install
  if errorlevel 1 goto :fail
)

echo.
echo Starting Memact Capture Helper...
start "Memact Capture Helper" cmd /k "cd /d %~dp0 && npm run capture:helper"

echo.
echo Starting Memact Website...
echo.
echo Vite will print the local URL below.
echo Usually: http://localhost:5173/
echo.

call npm run dev
goto :end

:fail
echo.
echo Memact could not start. Check the error above.
echo.
pause
exit /b 1

:end
echo.
echo Memact stopped.
echo.
pause
