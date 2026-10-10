'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Stethoscope,
  Store,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    {
      href: '/doctor',
      label: 'Portal Dokter',
      icon: Stethoscope,
      sub: 'Tulis & Cetak Struk',
    },
    {
      href: '/view',
      label: 'Viewer Pasien',
      icon: Smartphone,
      sub: 'Tampilan Resep HP',
    },
    {
      href: '/pharmacy',
      label: 'Kasir Apotek',
      icon: Store,
      sub: 'Scan & Kelola Stok',
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-950 text-white shadow-xs transition group-hover:bg-forest-900">
            <span className="font-mono font-bold text-xs tracking-tighter">RX</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-ink-900 tracking-tight text-base sm:text-lg">
              MediQR
            </span>
            <span className="text-[11px] font-medium text-ink-400 hidden sm:inline">
              / Sistem Resep Medis Mandiri
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? 'bg-ink-900 text-white shadow-xs'
                    : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Clinical Security Pill */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-forest-200 bg-forest-50/70 px-2.5 py-1 text-[11px] font-semibold text-forest-800">
          <ShieldCheck className="h-3.5 w-3.5 text-forest-700" />
          <span>Ed25519 Signed</span>
        </div>
      </div>
    </header>
  );
}
