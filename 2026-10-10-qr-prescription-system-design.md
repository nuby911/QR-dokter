# Spesifikasi Desain: Sistem Resep Medis Cerdas Berbasis Self-Contained QR Code & Manajemen Stok Apotek

**Tanggal:** 10 Oktober 2026  
**Status:** Menunggu Persetujuan Pengguna  
**Tipe Arsitektur:** Desentralisasi / Stateless QR (Offline-Capable)

---

## 1. Ringkasan Eksekutif & Latar Belakang

### 1.1 Masalah yang Diselesaikan
* **Kesalahan Baca Resep Manual:** Tulisan tangan dokter yang sulit dibaca (*illegible handwriting*) berisiko fatal menyebabkan apoteker salah memberikan obat, dosis, atau aturan pakai.
* **Ketergantungan Server Terpusat & Downtime:** Sistem e-Prescribing konvensional seringkali terkendala server mati (*server down*), jaringan internet faskes yang tidak stabil, serta biaya infrastruktur server database terpusat yang mahal.
* **Keterikatan Faskes (*Vendor Lock-in*):** Banyak sistem e-resep hanya terhubung ke instalasi farmasi internal rumah sakit/klinik, membatasi hak pasien untuk menebus obat di apotek umum/luar pilihan mereka.

### 1.2 Solusi yang Didesain
Platform sistem resep mandiri berbasis **Self-Contained Smart QR Code**:
1. **Dokter** mengetik resep di software dan mencetak struk thermal/kertas berisi data resep ketikan dan QR Code mandiri.
2. **Seluruh data resep tersimpan langsung di dalam QR Code** (terkompresi dan diamankan dengan tanda tangan digital kriptografi Ed25519), tanpa perlu disimpan di database server pusat.
3. **Pasien** dapat scan QR dengan kamera HP biasa untuk melihat rincian obat secara bersih dan jelas di web viewer tanpa login, serta resep tidak pernah hangus sehingga bisa dijadikan riwayat pribadi.
4. **Apoteker** memindai QR menggunakan software kasir apotek; sistem secara otomatis memvalidasi keaslian resep dokter, menampilkan rincian obat, memudahkan pencocokan dengan inventaris obat apotek, dan memotong stok fisik secara otomatis saat transaksi disetujui.

---

## 2. Aktor & Kebutuhan Pengguna (*User Roles*)

| Aktor | Perangkat | Kebutuhan Utama |
|---|---|---|
| **Dokter** | Laptop / PC / Tablet (Web Lokal / Desktop) | Membuat resep dengan cepat, menandatangani secara digital (*auto-sign*), dan mencetak struk QR. |
| **Pasien** | Ponsel Pintar (*Smartphone*) | Memindai QR kapan saja lewat kamera HP untuk melihat petunjuk minum obat, dosis, dan riwayat obat. Menunjukkan QR ke apotek. |
| **Apoteker** | PC / Laptop Kasir Apotek | Memindai QR resep, memverifikasi keaslian resep, mencocokkan item obat dengan stok fisik apotek, dan memotong stok inventaris saat transaksi selesai. |

---

## 3. Format Data QR & Protokol Keamanan

### 3.1 Struktur Data Resep (*Payload JSON*)
Untuk memaksimalkan kapasitas QR code dan kecepatan pemindaian, data disusun ringkas menggunakan kunci singkat:

```json
{
  "v": 1,
  "id": "RX-20261010-001",
  "doc": {
    "n": "dr. Andi Wijaya",
    "sip": "SIP.440/123/DISKES/2026",
    "pk": "a3f5b7..."
  },
  "pat": {
    "n": "Budi Santoso",
    "a": 32,
    "g": "L"
  },
  "dt": "2026-10-10",
  "rx": [
    {
      "n": "Paracetamol 500mg",
      "q": 10,
      "s": "3x1 tab sesudah makan"
    },
    {
      "n": "Amoxicillin 500mg",
      "q": 10,
      "s": "3x1 tab habiskan"
    }
  ],
  "sig": "30450221008d..."
}
```

* **`v`**: Versi skema payload (default `1`).
* **`id`**: Nomor seri unik resep yang di-generate software dokter.
* **`doc`**: Data dokter (`n`: nama, `sip`: nomor izin praktik, `pk`: Public Key dokter).
* **`pat`**: Data pasien (`n`: nama, `a`: usia, `g`: jenis kelamin).
* **`dt`**: Tanggal penerbitan resep (YYYY-MM-DD).
* **`rx`**: Array daftar obat (`n`: nama obat, `q`: kuantitas, `s`: *signatura* / aturan pakai).
* **`sig`**: Tanda tangan digital kriptografi (*Ed25519 signature*) atas seluruh isi resep di atas.

