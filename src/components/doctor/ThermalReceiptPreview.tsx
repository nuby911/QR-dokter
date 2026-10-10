'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Printer, Download, ExternalLink, CheckCircle2, ShieldCheck } from 'lucide-react';
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
      margin: 2,
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
      <div className="flex h-full min-h-[460px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-400">
        <Printer className="mb-3 h-12 w-12 text-slate-300" />
        <p className="font-medium text-slate-600">Preview Struk Belum Tersedia</p>
        <p className="mt-1 text-sm text-slate-400">
          Isi data resep di sebelah kiri lalu klik tombol &quot;Terbitkan &amp; Buat Struk QR&quot;.
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
      {/* Action Toolbar (Hidden during printing) */}
      <div className="no-print mb-4 flex w-full max-w-sm flex-wrap items-center justify-between gap-2 rounded-xl bg-teal-50 p-3 text-teal-800">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-700">
          <ShieldCheck className="h-4 w-4 text-teal-600" />
          Resep Sah Bertanda Tangan
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownloadQr}
            className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            title="Download gambar QR Code"
          >
            <Download className="h-3.5 w-3.5" />
            QR
          </button>
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-teal-700 shadow-sm transition hover:bg-slate-50"
            title="Buka tampilan resep pasien di tab baru"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Viewer
          </a>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            <Printer className="h-3.5 w-3.5" />
            Cetak Struk
          </button>
        </div>
      </div>

      {/* Realistic Thermal Receipt Slip */}
      <div
        className="thermal-receipt-print-area w-full max-w-[340px] rounded-lg border border-slate-200 bg-white p-6 shadow-md font-mono text-slate-800"
        style={{ minWidth: '300px' }}
      >
        {/* Header */}
        <div className="border-b border-dashed border-slate-300 pb-4 text-center">
          <h2 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
            {payload.doc.faskes}
          </h2>
          <p className="text-xs text-slate-600">{payload.doc.n}</p>
          <p className="text-[10px] text-slate-500">{payload.doc.sip}</p>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
            <CheckCircle2 className="h-3 w-3" /> Digital Signed (Ed25519)
          </div>
        </div>

        {/* Prescription Metadata */}
        <div className="border-b border-dashed border-slate-300 py-3 text-[11px] leading-relaxed">
          <div className="flex justify-between">
            <span className="text-slate-500">No. Resep:</span>
            <span className="font-bold">{payload.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tanggal:</span>
            <span>{payload.dt}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Pasien:</span>
            <span className="font-semibold">{payload.pat.n} ({payload.pat.a} th / {payload.pat.g})</span>
          </div>
        </div>

        {/* Prescription Medications Items */}
        <div className="border-b border-dashed border-slate-300 py-3 text-[11px]">
          <div className="mb-2 font-bold text-slate-700 tracking-wider text-[10px] uppercase">
            R/ Resep Obat:
          </div>
          <div className="space-y-2.5">
            {payload.rx.map((item, idx) => (
              <div key={idx} className="leading-snug">
                <div className="flex justify-between font-semibold">
                  <span>{idx + 1}. {item.n}</span>
                  <span>No. {item.q}</span>
                </div>
                <div className="pl-3 text-[10px] text-slate-600 italic">
                  S. {item.s}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High Contrast QR Code Area */}
        <div className="py-4 text-center">
          {qrDataUrl && (
            <div className="inline-block rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
              <img
                src={qrDataUrl}
                alt="QR Resep Obat"
                className="mx-auto h-48 w-48 object-contain"
              />
            </div>
          )}
          <p className="mt-2 text-[10px] font-bold text-slate-700 tracking-wide">
            SCAN QR UNTUK TEBUS OBAT
          </p>
          <p className="text-[9px] text-slate-400 leading-tight">
            Dapat discan di seluruh apotek mitra &amp; kamera HP pasien
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-dashed border-slate-300 pt-3 text-center text-[9px] text-slate-400">
          <p>Resep Digital Mandiri • Tanpa Server Pusat</p>
          <p className="mt-0.5 truncate font-mono text-[8px] text-slate-300">
            Sig: {payload.sig.slice(0, 24)}...
          </p>
        </div>
      </div>
    </div>
  );
}
