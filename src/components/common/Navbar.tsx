'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/doctor', label: 'Dokter' },
    { href: '/view', label: 'Pasien' },
    { href: '/pharmacy', label: 'Apotek' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold bg-neutral-900 text-white px-2 py-0.5 rounded">
            Rx
          </span>
          <span className="font-bold tracking-tight text-sm text-neutral-900">
            MediQR
          </span>
          <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
            v1.0
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center gap-1">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Direct Link to Protocol */}
        <div className="hidden sm:flex items-center text-[11px] font-mono text-neutral-500">
          Ed25519 &bull; Stateless
        </div>
      </div>
    </header>
  );
}
