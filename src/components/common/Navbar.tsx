'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HeartPulse,
  Stethoscope,
  Store,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    {
      href: '/doctor',
      label: 'Portal Dokter',
      icon: Stethoscope,
      desc: 'Tulis Resep & Cetak QR',
    },
    {
      href: '/view',
      label: 'Viewer Pasien',
      icon: User,
      desc: 'Buka di Ponsel / Kamera',
    },
    {
      href: '/pharmacy',
      label: 'Portal Apotek',
      icon: Store,
      desc: 'Scan & Potong Stok',
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/20 transition group-hover:scale-105">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg flex items-center gap-1.5">
              MediQR <span className="text-teal-600 font-bold text-xs bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">Smart RX</span>
            </span>
            <span className="text-[10px] text-slate-400 block -mt-0.5 hidden sm:block">
              Resep Medis Cerdas Berbasis Smart QR
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Security Badge */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Ed25519 Secured</span>
        </div>
      </div>
    </header>
  );
}
