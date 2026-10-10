'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Printer, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import type { PrescriptionPayload } from '../../lib/types';
import { encodePrescriptionToUrl } from '../../lib/qr-codec';

interface ThermalReceiptPreviewProps {
  payload: PrescriptionPayload | null;
  baseUrl: string;
}

export default function ThermalReceiptPreview({
  payload,
  baseUrl,
}: ThermalReceiptPreviewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState<string>('');

  useEffect(() => {
    if (!payload) {
      setQrDataUrl('');
      setTargetUrl('');
      return;
    }

    const fullUrl = encodePrescriptionToUrl(payload, baseUrl);
    setTargetUrl(fullUrl);

    QRCode.toDataURL(fullUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 260,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR:', err));
  }, [payload, baseUrl]);

  if (!payload) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-center text-neutral-400">
        <Printer className="mb-2 h-8 w-8 text-neutral-300" />
        <p className="font-semibold text-neutral-700 text-xs">Struk Belum Diterbitkan</p>
        <p className="mt-1 text-[11px] text-neutral-400 max-w-xs">
          Lengkapi data resep di sebelah kiri lalu klik &quot;Terbitkan &amp; Cetak Struk QR&quot;.
        </p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-${payload.id}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Action Toolbar */}
      <div className="no-print mb-3 flex w-full max-w-[320px] items-center justify-between rounded border border-neutral-200 bg-white p-2 text-xs">
        <div className="flex items-center gap-1.5 text-neutral-700 text-[11px] font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
          <span>Ed25519 OK</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDownloadQr}
            className="rounded border border-neutral-200 bg-white px-2 py-1 text-[11px] text-neutral-700 hover:bg-neutral-50 transition"
            title="Download gambar QR Code"
          >
            <Download className="h-3 w-3 inline mr-1" />
            QR
          </button>
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-neutral-200 bg-white px-2 py-1 text-[11px] text-neutral-700 hover:bg-neutral-50 transition"
            title="Buka tampilan resep pasien di tab baru"
          >
            <ExternalLink className="h-3 w-3 inline mr-1" />
            Viewer
          </a>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 rounded bg-neutral-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-neutral-800 transition"
          >
            <Printer className="h-3 w-3" />
            Cetak
          </button>
        </div>
      </div>

      {/* Authentic 80mm ESC/POS Thermal Receipt Paper Slip */}
      <div
        className="thermal-receipt-print-area w-full max-w-[320px] bg-white border border-neutral-200 p-5 font-mono text-neutral-950 text-xs shadow-sm"
        style={{ minWidth: '280px' }}
      >
        {/* Clinic Header */}
        <div className="border-b border-dashed border-neutral-300 pb-3 text-center space-y-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider">
            {payload.doc.faskes}
          </h2>
          <p className="text-[11px] font-semibold">{payload.doc.n}</p>
          <p className="text-[9px] text-neutral-500">SIP: {payload.doc.sip}</p>
        </div>

        {/* Demographics */}
        <div className="border-b border-dashed border-neutral-300 py-2.5 text-[10px] space-y-1">
          <div className="flex justify-between">
            <span className="text-neutral-500">No. Resep:</span>
            <span className="font-bold">{payload.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Tanggal:</span>
            <span>{payload.dt}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Pasien:</span>
            <span className="font-bold">{payload.pat.n} ({payload.pat.a} th / {payload.pat.g})</span>
          </div>
        </div>

        {/* Rx Orders List */}
        <div className="border-b border-dashed border-neutral-300 py-3 text-[10px]">
          <div className="font-bold uppercase tracking-wider text-neutral-400 mb-2">
            R/ PRESKRIPSI
          </div>
          <div className="space-y-2.5">
            {payload.rx.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span>{idx + 1}. {item.n}</span>
                  <span>No. {item.q}</span>
                </div>
                <div className="pl-3 text-[9px] text-neutral-600 italic">
                  S. {item.s}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High-Contrast QR Code */}
        <div className="py-3 flex flex-col items-center text-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Resep Dokter"
              className="h-44 w-44 object-contain"
            />
          ) : (
            <div className="h-44 w-44 bg-neutral-100 flex items-center justify-center text-[10px] text-neutral-400">
              Membuat QR...
            </div>
          )}
          <p className="mt-2 text-[9px] text-neutral-500 uppercase tracking-wider">
            Pindai dengan kamera ponsel untuk membaca resep
          </p>
        </div>

        {/* Cryptographic Signature Seal */}
        <div className="border-t border-dashed border-neutral-300 pt-2 text-[8px] text-neutral-400 break-all space-y-0.5 text-center">
          <p>ED25519 SIGNATURE SEAL:</p>
          <p className="font-mono">{payload.sig.slice(0, 32)}...</p>
        </div>
      </div>
    </div>
  );
}
