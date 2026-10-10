'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Store,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  Zap,
  Printer,
  Database,
  Search,
  CheckCircle2,
  QrCode,
  Sparkles,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#241a14] selection:bg-[#e86a28] selection:text-white">
      <Navbar />

      {/* Hero Section with Asymmetric Warm Layout */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Visual: Warm Organic Arch Presentation (Inspired by Reference) */}
            <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
              <div className="relative w-full max-w-sm">
                {/* Organic Arch Background in Terracotta Warmth */}
                <div className="organic-arch bg-[#e86a28] p-6 pt-10 pb-8 text-white shadow-xl warm-card-shadow relative overflow-hidden">
                  {/* Subtle warm glow circle */}
                  <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-[#f4854b] opacity-40 blur-2xl" />

                  {/* Top Badge */}
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#ffd3be] mb-4">
                    <span>E-PRESKRIPSI DOKTER</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] text-white">
                      80MM THERMAL
                    </span>
                  </div>

                  {/* Simulated Clean Medical Prescription Slip Card */}
                  <div className="rounded-2xl bg-white text-[#241a14] p-5 shadow-lg space-y-3 font-sans">
                    <div className="border-b border-dashed border-[#ebdccd] pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-sm text-[#241a14]">
                            dr. Budi Santoso, Sp.A
                          </h4>
                          <p className="text-[11px] text-[#866d5b] font-mono">
                            SIP: 503/SIP.D/2024 &bull; Klinik Pratama
                          </p>
                        </div>
                        <span className="h-6 w-6 rounded-full bg-[#ffedd5] flex items-center justify-center text-[#e86a28]">
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1.5 font-mono">
                      <div className="flex justify-between text-[11px] text-[#715949]">
                        <span>Pasien: Budi Santoso (32th)</span>
                        <span>10 Okt 2026</span>
                      </div>
                      <div className="bg-[#faf7f2] rounded-lg p-2.5 border border-[#ebdccd] text-[11px] space-y-1">
                        <div className="flex justify-between font-bold text-[#241a14]">
                          <span>1. Paracetamol 500mg</span>
                          <span>No. X</span>
                        </div>
                        <p className="text-[10px] text-[#866d5b] italic">
                          S. 3x1 tablet sesudah makan
                        </p>
                      </div>
                      <div className="bg-[#faf7f2] rounded-lg p-2.5 border border-[#ebdccd] text-[11px] space-y-1">
                        <div className="flex justify-between font-bold text-[#241a14]">
                          <span>2. Cetirizine 10mg</span>
                          <span>No. V</span>
                        </div>
                        <p className="text-[10px] text-[#866d5b] italic">
                          S. 1x1 tablet malam hari
                        </p>
                      </div>
                    </div>

                    {/* QR Code Presentation Box */}
                    <div className="pt-2 border-t border-dashed border-[#ebdccd] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-12 w-12 rounded-lg bg-[#241a14] p-1 text-white flex items-center justify-center">
                          <QrCode className="h-9 w-9 text-white" />
                        </div>
                        <div className="text-[10px]">
                          <p className="font-bold text-[#241a14]">Ed25519 Verified</p>
                          <p className="text-[#866d5b]">Scan via Kamera HP</p>
                        </div>
                      </div>

                      <Link
                        href="/view"
                        className="rounded-full bg-[#e86a28] hover:bg-[#d95a18] text-white px-3 py-1.5 text-[11px] font-bold shadow-xs transition"
                      >
                        Lihat Pasien
                      </Link>
                    </div>
                  </div>

                  {/* Bottom Stats Card */}
                  <div className="mt-4 flex items-center justify-between text-xs text-white/90 px-1 font-mono">
                    <span>100% Stateless</span>
                    <span>&bull;</span>
                    <span>LZ-String Compressed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content: Editorial Headline & Actions */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f3e8dc] border border-[#ebdccd] px-3.5 py-1 text-xs font-semibold text-[#865d40]">
                <span className="h-2 w-2 rounded-full bg-[#e86a28]" />
                <span className="font-mono text-[11px] tracking-wide uppercase">
                  Sistem Resep Medis Mandiri
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#241a14] leading-[1.12]">
                Penebusan resep.
                <span className="block text-[#e86a28] mt-1">
                  Terverifikasi instan.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#6f5645] leading-relaxed max-w-xl font-normal">
                Seluruh resep dokter dikompresi dan ditandatangani secara kriptografi langsung di dalam <strong>QR Code mandiri</strong>. Dokter menerbitkan struk fisik thermal 80mm, pasien membaca jadwal di ponsel, dan stok apotek terpotong otomatis saat transaksi.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/doctor"
                  className="flex items-center gap-2 rounded-full bg-[#e86a28] hover:bg-[#d95a18] text-white px-7 py-3.5 text-sm font-bold shadow-md shadow-[#e86a28]/25 transition active:scale-95"
                >
                  <Stethoscope className="h-4 w-4" />
                  <span>Mulai Tulis Resep</span>
                </Link>

                <Link
                  href="/pharmacy"
                  className="flex items-center gap-2 rounded-full border border-[#ebdccd] bg-white hover:bg-[#f6efe7] text-[#4d392b] px-6 py-3.5 text-sm font-bold shadow-2xs transition active:scale-95"
                >
                  <Store className="h-4 w-4 text-[#e86a28]" />
                  <span>Buka Kasir Apotek</span>
                </Link>
              </div>

              {/* Quick Search Bar (Styled like Reference Image) */}
              <div className="pt-4 max-w-lg">
                <div className="relative flex items-center rounded-full border border-[#ebdccd] bg-white p-1.5 shadow-sm">
                  <Search className="ml-3 h-4 w-4 text-[#a88d7b] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Uji coba cari nomor resep atau obat..."
                    className="w-full bg-transparent px-3 py-1 text-xs text-[#241a14] placeholder-[#a88d7b] focus:outline-none"
                  />
                  <Link
                    href="/doctor"
                    className="rounded-full bg-[#241a14] hover:bg-[#382b22] px-4 py-2 text-xs font-bold text-white transition shrink-0"
                  >
                    Tulis Baru
                  </Link>
                </div>
              </div>

              {/* Metrics Row (Like Reference Image) */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#ebdccd] max-w-lg text-xs">
                <div>
                  <div className="font-extrabold text-[#241a14] text-base font-mono">100%</div>
                  <div className="text-[11px] text-[#866d5b]">Bebas Server Down</div>
                </div>
                <div>
                  <div className="font-extrabold text-[#e86a28] text-base font-mono">Ed25519</div>
                  <div className="text-[11px] text-[#866d5b]">Kriptografi Asimetris</div>
                </div>
                <div>
                  <div className="font-extrabold text-[#241a14] text-base font-mono">80mm</div>
                  <div className="text-[11px] text-[#866d5b]">Standar Printer Kasir</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* "Our Collections" Style Section for 3 Main Portals */}
      <section className="py-16 sm:py-20 border-t border-[#ebdccd] bg-[#fdfbf7]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#e86a28] mb-1">
                TIGA AKTOR TERPADU
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#241a14] tracking-tight">
                Pilihan Workstation Layanan
              </h2>
            </div>
            <p className="text-xs text-[#866d5b] max-w-xs sm:text-right">
              Pilih portal di bawah untuk menguji alur kerja masing-masing peran secara langsung.
            </p>
          </div>

          {/* Cards Grid Inspired by Reference Design Collections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Dokter (Terracotta Signature Card) */}
            <div className="rounded-3xl bg-gradient-to-br from-[#e86a28] to-[#d65718] p-7 text-white flex flex-col justify-between shadow-lg shadow-[#e86a28]/15 group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ffd3be]">
                    PORTAL 01
                  </span>
                </div>

                <h3 className="text-xl font-black tracking-tight text-white">
                  Terminal Dokter
                </h3>
                <p className="mt-2 text-xs text-[#ffe1d4] leading-relaxed">
                  Penulisan resep digital dengan diagnosis template, penandatanganan kriptografi otomatis, dan cetak struk thermal 80mm ESC/POS.
                </p>

                <ul className="mt-5 space-y-2 text-xs text-white/90">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#ffd3be] shrink-0" />
                    <span>Template diagnosis instan (ISPA, Maag, Alergi)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#ffd3be] shrink-0" />
                    <span>Deteksi otomatis IP Wi-Fi lokal laptop</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/doctor"
                className="mt-8 flex items-center justify-between rounded-full bg-white text-[#241a14] px-5 py-3 text-xs font-bold hover:bg-[#ffedd5] transition shadow-xs group-hover:scale-[1.02]"
              >
                <span>Buka Portal Dokter</span>
                <ArrowRight className="h-4 w-4 text-[#e86a28]" />
              </Link>
            </div>

            {/* Card 2: Pasien (Warm Linen Card) */}
            <div className="rounded-3xl bg-white border border-[#ebdccd] p-7 text-[#241a14] flex flex-col justify-between shadow-xs hover:border-[#e86a28]/40 transition group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffedd5] text-[#e86a28]">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#a88d7b]">
                    PORTAL 02
                  </span>
                </div>

                <h3 className="text-xl font-black tracking-tight text-[#241a14]">
                  Viewer Pasien (HP)
                </h3>
                <p className="mt-2 text-xs text-[#6f5645] leading-relaxed">
                  Pasien memindai struk dengan kamera ponsel biasa. Resep langsung tampil di web tanpa perlu menginstal aplikasi tambahan.
                </p>

                <ul className="mt-5 space-y-2 text-xs text-[#6f5645]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#e86a28] shrink-0" />
                    <span>Jadwal minum obat terstruktur (Pagi, Siang, Malam)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#e86a28] shrink-0" />
                    <span>Verifikasi keaslian dokter offline di browser</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/view"
                className="mt-8 flex items-center justify-between rounded-full bg-[#f3e8dc] text-[#241a14] hover:bg-[#e86a28] hover:text-white px-5 py-3 text-xs font-bold transition shadow-xs group-hover:scale-[1.02]"
              >
                <span>Buka Viewer Pasien</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Card 3: Apotek (Deep Espresso Card) */}
            <div className="rounded-3xl bg-[#241a14] p-7 text-white flex flex-col justify-between shadow-lg shadow-black/10 group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Store className="h-6 w-6 text-[#ffedd5]" />
                  </div>
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#a88d7b]">
                    PORTAL 03
                  </span>
                </div>

                <h3 className="text-xl font-black tracking-tight text-white">
                  Kasir Farmasi &amp; POS
                </h3>
                <p className="mt-2 text-xs text-[#dec7b0] leading-relaxed">
                  Apoteker memindai QR lewat USB Scanner Gun atau kamera. Sistem otomatis mencocokkan obat etalase dan memotong stok fisik.
                </p>

                <ul className="mt-5 space-y-2 text-xs text-[#dec7b0]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#e86a28] shrink-0" />
                    <span>Pencocokan stok etalase otomatis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#e86a28] shrink-0" />
                    <span>Pengurangan kuantitas inventaris real-time</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/pharmacy"
                className="mt-8 flex items-center justify-between rounded-full bg-[#e86a28] hover:bg-[#d95a18] text-white px-5 py-3 text-xs font-bold transition shadow-xs group-hover:scale-[1.02]"
              >
                <span>Buka Kasir Apotek</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pills Strip (Inspired by Tablet view in Reference) */}
      <section className="py-12 border-t border-[#ebdccd] bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#faf7f2] border border-[#ebdccd]">
              <div className="h-9 w-9 rounded-xl bg-[#ffedd5] flex items-center justify-center text-[#e86a28] shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-[#241a14]">Ed25519 Anti-Palsu</div>
                <div className="text-[11px] text-[#866d5b]">Tanda tangan digital sah</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#faf7f2] border border-[#ebdccd]">
              <div className="h-9 w-9 rounded-xl bg-[#ffedd5] flex items-center justify-center text-[#e86a28] shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-[#241a14]">Kebal Server Down</div>
                <div className="text-[11px] text-[#866d5b]">100% Mandiri tanpa cloud</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#faf7f2] border border-[#ebdccd]">
              <div className="h-9 w-9 rounded-xl bg-[#ffedd5] flex items-center justify-center text-[#e86a28] shrink-0">
                <Printer className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-[#241a14]">Thermal Struk 80mm</div>
                <div className="text-[11px] text-[#866d5b]">Printer kasir fisik siap pakai</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#faf7f2] border border-[#ebdccd]">
              <div className="h-9 w-9 rounded-xl bg-[#ffedd5] flex items-center justify-center text-[#e86a28] shrink-0">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-[#241a14]">Auto-Potong Stok</div>
                <div className="text-[11px] text-[#866d5b]">Sinkronisasi etalase POS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#ebdccd] bg-[#fbf8f3] py-8 text-center text-xs text-[#866d5b] font-mono">
        <p className="font-bold text-[#241a14]">MediQR &bull; Decentralized Clinical Prescription Protocol</p>
        <p className="mt-1 text-[11px]">Designed for high clinical usability, human warmth, and offline resilience.</p>
      </footer>
    </div>
  );
}
