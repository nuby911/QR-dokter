'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Stethoscope, Smartphone, Store, QrCode } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/doctor', label: 'Dokter' },
    { href: '/view', label: 'Pasien' },
    { href: '/pharmacy', label: 'Apotek' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#faf7f2]/90 backdrop-blur-md border-b border-[#ebdccd]/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Brand with warm terracotta logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e86a28] text-white shadow-sm transition group-hover:scale-105">
            <span className="font-mono font-extrabold text-sm tracking-tight">Rx</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-base text-[#241a14]">
              MediQR
            </span>
            <span className="text-[10px] font-mono tracking-wider text-[#937866] uppercase -mt-1 hidden sm:block">
              Clinical Protocol
            </span>
          </div>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#f3e8dc]/70 rounded-full p-1 border border-[#ebdccd]">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#241a14] text-white shadow-xs'
                    : 'text-[#6f5645] hover:text-[#241a14] hover:bg-[#eae0d2]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/pharmacy"
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#ebdccd] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#5a4332] hover:bg-[#f6efe7] transition shadow-2xs"
          >
            <QrCode className="h-3.5 w-3.5 text-[#e86a28]" />
            <span>Scan Resep</span>
          </Link>
          <Link
            href="/doctor"
            className="flex items-center gap-1.5 rounded-full bg-[#e86a28] hover:bg-[#d95a18] text-white px-4 py-1.5 text-xs font-bold shadow-sm transition active:scale-95"
          >
            <Stethoscope className="h-3.5 w-3.5" />
            <span>Tulis Resep</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
