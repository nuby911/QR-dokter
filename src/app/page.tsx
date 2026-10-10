'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, Cpu, Printer, Database } from 'lucide-react';
import Navbar from '../components/common/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fbfbfb] text-neutral-900">
      <Navbar />

      {/* Hero Section */}
      <main className="mx-auto max-w-5xl px-4 pt-12 pb-20 sm:px-6">
        <div className="border-b border-neutral-200 pb-10">
          <div className="inline-block text-[11px] font-mono text-neutral-500 uppercase tracking-widest mb-3">
            Protokol E-Preskripsi Mandiri
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 max-w-2xl leading-tight">
            Sistem Resep Medis Tanpa Server Pusat.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-neutral-600 max-w-xl leading-relaxed">
            Data resep ditandatangani secara kriptografis menggunakan algoritma Ed25519 dan dikompresi langsung ke dalam kode QR mandiri. Tidak memerlukan database cloud, tahan gangguan jaringan, dan kompatibel dengan printer kasir thermal standar.
          </p>
        </div>

        {/* 3 Workstation Navigation Cards */}
        <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Dokter */}
          <Link
            href="/doctor"
            className="group flex flex-col justify-between p-5 rounded-lg border border-neutral-200 bg-white hover:border-neutral-900 transition"
          >
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <span className="font-mono text-[11px] font-bold text-neutral-400">01</span>
                <ArrowUpRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 transition" />
              </div>
              <h2 className="text-base font-bold text-neutral-900">Portal Dokter</h2>
              <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
                Penulisan resep dengan format diagnosis medis, penandatanganan digital otomatis, dan pratinjau struk thermal 80mm.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-900">
              <span>Buka Terminal</span>
              <span className="font-mono text-[11px] text-neutral-400">/doctor</span>
            </div>
          </Link>

          {/* 2. Pasien */}
          <Link
            href="/view"
            className="group flex flex-col justify-between p-5 rounded-lg border border-neutral-200 bg-white hover:border-neutral-900 transition"
          >
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <span className="font-mono text-[11px] font-bold text-neutral-400">02</span>
                <ArrowUpRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 transition" />
              </div>
              <h2 className="text-base font-bold text-neutral-900">Viewer Pasien</h2>
              <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
                Akses mobile instan tanpa aplikasi untuk melihat instruksi minum obat dan verifikasi legalitas dokter.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-900">
              <span>Buka Viewer</span>
              <span className="font-mono text-[11px] text-neutral-400">/view</span>
            </div>
          </Link>

          {/* 3. Apotek */}
          <Link
            href="/pharmacy"
            className="group flex flex-col justify-between p-5 rounded-lg border border-neutral-200 bg-white hover:border-neutral-900 transition"
          >
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <span className="font-mono text-[11px] font-bold text-neutral-400">03</span>
                <ArrowUpRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 transition" />
              </div>
              <h2 className="text-base font-bold text-neutral-900">Kasir Apotek</h2>
              <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
                Pemindai QR struk untuk verifikasi keaslian, pencocokan obat etalase, dan pemotongan stok otomatis.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-900">
              <span>Buka POS</span>
              <span className="font-mono text-[11px] text-neutral-400">/pharmacy</span>
            </div>
          </Link>
        </div>

        {/* Technical Architecture Specs */}
        <div className="mt-12 rounded-lg border border-neutral-200 bg-white p-6">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4">
            Spesifikasi Arsitektur Sistem
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-neutral-900 mb-1">
                <ShieldCheck className="h-4 w-4 text-neutral-700" />
                <span>Kriptografi</span>
              </div>
              <p className="text-neutral-500 font-mono text-[11px]">
                Ed25519 Asymmetric (Pure JS SHA-512 fallback)
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 font-semibold text-neutral-900 mb-1">
                <Cpu className="h-4 w-4 text-neutral-700" />
                <span>Kompresi</span>
              </div>
              <p className="text-neutral-500 font-mono text-[11px]">
                LZ-String UTF-16 URI Component Safe
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 font-semibold text-neutral-900 mb-1">
                <Printer className="h-4 w-4 text-neutral-700" />
                <span>Output Fisik</span>
              </div>
              <p className="text-neutral-500 font-mono text-[11px]">
                80mm / 58mm ESC/POS Thermal Receipt
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 font-semibold text-neutral-900 mb-1">
                <Database className="h-4 w-4 text-neutral-700" />
                <span>Penyimpanan</span>
              </div>
              <p className="text-neutral-500 font-mono text-[11px]">
                Stateless URL Hash (#d=...) + Local POS Cache
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Testing Guide */}
        <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3">
            Panduan Uji Coba Lapangan
          </div>
          <ol className="space-y-3 text-xs text-neutral-600 list-decimal list-inside">
            <li className="leading-relaxed">
              <strong className="text-neutral-900">Buka Portal Dokter:</strong> Masukkan data resep atau gunakan template cepat, lalu klik &quot;Terbitkan &amp; Buat Struk QR&quot;.
            </li>
            <li className="leading-relaxed">
              <strong className="text-neutral-900">Pindai dengan Kamera HP:</strong> Arahkan kamera ponsel Anda ke QR di struk thermal untuk membuka lembar resep pasien.
            </li>
            <li className="leading-relaxed">
              <strong className="text-neutral-900">Penebusan di Apotek:</strong> Buka portal apotek di laptop untuk memindai resep dan memproses pemotongan stok obat.
            </li>
          </ol>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-6 text-center text-xs font-mono text-neutral-400">
        MediQR &bull; Decentralized Electronic Prescription Protocol
      </footer>
    </div>
  );
}
