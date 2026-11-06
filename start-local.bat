@echo off
setlocal
chcp 65001 >nul
title Ardena Playground - Local Studio Runner

cls
echo =====================================================================
echo          🎮 ARDENA PLAYGROUND — LOCAL STUDIO LAUNCHER
echo      Platform Pemrograman Visual Scratch 3.0 & AI Copilot
echo =====================================================================
echo.

:: 1. Verifikasi instalasi Node.js dan NPM
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js tidak ditemukan di sistem Anda!
    echo Silakan unduh dan pasang Node.js LTS terlebih dahulu: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Pastikan dependensi terpasang jika belum ada
if not exist "node_modules\" (
    echo [Setup] Menginstal dependensi root...
    call npm install
)
if not exist "backend\node_modules\" (
    echo [Setup] Menginstal dependensi backend...
    cd backend && call npm install && cd ..
)
if not exist "frontend\node_modules\" (
    echo [Setup] Menginstal dependensi frontend...
    cd frontend && call npm install && cd ..
)

echo  [1/3] Backend Service  : Menyalakan Express API di http://localhost:3001
echo  [2/3] Frontend Studio  : Menyalakan React/Vite di http://localhost:3000
echo  [3/3] Browser Launcher : Otomatis membuka peramban ke http://localhost:3000
echo.
echo =====================================================================
echo  💡 CARA MENGHENTIKAN:
echo     Cukup tekan [CTRL + C] di jendela terminal ini, lalu ketik 'Y'
echo =====================================================================
echo.

:: Tunggu 3 detik di background lalu buka browser otomatis
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

:: Jalankan kedua server secara bersamaan via npm run dev
npm run dev
