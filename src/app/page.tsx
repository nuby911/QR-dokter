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
    <div className="min-h-screen bg-[#fafaf9] text-ink-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-ink-200/80 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-forest-200/80 bg-forest-50 px-3.5 py-1 text-xs font-semibold text-forest-800 shadow-xs mb-8">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] tracking-wide">E-PRESKRIPSI MANDIRI &bull; ZERO SERVER DATABASE</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-3xl font-black tracking-tight text-ink-950 sm:text-5xl lg:text-6xl leading-[1.12]">
            Resep Medis Cerdas.
            <span className="block text-forest-700 font-extrabold mt-1 sm:mt-2">
              Terverifikasi Kriptografi, Bebas Server Down.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base text-ink-600 leading-relaxed font-normal">
            Seluruh data resep pasien dikompresi dan ditandatangani secara kriptografi langsung di dalam <strong>QR Code mandiri</strong>. Dokter mencetak struk thermal 80mm, pasien membaca jadwal obat di browser HP, dan kasir apotek memotong stok obat secara otomatis.
          </p>

          {/* Quick Action CTA buttons */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/doctor"
              className="flex items-center gap-2 rounded-xl bg-forest-900 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-forest-800 active:scale-95 transition"
            >
              <Stethoscope className="h-4 w-4 text-forest-300" />
              <span>Tulis Resep (Portal Dokter)</span>
            </Link>
            <Link
              href="/pharmacy"
              className="flex items-center gap-2 rounded-xl border border-ink-300 bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-ink-800 shadow-xs hover:bg-ink-50 active:scale-95 transition"
            >
              <Store className="h-4 w-4 text-forest-700" />
              <span>Kasir Apotek &amp; Inventaris</span>
            </Link>
            <Link
              href="/view"
              className="flex items-center gap-2 rounded-xl border border-forest-200 bg-forest-50/70 px-5 py-3.5 text-xs sm:text-sm font-bold text-forest-800 hover:bg-forest-100 active:scale-95 transition"
            >
              <Smartphone className="h-4 w-4 text-forest-700" />
              <span>Viewer Pasien (HP)</span>
            </Link>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-4xl mx-auto text-left">
            <div className="rounded-xl border border-ink-200/90 bg-[#fafaf9] p-4 shadow-xs">
              <ShieldCheck className="h-5 w-5 text-forest-700 mb-2" />
              <h4 className="font-bold text-ink-950 text-xs sm:text-sm">Ed25519 Anti-Palsu</h4>
              <p className="text-[11px] text-ink-500 mt-0.5 leading-snug">Tanda tangan asimetris mencegah pemalsuan &amp; manipulasi dosis</p>
            </div>
            <div className="rounded-xl border border-ink-200/90 bg-[#fafaf9] p-4 shadow-xs">
              <Zap className="h-5 w-5 text-amber-600 mb-2" />
              <h4 className="font-bold text-ink-950 text-xs sm:text-sm">100% Bebas Server Down</h4>
              <p className="text-[11px] text-ink-500 mt-0.5 leading-snug">Data utuh di QR code, tetap berfungsi walau internet padam</p>
            </div>
            <div className="rounded-xl border border-ink-200/90 bg-[#fafaf9] p-4 shadow-xs">
              <Printer className="h-5 w-5 text-ink-800 mb-2" />
              <h4 className="font-bold text-ink-950 text-xs sm:text-sm">Struk Thermal 80mm</h4>
              <p className="text-[11px] text-ink-500 mt-0.5 leading-snug">Format cetak kasir siap pakai dengan tipografi Latin R/ autentik</p>
            </div>
            <div className="rounded-xl border border-ink-200/90 bg-[#fafaf9] p-4 shadow-xs">
              <Database className="h-5 w-5 text-emerald-700 mb-2" />
              <h4 className="font-bold text-ink-950 text-xs sm:text-sm">Auto-Potong Stok POS</h4>
              <p className="text-[11px] text-ink-500 mt-0.5 leading-snug">Pencocokan sediaan etalase dan pengurangan stok fisik instan</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Main Portals Section */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-forest-700 mb-2">
            <span>● ARSITEKTUR TIGA AKTOR</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-ink-950 tracking-tight">
            Tiga Titik Sentuh dalam Satu Rantai Pelayanan
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-ink-500 max-w-xl mx-auto">
            Setiap aktor memiliki workstation khusus yang dirancang efisien dan terhubung tanpa bergantung pada database terpusat.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1: Dokter */}
          <div className="flex flex-col justify-between rounded-2xl border border-ink-200 bg-white p-6 shadow-xs hover:border-forest-300 transition group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 border border-forest-200/70 text-forest-800 group-hover:scale-105 transition">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200/60">
                  AKTOR 1
                </span>
              </div>
              <h3 className="text-lg font-bold text-ink-950">Portal Dokter</h3>
              <p className="mt-2 text-xs text-ink-500 leading-relaxed">
                Dokter menyusun resep dengan template diagnosis cepat. Sistem menandatangani dokumen secara kriptografis dan mencetak struk thermal 80mm lengkap dengan QR Code mandiri.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-ink-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-forest-700 shrink-0" />
                  <span>Input obat cepat &amp; template diagnosis siap pakai</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-forest-700 shrink-0" />
                  <span>Cetak struk kasir thermal 80mm/58mm</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-forest-700 shrink-0" />
                  <span>Deteksi otomatis IP Wi-Fi untuk scan HP</span>
                </li>
              </ul>
            </div>

            <Link
              href="/doctor"
              className="mt-6 flex items-center justify-between rounded-xl bg-ink-100 hover:bg-forest-900 hover:text-white px-4 py-2.5 text-xs font-bold text-ink-800 transition shadow-xs group/btn"
            >
              <span>Buka Portal Dokter</span>
              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition" />
            </Link>
          </div>

          {/* Card 2: Pasien */}
          <div className="flex flex-col justify-between rounded-2xl border border-ink-200 bg-white p-6 shadow-xs hover:border-forest-300 transition group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 group-hover:scale-105 transition">
                  <Smartphone className="h-5 w-5" />
                </div>
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  AKTOR 2
                </span>
              </div>
              <h3 className="text-lg font-bold text-ink-950">Viewer Pasien Mobile</h3>
              <p className="mt-2 text-xs text-ink-500 leading-relaxed">
                Pasien memindai struk dengan kamera HP biasa. Halaman web langsung memverifikasi keaslian resep dan menampilkan petunjuk konsumsi obat yang manusiawi tanpa instal aplikasi.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-ink-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>Jadwal visual konsumsi obat (Pagi, Siang, Malam)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>Verifikasi tanda tangan dokter langsung di browser</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>Tombol &quot;Tunjukkan QR ke Apoteker&quot; fullscreen</span>
                </li>
              </ul>
            </div>

            <Link
              href="/view"
              className="mt-6 flex items-center justify-between rounded-xl bg-ink-100 hover:bg-forest-900 hover:text-white px-4 py-2.5 text-xs font-bold text-ink-800 transition shadow-xs group/btn"
            >
              <span>Buka Viewer Pasien</span>
              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition" />
            </Link>
          </div>

          {/* Card 3: Apotek */}
          <div className="flex flex-col justify-between rounded-2xl border border-ink-200 bg-white p-6 shadow-xs hover:border-forest-300 transition group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-950 text-white group-hover:scale-105 transition">
                  <Store className="h-5 w-5 text-forest-300" />
                </div>
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-forest-800 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200/60">
                  AKTOR 3
                </span>
              </div>
              <h3 className="text-lg font-bold text-ink-950">Kasir Apotek &amp; Inventaris</h3>
              <p className="mt-2 text-xs text-ink-500 leading-relaxed">
                Apoteker memindai QR lewat USB Scanner Gun atau kamera. Sistem otomatis mencocokkan sediaan dengan stok di rak dan memotong stok fisik saat transaksi selesai.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-ink-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-forest-700 shrink-0" />
                  <span>Pencocokan otomatis obat resep ke stok rak apotek</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-forest-700 shrink-0" />
                  <span>Pengurangan stok fisik otomatis &amp; deteksi tebus ulang</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-forest-700 shrink-0" />
                  <span>Cetak struk belanja kasir dengan total tagihan</span>
                </li>
              </ul>
            </div>

            <Link
              href="/pharmacy"
              className="mt-6 flex items-center justify-between rounded-xl bg-ink-100 hover:bg-forest-900 hover:text-white px-4 py-2.5 text-xs font-bold text-ink-800 transition shadow-xs group/btn"
            >
              <span>Buka Kasir Apotek</span>
              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Testing Guide Section for User Demo */}
      <section className="bg-white py-16 sm:py-20 border-t border-ink-200/80">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-2xl border border-ink-200 bg-[#fafaf9] p-7 sm:p-10 shadow-xs">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-forest-800">
                <Sparkles className="h-3.5 w-3.5 text-forest-700" /> PANDUAN PENGUJIAN DEMO
              </span>
              <h3 className="mt-2 text-2xl font-black text-ink-950 tracking-tight">
                Cara Menguji Langsung Menggunakan HP Anda:
              </h3>
              <p className="mt-1 text-xs text-ink-500">
                Ikuti 4 langkah mudah di bawah untuk mensimulasikan alur end-to-end dari peresepan hingga penebusan di apotek:
              </p>

              <div className="mt-6 space-y-4 text-xs sm:text-sm text-ink-700">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-forest-900 text-white font-bold font-mono text-xs">
                    1
                  </span>
                  <p>
                    Buka <Link href="/doctor" className="font-bold text-forest-800 hover:underline">Portal Dokter</Link>, pastikan laptop dan HP terhubung ke Wi-Fi yang sama. Kolom <em>Alamat Host QR</em> otomatis menyarankan IP laptop Anda (misal <code>http://192.168.1.7:3000</code>).
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-forest-900 text-white font-bold font-mono text-xs">
                    2
                  </span>
                  <p>
                    Pilih salah satu template diagnosis (misal <em>ISPA / Flu</em>), lalu klik <strong>&quot;Terbitkan &amp; Buat Struk QR&quot;</strong>. Struk thermal autentik akan tampil di sisi kanan layar laptop dengan QR Code siap dipindai.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-forest-900 text-white font-bold font-mono text-xs">
                    3
                  </span>
                  <p>
                    <strong>Arahkan kamera HP Anda</strong> ke QR Code di layar laptop. Browser HP Anda akan langsung membuka halaman resep pasien dengan jadwal konsumsi obat (🌅 Pagi, ☀️ Siang, 🌙 Malam) dan verifikasi tanda tangan dokter!
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-forest-900 text-white font-bold font-mono text-xs">
                    4
                  </span>
                  <p>
                    Buka <Link href="/pharmacy" className="font-bold text-forest-800 hover:underline">Portal Apotek</Link> di laptop untuk memindai resep tersebut, mencocokkan obat dengan stok di rak, dan menyelesaikan transaksi pemotongan stok otomatis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-200/80 bg-white py-8 text-center text-xs text-ink-400 font-mono">
        <p className="font-semibold text-ink-600">MediQR — Sistem E-Preskripsi Terdesentralisasi Mandiri</p>
        <p className="mt-1 text-[11px]">Kriptografi Ed25519 &bull; Kompresi LZ-String &bull; Print Thermal 80mm &bull; Auto-Deduct POS Apotek</p>
      </footer>
    </div>
  );
}
