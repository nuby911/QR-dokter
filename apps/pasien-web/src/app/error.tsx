'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[MediQR Pasien] Runtime error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl border border-red-200 bg-white p-7 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-black text-[#241a14] tracking-tight">
          Terjadi Gangguan Tampilan
        </h2>
        <p className="mt-1.5 text-xs text-[#716358] leading-relaxed">
          Portal pasien mengalami kendala saat membaca data lembar resep. Silakan muat ulang halaman atau periksa kembali tautan resep Anda.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 rounded-full bg-[#e86a28] hover:bg-[#d95a18] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-[0.99]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Coba Lagi</span>
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/';
              }
            }}
            className="rounded-full border border-[#ebdccd] bg-white px-4 py-2.5 text-xs font-semibold text-[#241a14] hover:bg-[#f5ece1] transition"
          >
            Halaman Utama
          </button>
        </div>
      </div>
    </div>
  );
}
