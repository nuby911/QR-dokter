@echo off
title MediQR - Terminal Peresepan Dokter
cd /d "%~dp0"
echo ======================================================================
echo           MediQR - Membuka Aplikasi Desktop Dokter (Mode Offline)
echo ======================================================================
call npx electron electron/main.js
