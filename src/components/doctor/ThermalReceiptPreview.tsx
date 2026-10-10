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
      <div className="flex h-full min-h-[460px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 bg-white/50 p-8 text-center text-ink-400">
        <Printer className="mb-3 h-10 w-10 text-ink-300" />
        <p className="font-semibold text-ink-700 text-sm">Preview Struk Belum Tersedia</p>
        <p className="mt-1 text-xs text-ink-400 max-w-xs">
          Isi data resep lalu klik tombol &quot;Terbitkan &amp; Buat Struk QR&quot; untuk menghasilkan struk thermal kasir.
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
      <div className="no-print mb-4 flex w-full max-w-xs flex-wrap items-center justify-between gap-2 rounded-xl border border-ink-200 bg-white p-2.5 text-xs text-ink-700 shadow-2xs">
        <span className="flex items-center gap-1.5 font-semibold text-forest-800 text-[11px]">
          <ShieldCheck className="h-4 w-4 text-forest-700" />
          Resep Sah
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownloadQr}
            className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:bg-ink-50 transition shadow-2xs"
            title="Download gambar QR Code"
          >
            <Download className="h-3 w-3 inline mr-1" />
            QR
          </button>
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:bg-ink-50 transition shadow-2xs"
            title="Buka tampilan resep pasien di tab baru"
          >
            <ExternalLink className="h-3 w-3 inline mr-1" />
            Viewer
          </a>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 rounded-lg bg-ink-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs hover:bg-ink-800 transition"
          >
            <Printer className="h-3 w-3" />
            Cetak
          </button>
        </div>
      </div>

      {/* Authentic Thermal Receipt Paper Slip */}
      <div
        className="thermal-receipt-print-area relative w-full max-w-[320px] bg-white shadow-md font-mono text-ink-900 overflow-hidden"
        style={{ minWidth: '290px' }}
      >
        {/* Top Serrated Edge */}
        <div className="receipt-tear-top no-print" />

        <div className="p-5 text-xs space-y-3">
          {/* Clinic Header */}
          <div className="border-b border-dashed border-ink-300 pb-3 text-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-900">
              {payload.doc.faskes}
            </h2>
            <p className="text-[11px] text-ink-700 font-semibold">{payload.doc.n}</p>
            <p className="text-[9px] text-ink-500">{payload.doc.sip}</p>
          </div>

          {/* Demographics */}
          <div className="border-b border-dashed border-ink-300 pb-2.5 text-[10px] space-y-1">
            <div className="flex justify-between">
              <span className="text-ink-500">No. Resep:</span>
              <span className="font-bold">{payload.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Tanggal:</span>
              <span>{payload.dt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Pasien:</span>
              <span className="font-bold">{payload.pat.n} ({payload.pat.a} th / {payload.pat.g})</span>
            </div>
          </div>

          {/* Rx Orders List */}
          <div className="border-b border-dashed border-ink-300 pb-3 text-[10px]">
            <div className="mb-2 font-bold text-ink-900 tracking-wider text-[11px]">
              R/ RESEP OBAT:
            </div>
            <div className="space-y-2.5">
              {payload.rx.map((item, idx) => (
                <div key={idx} className="leading-tight">
                  <div className="flex justify-between font-bold">
                    <span>{idx + 1}. {item.n}</span>
                    <span>No. {item.q}</span>
                  </div>
                  <div className="pl-3 text-[9px] text-ink-600 italic mt-0.5">
                    S. {item.s}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High Contrast QR Code */}
          <div className="py-2 text-center">
            {qrDataUrl && (
              <div className="inline-block p-1 bg-white border border-ink-300">
                <img
                  src={qrDataUrl}
                  alt="QR Code Resep"
                  className="mx-auto h-44 w-44 object-contain"
                />
              </div>
            )}
            <p className="mt-1.5 text-[9px] font-bold uppercase tracking-wider text-ink-900">
              SCAN QR UNTUK TEBUS OBAT
            </p>
            <p className="text-[8px] text-ink-500">
              Dapat ditebus di seluruh apotek mitra
            </p>
          </div>

          {/* Digital Signature Audit Stamp */}
          <div className="border-t border-dashed border-ink-300 pt-2 text-center text-[8px] text-ink-400">
            <p>TERVERIFIKASI KRIPTOGRAFI ED25519</p>
            <p className="truncate font-mono text-[7px] text-ink-300 mt-0.5">
              SIG: {payload.sig.slice(0, 32)}...
            </p>
          </div>
        </div>

        {/* Bottom Serrated Edge */}
        <div className="receipt-tear-bottom no-print" />
      </div>
    </div>
  );
}
