'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  QrCode,
  Printer,
  BookmarkCheck,
  AlertCircle,
} from 'lucide-react';
import type { PrescriptionPayload } from '../../lib/types';
import QrModal from './QrModal';

interface PrescriptionCardProps {
  payload: PrescriptionPayload;
  isValidSignature: boolean;
}

// Parse dosage instructions into clean text tokens
function parseDosageSlots(sig: string): string[] {
  const lower = sig.toLowerCase();
  const slots: string[] = [];

  if (lower.includes('3x') || lower.includes('3 x') || lower.includes('tiga kali')) {
    slots.push('Pagi', 'Siang', 'Malam');
  } else if (lower.includes('2x') || lower.includes('2 x') || lower.includes('dua kali')) {
    slots.push('Pagi', 'Malam');
  } else if (lower.includes('1x') || lower.includes('1 x') || lower.includes('satu kali')) {
    if (lower.includes('malam')) {
      slots.push('Malam');
    } else {
      slots.push('1x Sehari');
    }
  }

  return slots;
}

export default function PrescriptionCard({
  payload,
  isValidSignature,
}: PrescriptionCardProps) {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleBookmark = () => {
    setIsBookmarked(true);
    setTimeout(() => setIsBookmarked(false), 2500);
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-4">
      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        payload={payload}
      />

      {/* Verification Status Header */}
      {isValidSignature ? (
        <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
            <div>
              <span className="font-semibold text-neutral-900">
                Resep Sah Terverifikasi (Ed25519)
              </span>
              <span className="text-neutral-500 block sm:inline sm:ml-2">
                Ditandatangani oleh {payload.doc.n} ({payload.doc.sip})
              </span>
            </div>
          </div>
          <span className="hidden sm:inline-block font-mono text-[11px] text-neutral-500">
            Kriptografis
          </span>
        </div>
      ) : (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-900">
          <ShieldAlert className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">
              Peringatan: Tanda Tangan Digital Tidak Cocok
            </span>
            <p className="mt-0.5 text-red-800">
              Integritas data resep ini gagal diverifikasi. Resep ini berisiko telah diubah atau dimanipulasi. Jangan tebus tanpa menghubungi dokter terkait.
            </p>
          </div>
        </div>
      )}

      {/* Clinical Prescription Sheet */}
      <div className="rounded-lg border border-neutral-200 bg-white">
        {/* Header Metadata */}
        <div className="border-b border-neutral-200 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 block mb-1">
                LEMBAR RESEP ELEKTRONIK
              </span>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900">
                {payload.doc.faskes}
              </h1>
              <p className="text-xs text-neutral-600 mt-0.5">
                Dokter: {payload.doc.n} &bull; SIP: {payload.doc.sip}
              </p>
            </div>

            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition"
            >
              <QrCode className="h-4 w-4" />
              <span>Tunjukkan QR Apotek</span>
            </button>
          </div>

          {/* Demographics Strip */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-neutral-100 pt-4 text-xs">
            <div>
              <span className="font-mono text-[10px] uppercase text-neutral-400 block">
                Nama Pasien
              </span>
              <span className="font-semibold text-neutral-900">
                {payload.pat.n}
              </span>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase text-neutral-400 block">
                Usia / Gender
              </span>
              <span className="font-semibold text-neutral-900">
                {payload.pat.a} Th ({payload.pat.g === 'L' ? 'Laki-laki' : 'Perempuan'})
              </span>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase text-neutral-400 block">
                Tanggal Resep
              </span>
              <span className="font-mono font-medium text-neutral-900">
                {payload.dt}
              </span>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase text-neutral-400 block">
                Nomor Referensi
              </span>
              <span className="font-mono font-medium text-neutral-900">
                {payload.id}
              </span>
            </div>
          </div>
        </div>

        {/* Prescription Orders List */}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-neutral-400 border-b border-neutral-100 pb-2">
            <span>Daftar Obat (R/)</span>
            <span>Jumlah</span>
          </div>

          <div className="space-y-3 pt-1">
            {payload.rx.map((item, idx) => {
              const slots = parseDosageSlots(item.s);
              const isAntibiotic = item.s.toLowerCase().includes('habiskan');

              return (
                <div
                  key={idx}
                  className="rounded border border-neutral-200 bg-neutral-50/50 p-4 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="font-mono text-xs font-bold text-neutral-400">
                        {idx + 1}.
                      </span>
                      <div>
                        <div className="font-bold text-neutral-900 text-sm">
                          {item.n}
                        </div>
                        <div className="text-neutral-600 mt-1">
                          Signa: <span className="font-medium text-neutral-900">{item.s}</span>
                        </div>
                      </div>
                    </div>

                    <span className="font-mono font-semibold text-neutral-900 bg-white border border-neutral-200 rounded px-2 py-0.5 text-xs">
                      No. {item.q}
                    </span>
                  </div>

                  {/* Clean text dosage tags without emojis */}
                  {(slots.length > 0 || isAntibiotic) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-200/60 text-[11px]">
                      <span className="font-mono text-[10px] uppercase text-neutral-400 mr-1">
                        Jadwal:
                      </span>
                      {slots.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="rounded bg-white border border-neutral-200 px-2 py-0.5 font-medium text-neutral-700"
                        >
                          {s}
                        </span>
                      ))}

                      {isAntibiotic && (
                        <span className="rounded bg-amber-50 border border-amber-200 px-2 py-0.5 font-medium text-amber-900 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Habiskan Sesuai Dosis
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Simple Guidance Note */}
          <div className="rounded border border-neutral-200 bg-white p-3.5 text-xs text-neutral-500 leading-relaxed mt-4">
            <strong className="text-neutral-800 font-semibold block mb-0.5">
              Instruksi Pengambilan Obat:
            </strong>
            Tunjukkan layar ponsel dengan QR code kepada staf farmasi apotek mitra untuk validasi dan penyerahan obat.
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 p-4 text-xs">
          <span className="font-mono text-[11px] text-neutral-400">
            Protokol MediQR Mandiri
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmark}
              className="flex items-center gap-1.5 rounded border border-neutral-200 bg-white px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 transition"
            >
              <BookmarkCheck className="h-3.5 w-3.5 text-neutral-500" />
              <span>{isBookmarked ? 'Tersimpan' : 'Simpan'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded border border-neutral-200 bg-white px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 transition"
            >
              <Printer className="h-3.5 w-3.5 text-neutral-500" />
              <span>Cetak</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Button for Mobile Screens */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-3 sm:hidden bg-white/95 border-t border-neutral-200">
        <button
          onClick={() => setIsQrModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded bg-neutral-900 py-3 text-xs font-semibold text-white shadow-sm"
        >
          <QrCode className="h-4 w-4" />
          <span>Tunjukkan QR ke Apoteker</span>
        </button>
      </div>
    </div>
  );
}
