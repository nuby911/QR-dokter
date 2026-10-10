@echo off
title Pasang Shortcut Aplikasi MediQR di Desktop Windows
cd /d "%~dp0"
echo ========================================================
echo   PEMASANG SHORTCUT APLIKASI DESKTOP MEDIQR
echo ========================================================
echo.
echo Memasang shortcut di Desktop Windows Anda...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$desktop = [Environment]::GetFolderPath('Desktop'); " ^
  "$s1 = $ws.CreateShortcut(\"$desktop\MediQR Dokter.lnk\"); " ^
  "$s1.TargetPath = 'cmd.exe'; " ^
  "$s1.Arguments = '/c \"\"D:\Project\QR-Dokter\1-Aplikasi-Dokter.bat\"\"'; " ^
  "$s1.WorkingDirectory = 'D:\Project\QR-Dokter\apps\dokter'; " ^
  "$s1.Description = 'Aplikasi Desktop Peresepan Medis Dokter (Offline)'; " ^
  "if (Test-Path 'D:\Project\QR-Dokter\public\icons\icon-512.png') { $s1.IconLocation = 'D:\Project\QR-Dokter\public\icons\icon-512.png' }; " ^
  "$s1.Save(); " ^
  "$s2 = $ws.CreateShortcut(\"$desktop\MediQR Apotek.lnk\"); " ^
  "$s2.TargetPath = 'cmd.exe'; " ^
  "$s2.Arguments = '/c \"\"D:\Project\QR-Dokter\3-Aplikasi-Apotek.bat\"\"'; " ^
  "$s2.WorkingDirectory = 'D:\Project\QR-Dokter\apps\apotek'; " ^
  "$s2.Description = 'Aplikasi Desktop Kasir & Inventaris Farmasi'; " ^
  "if (Test-Path 'D:\Project\QR-Dokter\public\icons\icon-512.png') { $s2.IconLocation = 'D:\Project\QR-Dokter\public\icons\icon-512.png' }; " ^
  "$s2.Save(); " ^
  "Write-Host '[Sukses] Shortcut MediQR Dokter dan MediQR Apotek berhasil dipasang di Desktop!' -ForegroundColor Green;"

echo.
echo Pemasangan selesai! Anda sekarang dapat membuka aplikasi langsung dari Desktop Windows.
pause
