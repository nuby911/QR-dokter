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
      margin: 4, // ISO/IEC 18004 Quiet Zone standard
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl border border-[#ebdccd] text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-[#fbfbf8] hover:bg-[#f5ece1] p-2 text-[#716358] hover:text-[#241a14] transition"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="rounded-full bg-[#f5ece1] text-[#e86a28] px-3 py-1 text-[11px] font-mono uppercase font-bold tracking-wider inline-block mb-2">
          KODE RESEP PASIEN
        </div>
        <h3 className="text-lg font-black text-[#241a14] tracking-tight">
          Pindai di Meja Apotek
        </h3>
        <p className="mt-1 text-xs text-[#716358]">
          Arahkan layar ponsel ini ke scanner petugas farmasi
        </p>

        {/* High-Contrast QR Code */}
        <div className="my-5 flex justify-center">
          {qrDataUrl ? (
            <div className="rounded-2xl border border-[#ebdccd] bg-white p-3 shadow-sm">
              <img
                src={qrDataUrl}
                alt="QR Code Resep"
                className="h-60 w-60 object-contain"
              />
            </div>
          ) : (
            <div className="h-60 w-60 rounded-2xl bg-[#faf7f2] flex items-center justify-center text-xs text-[#a39487]">
              Membuat QR...
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-900 bg-emerald-50 py-2 px-3 rounded-full border border-emerald-200/80 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>Tanda Tangan Digital: dr. {(payload.doc?.n || 'Dokter').replace(/^dr\.\s*/i, '')}</span>
        </div>

        <div className="mt-3 text-[11px] font-mono text-[#a39487]">
          Ref: {payload.id}
        </div>
      </div>
    </div>
  );
}
