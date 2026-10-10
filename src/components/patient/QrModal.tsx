'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, ShieldCheck, Sun } from 'lucide-react';
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
      width: 320,
      color: {
        dark: '#09090b',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate modal QR:', err));
  }, [isOpen, payload]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center border border-ink-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-800">
          <QrCode className="h-5 w-5" />
        </div>

        <h3 className="text-base font-bold text-ink-900 tracking-tight">
          QR Code Resep Obat
        </h3>
        <p className="mt-1 text-xs text-ink-500">
          Tunjukkan layar ini kepada petugas apotek untuk dipindai.
        </p>

        {/* QR Code Canvas */}
        <div className="my-5 flex justify-center">
          {qrDataUrl ? (
            <div className="rounded-2xl border border-ink-200 bg-white p-3 shadow-inner">
              <img
                src={qrDataUrl}
                alt="QR Code Resep"
                className="h-64 w-64 object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="h-64 w-64 animate-pulse rounded-2xl bg-ink-100" />
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-forest-800 bg-forest-50/80 py-2 px-3 rounded-xl border border-forest-100">
          <ShieldCheck className="h-4 w-4 text-forest-700" /> 
          <span>Tanda Tangan Asli dr. {payload.doc.n.replace(/^dr\.\s*/i, '')}</span>
        </div>

        <p className="mt-3 text-[11px] text-ink-400 font-mono">
          Ref: {payload.id}
        </p>
      </div>
    </div>
  );
}
