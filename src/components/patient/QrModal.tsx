'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, ShieldCheck } from 'lucide-react';
import type { PrescriptionPayload } from '../../lib/types';
import { encodePrescriptionToUrl } from '../../lib/qr-codec';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: PrescriptionPayload;
}

export default function QrModal({ isOpen, onClose, payload }: QrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!isOpen || !payload) return;

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const fullUrl = currentUrl || encodePrescriptionToUrl(payload);

    QRCode.toDataURL(fullUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate modal QR:', err));
  }, [isOpen, payload]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl border border-neutral-200 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 rounded p-1.5 text-neutral-400 hover:text-neutral-900 transition"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
          KODE RESEP PASIEN
        </div>
        <h3 className="text-base font-bold text-neutral-900 tracking-tight">
          Pindai di Meja Apotek
        </h3>
        <p className="mt-1 text-xs text-neutral-500">
          Arahkan layar ponsel ini ke scanner petugas farmasi
        </p>

        {/* High-Contrast QR Code */}
        <div className="my-5 flex justify-center">
          {qrDataUrl ? (
            <div className="rounded border border-neutral-200 bg-white p-2">
              <img
                src={qrDataUrl}
                alt="QR Code Resep"
                className="h-60 w-60 object-contain"
              />
            </div>
          ) : (
            <div className="h-60 w-60 rounded bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">
              Membuat QR...
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-700 bg-neutral-50 py-2 px-3 rounded border border-neutral-200">
          <ShieldCheck className="h-4 w-4 text-emerald-700" />
          <span>Tanda Tangan Digital: dr. {payload.doc.n.replace(/^dr\.\s*/i, '')}</span>
        </div>

        <div className="mt-3 text-[11px] font-mono text-neutral-400">
          Ref: {payload.id}
        </div>
      </div>
    </div>
  );
}