### 3.2 URL Universal & Fragment Payload
Data JSON dikompresi menggunakan algoritma kompresi data (*LZ-String* atau *Deflate*) dan dikonversi ke Base64 URL-safe.
Hasil string ditempelkan ke format URL:
```text
https://resepku.id/view#d=<payload_terkompresi>
```
* **Alasan Menggunakan Hash Fragment (`#`):** Karakter setelah `#` diproses 100% di browser sisi klien (*client-side*) dan **tidak pernah dikirimkan ke server web host**. Hal ini menjamin privasi medis pasien (*zero server knowledge*) dan web tetap bisa berfungsi secara offline (PWA cache).

### 3.3 Validasi Kriptografi Keaslian Resep (Ed25519 Digital Signature)
1. **Pembuatan Kunci:** Software dokter memiliki pasangan kunci kriptografi asimetris (*Private Key* dan *Public Key*). *Private Key* tersimpan aman di penyimpanan lokal perangkat dokter.
2. **Penandatanganan:** Saat klik "Cetak Resep", software menghitung hash isi resep dan menandatanganinya dengan *Private Key* dokter.
3. **Verifikasi:**
   * Software apotek mengekstrak isi resep dan *Public Key* dokter (`doc.pk`).
   * Software apotek memverifikasi apakah `sig` cocok dengan data resep dan `doc.pk`.
   * **Hasil Cocok:** Tanda tangan valid $\rightarrow$ Resep 100% asli dari dokter dan data belum pernah diubah/dimanipulasi.
   * **Hasil Tidak Cocok:** Muncul peringatan manipulasi data (*tamper alert*).

---

## 4. Desain Komponen Software

### 4.1 Modul Dokter (*Prescription Generator*)
* **Input Dokter:**
  * Profil Dokter (Nama, Gelar, SIP, Nama Faskes/Klinik).
  * Data Pasien (Nama, Usia, No. HP opsional).
  * Baris Obat Dinamis: Input nama obat teks bebas, jumlah kuantitas, dan aturan pakai.
  * Auto-complete nama obat berdasarkan riwayat resep yang sering ditulis dokter sebelumnya.
* **Output Struk:**
  * Komponen cetak struk kompatibel printer thermal (lebar 58mm / 80mm) atau printer kertas A5/A4.
  * Tampilan struk mencakup: Kop klinik/dokter, data pasien, teks ketikan daftar obat dan aturan pakai (sebagai cadangan visual), serta gambar QR Code berukuran proporsional (tingkat koreksi *Error Correction Level* M / Q).

### 4.2 Modul Pasien (*Universal Web Viewer & PWA*)
* **Akses:** Diakses langsung saat kamera HP memindai QR code tanpa perlu instalasi aplikasi dari app store.
* **Fitur Antarmuka:**
  * Status Validasi: Lencana verifikasi (✅ *Resep Asli Terverifikasi dari dr. Andi Wijaya*).
  * Kartu Resep: Menampilkan daftar obat, jumlah, dan petunjuk minum obat dengan ikon waktu (pagi/siang/malam).
  * Tampilkan Layar QR: Fitur untuk memperbesar QR code di layar ponsel agar mudah dipindai oleh apoteker jika struk fisik tertinggal.
  * Simpan Lokal: Dapat di-bookmark atau disimpan ke penyimpanan browser (*Local Storage / IndexedDB*).

### 4.3 Modul Apotek (*Scanner & Manajemen Inventaris*)
* **Antarmuka Kasir & Scanner:**
  * Input otomatis dari Barcode Scanner Gun 2D USB atau kamera webcam.
  * Parsing instan: Membaca teks QR, mendekode hash payload, dan memvalidasi keaslian tanda tangan dokter.
* **Layar Pencocokan Stok (*Drug Matching*):**
  * Sisi kiri menampilkan resep asli dari dokter.
  * Sisi kanan menyediakan kolom pencarian inventaris apotek untuk mencocokkan stok fisik yang ada di rak (misal resep dokter menulis *Paracetamol 500mg*, apoteker memilih *Sanmol 500mg Strip*).
  * Opsi jumlah tebus: Default sesuai jumlah resep, namun dapat disesuaikan jika pasien melakukan tebus sebagian (*partial dispense*).
* **Pengurangan Stok Otomatis:**
  * Saat apoteker menekan tombol "Selesaikan Transaksi & Potong Stok":
    1. Stok item terkait pada database apotek berkurang sesuai jumlah yang dikeluarkan.
    2. Riwayat transaksi penebusan tersimpan di database apotek.
    3. Struk kasir belanja apotek tercetak.

