# MediQR — Panduan 3 Aplikasi Mandiri (.app & Desktop Ready)

Sistem **MediQR** telah dipisahkan secara total menjadi **3 aplikasi mandiri** yang bersih dari kode redundan, dengan aplikasi desktop native (`.app` Electron window) untuk Dokter dan Apotek, serta Web Portal PWA untuk Pasien:

---

## 1. MediQR Dokter (Aplikasi Desktop Mandiri Offline)
- **Lokasi Folder**: `apps/dokter/`
- **Cara Menjalankan**: Cukup klik 2x file **`1-Aplikasi-Dokter.bat`** (atau buka shortcut **MediQR Dokter** di Desktop Windows)
- **Tampilan**: Jendela Aplikasi Desktop Native (Electron) tanpa browser web bar
- **Fitur Khusus Dokter**:
  - Berjalan 100% **offline tanpa internet**.
  - Form peresepan medis mandiri (Data Pasien, Obat, Dosis, Signa).
  - Tanda tangan digital kriptografis **Ed25519** (kunci privat dokter tersimpan di perangkat lokal).
  - Pratinjau & Cetak Struk Fisik Thermal 80mm lengkap dengan kode QR terkompresi berstandar ISO/IEC 18004 Quiet Zone.
  - **Isolasi Penuh**: Bersih dari portal apotek maupun pasien.

---

## 2. MediQR Apotek (Aplikasi Desktop Kasir & Inventaris Farmasi)
- **Lokasi Folder**: `apps/apotek/`
- **Cara Menjalankan**: Cukup klik 2x file **`3-Aplikasi-Apotek.bat`** (atau buka shortcut **MediQR Apotek** di Desktop Windows)
- **Tampilan**: Jendela Aplikasi Desktop Native (Electron) tanpa browser web bar
- **Fitur Khusus Farmasi**:
  - Tampilan Tailwind CSS bersih dan stabil, terbebas dari tabrakan port zombie.
  - Scanner QR resep masuk: Mendukung **USB Barcode Gun**, Kamera Web, maupun input manual.
  - **Hard Security Gate**: Memverifikasi integritas digital Ed25519 dokter dan mengunci tombol transaksi jika resep palsu/dimanipulasi.
  - Pencocokan obat resep dengan stok etalase apotek secara instan.
  - Penyerahan obat ("Serahkan Obat") yang langsung memotong stok inventaris lokal secara otomatis.
  - Manajemen etalase apotek: Tambah obat baru, ubah stok, riwayat penebusan.
  - **Isolasi Penuh**: Hanya sistem kasir & stok farmasi tanpa form dokter.

---

## 3. MediQR Pasien (Portal Web Publik & PWA Installable)
- **Lokasi Folder**: `apps/pasien-web/`
- **Cara Menjalankan**: Klik 2x file **`2-Web-Pasien.bat`**
- **Port**: `http://localhost:3000` (atau IP Wi-Fi lokal `http://192.168.1.7:3000` via ponsel)
- **Fitur Khusus Pasien**:
  - **Hanya untuk Pasien**: Satu-satunya antarmuka berbasis web.
  - **Installable App (PWA)**: Tersedia tombol **"Pasang App"** di bilah atas untuk menginstal web langsung ke layar utama ponsel atau desktop seperti aplikasi native.
  - Saat pasien memindai QR code pada struk fisik dengan kamera ponsel, tautan `#d=...` langsung didekode (LZ-String) dan diverifikasi tanda tangan dokternya di peramban ponsel secara instan.
  - Menampilkan lembar resep digital yang rapi, jadwal minum obat (Pagi/Siang/Malam), dan peringatan obat keras/antibiotik.
  - Tombol **"Tunjukkan QR ke Apoteker"** untuk menampilkan QR kontras tinggi saat berada di kasir apotek.
  - **Isolasi Penuh**: Pasien sama sekali tidak memiliki akses ke sistem peresepan dokter maupun inventaris kasir apotek.

---

## 🚀 Peluncur & Pemasang Shortcut Desktop Windows

Di folder utama `D:\Project\QR-Dokter\`:
1. **`Pasang-Shortcut-Desktop.bat`** &rarr; **Jalankan sekali ini untuk memasang shortcut resmi "MediQR Dokter" dan "MediQR Apotek" langsung ke layar Desktop Windows Anda.**
2. **`1-Aplikasi-Dokter.bat`** &rarr; Membuka Jendela Desktop Aplikasi Dokter
3. **`2-Web-Pasien.bat`** &rarr; Menjalankan Web Server Portal Pasien (`0.0.0.0:3000`)
4. **`3-Aplikasi-Apotek.bat`** &rarr; Membuka Jendela Desktop Aplikasi Apotek
