@echo off
title MediQR Dokter - Aplikasi Peresepan Medis Offline
cd /d "%~dp0"
echo ========================================================
echo   MEDIQR DOKTER - TERMINAL PERESEPAN OFFLINE
echo   Port: 3001 ^| Ed25519 Standalone
echo ========================================================
echo.
if not exist node_modules (
  echo [Info] Menyiapkan dependensi lokal...
  call npm install
)
echo [Info] Menjalankan Aplikasi Desktop Dokter...
call npx electron electron/main.js
