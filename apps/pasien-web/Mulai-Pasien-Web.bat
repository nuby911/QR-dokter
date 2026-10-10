@echo off
title MediQR Pasien - Portal Resep Web
cd /d "%~dp0"
echo ========================================================
echo   MEDIQR PASIEN - PORTAL WEB RESEP DIGITAL
echo   Port: 3000 ^| Mode Pasien Saja
echo ========================================================
echo.
if not exist node_modules (
  echo [Info] Menyiapkan dependensi lokal...
  call npm install
)
echo [Info] Menjalankan Web Server Pasien di http://localhost:3000 ...
start http://localhost:3000
call npm run dev
