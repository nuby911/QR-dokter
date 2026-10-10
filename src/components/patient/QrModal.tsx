'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, ShieldCheck } from 'lucide-react';
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
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate modal QR:', err));
  }, [isOpen, payload]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
          <QrCode className="h-6 w-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900">
          QR Code Resep Obat
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Tunjukkan layar ini kepada petugas apotek untuk dipindai.
        </p>

        {/* QR Code Display */}
        <div className="my-5 flex justify-center">
          {qrDataUrl ? (
            <div className="rounded-2xl border-2 border-teal-500/30 bg-white p-3 shadow-inner">
              <img
                src={qrDataUrl}
                alt="QR Code Resep"
                className="h-64 w-64 object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="h-64 w-64 animate-pulse rounded-2xl bg-slate-100" />
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 py-2 px-3 rounded-xl">
          <ShieldCheck className="h-4 w-4" /> Resep Asli Terverifikasi
        </div>

        <p className="mt-3 text-[11px] text-slate-400 font-mono">
          ID: {payload.id}
        </p>
      </div>
    </div>
  );
}
