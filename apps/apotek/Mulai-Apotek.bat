@echo off
title MediQR Apotek - Aplikasi Kasir Desktop Mandiri
cd /d "%~dp0"
echo ========================================================
echo   MEDIQR APOTEK - APLIKASI DESKTOP KASIR ^& INVENTARIS
echo   Mode: Desktop App (.app) ^| Port 3003
echo ========================================================
echo.
if not exist node_modules (
  echo [Info] Menyiapkan dependensi lokal...
  call npm install
)
echo [Info] Membuka Aplikasi Desktop Kasir Apotek...
call npx electron electron/main.js
