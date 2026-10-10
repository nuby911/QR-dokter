@echo off
title MediQR - Sistem Resep & Apotek Mandiri
echo ======================================================================
echo                MediQR - Memulai Sistem di Komputer Anda
echo ======================================================================
cd /d "%~dp0"
echo Membuka Portal Dokter...
start "" http://localhost:3000/doctor
call npm run dev