---

## 5. Model Data Inventaris & Transaksi Apotek

```sql
-- Tabel Inventaris Apotek Lokal
CREATE TABLE pharmacy_inventory (
    id TEXT PRIMARY KEY,
    barcode TEXT,
    item_name TEXT NOT NULL,
    category TEXT,
    unit TEXT NOT NULL, -- e.g. tablet, botol, strip
    current_stock INTEGER NOT NULL DEFAULT 0,
    min_stock_alert INTEGER DEFAULT 10,
    selling_price INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Riwayat Penebusan Resep di Apotek
CREATE TABLE prescription_dispense_log (
    id TEXT PRIMARY KEY,
    prescription_code TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    doctor_sip TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    dispensed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pharmacist_notes TEXT,
    total_amount INTEGER NOT NULL
);

-- Tabel Detail Item Penebusan
CREATE TABLE prescription_dispense_items (
    id TEXT PRIMARY KEY,
    dispense_id TEXT REFERENCES prescription_dispense_log(id),
    inventory_id TEXT REFERENCES pharmacy_inventory(id),
    prescribed_drug_name TEXT NOT NULL,
    qty_dispensed INTEGER NOT NULL,
    unit_price INTEGER NOT NULL,
    subtotal INTEGER NOT NULL
);
```

---

## 6. Penanganan Skenario Khusus & Kasus Tepi (*Edge Cases*)

1. **Kertas Struk Rusak / Buram / Terlipat:**
   * Struk fisik selalu memuat tulisan nama obat hasil ketikan komputer yang jelas di samping QR Code.
   * Apoteker dapat membaca secara manual dan menginput penjualan melalui kasir apotek tanpa kendala.
2. **Pemalsuan Resep / Manipulasi Data:**
   * Jika ada pihak yang memodifikasi data QR tanpa kunci privat dokter yang sah, algoritma Ed25519 akan gagal memverifikasi tanda tangan.
   * Sistem apotek akan menampilkan peringatan merah: ⚠️ *"Tanda tangan dokter tidak valid! Resep ini diduga palsu atau telah diubah."*
3. **Penebusan Ulang (*Refill / Repeat Purchase*):**
   * Resep tidak pernah hangus sehingga pasien tetap bisa melihat isi resep di ponselnya.
   * Di sisi apotek, sistem mengecek `prescription_dispense_log`: jika resep dengan ID tersebut pernah ditebus di apotek ini, sistem menampilkan pemberitahuan: *"Resep ini pernah ditebus di apotek ini pada tanggal DD/MM/YYYY"*.
   * Apoteker memiliki wewenang klinis untuk menyetujui atau menolak penebusan ulang.
4. **Stok Obat Apotek Tidak Mencukupi (*Partial Dispense*):**
   * Apoteker dapat menyesuaikan jumlah obat yang ditebus (misal resep meminta 10 tablet, stok hanya ada 6 tablet).
   * Stok terpotong 6 tablet, transaksi dicatat sebagai tebus sebagian, dan pasien dapat mencari sisa 4 tablet di apotek lain.
5. **Koneksi Internet Apotek Putus:**
   * Sistem apotek dan viewer pasien dapat dijalankan secara lokal/offline (berkat teknologi PWA dan SQLite lokal), sehingga transaksi tetap berjalan lancar 100%.

---

## 7. Rencana Teknologi (*Tech Stack*)

* **Framework Web & UI:** Next.js (React) + Tailwind CSS + komponen UI modern (*shadcn/ui* / Radix).
* **Kriptografi & Kompresi:** `@noble/ed25519` (tanda tangan digital) & `lz-string` (kompresi teks URL).
* **Mesin Pemindaian & Pembuatan QR:** `qrcode` (generator di sisi dokter) & `html5-qrcode` (kamera scanner di sisi apotek/web).
* **Penyimpanan Data Apotek:** Database relasional lokal (SQLite untuk offline standalone atau PostgreSQL untuk multi-kasir di apotek).

---

## 8. Verifikasi & Pengujian

* **Unit Test Kriptografi:** Memastikan signature dokter dapat diverifikasi dengan benar, dan gagal jika ada 1 karakter teks obat yang diubah.
* **Stress Test Ukuran Payload:** Menguji batas ukuran QR Code hingga 10 jenis obat racikan agar tetap dapat dibaca oleh kamera smartphone standar pada resolusi rendah.
* **Test Transaksi Inventaris:** Memverifikasi pengurangan stok otomatis saat transaksi berhasil dan rollback jika transaksi dibatalkan.
