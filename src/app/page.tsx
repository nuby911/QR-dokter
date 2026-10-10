'use client';

import React from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Store,
  User,
  ShieldCheck,
  QrCode,
  Zap,
  ArrowRight,
  Database,
  Smartphone,
  Printer,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-slate-50/50 py-16 sm:py-24 border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-800 shadow-xs mb-6">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>Sistem Resep Medis Cerdas Tanpa Database Server Pusat</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Selamat Tinggal Kesalahan Baca Resep Dokter.
            <span className="block text-teal-600 mt-2">
              Kini Hadir Smart QR Resep &amp; Inventaris Apotek.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
            Seluruh data resep dokter dikompresi dan ditandatangani secara kriptografi langsung di dalam <strong>QR Code mandiri</strong>. Bebas server down, pasien bisa scan lewat kamera HP, dan stok obat di apotek otomatis berkurang saat ditebus.
          </p>

          {/* Quick Action CTA buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/doctor"
              className="flex items-center gap-2 rounded-2xl bg-teal-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 active:scale-95"
            >
              <Stethoscope className="h-4 w-4" />
              Mulai Tulis Resep (Dokter)
            </Link>
            <Link
              href="/pharmacy"
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
            >
              <Store className="h-4 w-4 text-teal-600" />
              Buka Kasir Apotek &amp; Stok
            </Link>
            <Link
              href="/view"
              className="flex items-center gap-2 rounded-2xl border border-teal-200 bg-teal-50/60 px-5 py-3.5 text-xs sm:text-sm font-bold text-teal-800 transition hover:bg-teal-100"
            >
              <Smartphone className="h-4 w-4 text-teal-600" />
              Viewer Pasien
            </Link>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-4xl mx-auto text-left">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <ShieldCheck className="h-6 w-6 text-emerald-600 mb-2" />
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Ed25519 Anti-Palsu</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Tanda tangan digital mencegah manipulasi resep</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <Zap className="h-6 w-6 text-amber-500 mb-2" />
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Kebal Server Down</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Berjalan 100% mandiri tanpa database cloud pusat</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <Printer className="h-6 w-6 text-teal-600 mb-2" />
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Struk Thermal 80mm</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Kompatibel printer kasir dan printer kertas biasa</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <Database className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Potong Stok Otomatis</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Apotek mengelola inventaris lokal mandiri</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Main Portals Section */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Tiga Aktor dalam Satu Ekosistem Terpadu
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Pilih portal di bawah untuk menguji alur kerja masing-masing peran
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1: Dokter */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-teal-300 group">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 mb-4 group-hover:scale-105 transition">
                <Stethoscope className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Aktor 1</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Portal Dokter</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Dokter mengetik resep dengan bantuan template otomatis. Sistem menandatangani data secara kriptografi dan mencetak struk thermal lengkap dengan QR Code mandiri.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                  <span>Input obat cepat &amp; template siap pakai</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                  <span>Preview struk printer thermal 80mm/58mm</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                  <span>Pengaturan URL IP lokal untuk scan via HP</span>
                </li>
              </ul>
            </div>

            <Link
              href="/doctor"
              className="mt-6 flex items-center justify-between rounded-xl bg-teal-50 px-4 py-2.5 text-xs font-bold text-teal-800 transition hover:bg-teal-100"
            >
              <span>Buka Portal Dokter</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Card 2: Pasien */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-teal-300 group">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4 group-hover:scale-105 transition">
                <Smartphone className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Aktor 2</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Viewer Pasien</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Pasien mengarahkan kamera HP ke QR struk. Halaman web langsung memverifikasi keaslian resep di browser HP tanpa perlu instalasi aplikasi dari app store.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Status verifikasi keaslian dokter</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Petunjuk minum obat rapi &amp; ramah pasien</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Tombol &quot;Tunjukkan QR ke Apoteker&quot;</span>
                </li>
              </ul>
            </div>

            <Link
              href="/view"
              className="mt-6 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
            >
              <span>Buka Viewer Pasien</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Card 3: Apotek */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-teal-300 group">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 group-hover:scale-105 transition">
                <Store className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Aktor 3</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Portal Apotek &amp; Kasir</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Apoteker memindai QR lewat USB Scanner Gun atau kamera. Sistem otomatis mencocokkan obat dengan stok di rak dan memotong stok fisik saat transaksi disetujui.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Pencocokan stok obat lokal otomatis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Pemotongan kuantitas inventaris real-time</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Deteksi riwayat penebusan sebelumnya</span>
                </li>
              </ul>
            </div>

            <Link
              href="/pharmacy"
              className="mt-6 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-800 transition hover:bg-blue-100"
            >
              <span>Buka Kasir Apotek</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Testing Guide Section for User Demo */}
      <section className="bg-white py-16 border-t border-slate-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl border border-teal-200 bg-gradient-to-r from-teal-50/70 to-emerald-50/50 p-8 sm:p-10 shadow-sm">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-800">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" /> Panduan Uji Coba Demo
              </span>
              <h3 className="mt-2 text-2xl font-extrabold text-slate-900">
                Cara Menguji Langsung Menggunakan HP Anda:
              </h3>
              <div className="mt-6 space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white font-bold text-xs">
                    1
                  </span>
                  <p>
                    Buka <Link href="/doctor" className="font-bold text-teal-700 hover:underline">Portal Dokter</Link>, lalu pastikan laptop dan HP terhubung ke Wi-Fi yang sama. Periksa kolom <em>Alamat Host QR</em> agar terisi IP laptop Anda (misal <code>http://192.168.x.x:3000</code>).
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white font-bold text-xs">
                    2
                  </span>
                  <p>
                    Klik <strong>&quot;Terbitkan &amp; Buat Struk QR&quot;</strong>. Struk thermal akan tampil di sisi kanan layar laptop dengan QR Code yang siap dipindai.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white font-bold text-xs">
                    3
                  </span>
                  <p>
                    <strong>Arahkan kamera HP Anda</strong> ke QR Code di layar laptop. Browser HP Anda akan langsung membuka halaman resep pasien yang rapi dan terverifikasi asli!
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white font-bold text-xs">
                    4
                  </span>
                  <p>
                    Buka <Link href="/pharmacy" className="font-bold text-teal-700 hover:underline">Portal Apotek</Link> di laptop untuk memindai resep tersebut, mencocokkan stok obat di rak apotek, dan menyelesaikan transaksi pemotongan stok otomatis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        <p>MediQR — Sistem Resep Medis Cerdas Berbasis Self-Contained QR Code</p>
        <p className="mt-1">Dibuat khusus untuk efisiensi praktik dokter, kenyamanan pasien, dan manajemen inventaris apotek modern.</p>
      </footer>
    </div>
  );
}
