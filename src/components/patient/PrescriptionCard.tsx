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
        <div className="flex items-center justify-between rounded-full border border-emerald-200/80 bg-emerald-50/70 px-5 py-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
            <div>
              <span className="font-bold text-emerald-950">
                Resep Sah Terverifikasi (Ed25519)
              </span>
              <span className="text-emerald-800 block sm:inline sm:ml-2">
                Ditandatangani oleh {payload.doc.n} ({payload.doc.sip})
              </span>
            </div>
          </div>
          <span className="hidden sm:inline-block font-mono text-[11px] text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100/60">
            Kriptografis
          </span>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs text-red-900 shadow-sm">
          <ShieldAlert className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-red-950">
              Peringatan: Tanda Tangan Digital Tidak Cocok
            </span>
            <p className="mt-0.5 text-red-800 leading-relaxed">
              Integritas data resep ini gagal diverifikasi. Resep ini berisiko telah diubah atau dimanipulasi. Jangan tebus tanpa menghubungi dokter terkait.
            </p>
          </div>
        </div>
      )}

      {/* Clinical Prescription Sheet */}
      <div className="rounded-3xl border border-[#ebdccd] bg-white shadow-sm overflow-hidden">
        {/* Header Metadata */}
        <div className="border-b border-[#ebdccd]/60 p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <span className="rounded-full bg-[#f5ece1] text-[#e86a28] px-3 py-1 text-[11px] font-mono uppercase font-bold tracking-wider inline-block mb-2">
                LEMBAR RESEP ELEKTRONIK
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#241a14]">
                {payload.doc.faskes}
              </h1>
              <p className="text-xs sm:text-sm text-[#716358] mt-1">
                Dokter: {payload.doc.n} &bull; SIP: {payload.doc.sip}
              </p>
            </div>

            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-full bg-[#e86a28] hover:bg-[#d95a18] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-[0.99] shrink-0"
            >
              <QrCode className="h-4 w-4" />
              <span>Tunjukkan QR Apotek</span>
            </button>
          </div>

          {/* Demographics Strip */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl border border-[#ebdccd] bg-[#fbfbf8] p-4 text-xs">
            <div>
              <span className="font-mono text-[10px] uppercase text-[#a39487] block">
                Nama Pasien
              </span>
              <span className="font-bold text-[#241a14] mt-0.5 block">
                {payload.pat.n}
              </span>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase text-[#a39487] block">
                Usia / Gender
              </span>
              <span className="font-bold text-[#241a14] mt-0.5 block">
                {payload.pat.a} Th ({payload.pat.g === 'L' ? 'Laki-laki' : 'Perempuan'})
              </span>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase text-[#a39487] block">
                Tanggal Resep
              </span>
              <span className="font-mono font-bold text-[#241a14] mt-0.5 block">
                {payload.dt}
              </span>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase text-[#a39487] block">
                Nomor Referensi
              </span>
              <span className="font-mono font-bold text-[#241a14] mt-0.5 block">
                {payload.id}
              </span>
            </div>
          </div>
        </div>

        {/* Prescription Orders List */}
        <div className="p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono uppercase font-bold text-[#716358] border-b border-[#ebdccd]/60 pb-2.5">
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
                  className="rounded-2xl border border-[#ebdccd] bg-[#fbfbf8]/70 p-4 space-y-2.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="font-mono text-xs font-bold text-[#a39487]">
                        {idx + 1}.
                      </span>
                      <div>
                        <div className="font-bold text-[#241a14] text-sm">
                          {item.n}
                        </div>
                        <div className="text-[#716358] mt-0.5">
                          Signa: <span className="font-semibold text-[#241a14]">{item.s}</span>
                        </div>
                      </div>
                    </div>

                    <span className="font-mono font-bold text-[#241a14] bg-white border border-[#ebdccd] rounded-full px-3 py-0.5 text-xs">
                      No. {item.q}
                    </span>
                  </div>

                  {/* Clean text dosage tags without emojis */}
                  {(slots.length > 0 || isAntibiotic) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#ebdccd]/60 text-[11px]">
                      <span className="font-mono text-[10px] uppercase text-[#a39487] mr-1">
                        Jadwal:
                      </span>
                      {slots.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="rounded-full bg-white border border-[#ebdccd] px-2.5 py-0.5 font-medium text-[#241a14]"
                        >
                          {s}
                        </span>
                      ))}

                      {isAntibiotic && (
                        <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 font-semibold text-amber-900 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-amber-700" />
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
          <div className="rounded-2xl border border-[#ebdccd] bg-[#faf7f2] p-4 text-xs text-[#716358] leading-relaxed mt-4">
            <strong className="text-[#241a14] font-bold block mb-1">
              Instruksi Pengambilan Obat:
            </strong>
            Tunjukkan layar ponsel dengan QR code kepada staf farmasi apotek mitra untuk validasi dan penyerahan obat langsung di kasir.
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between border-t border-[#ebdccd]/60 bg-[#fbfbf8] p-4 sm:p-5 text-xs">
          <span className="font-mono text-[11px] text-[#a39487]">
            Protokol MediQR Mandiri &bull; Ed25519
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmark}
              className="flex items-center gap-1.5 rounded-full border border-[#ebdccd] bg-white px-4 py-2 font-semibold text-[#241a14] hover:bg-[#f5ece1] transition"
            >
              <BookmarkCheck className="h-3.5 w-3.5 text-[#e86a28]" />
              <span>{isBookmarked ? 'Tersimpan' : 'Simpan'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-full border border-[#ebdccd] bg-white px-4 py-2 font-semibold text-[#241a14] hover:bg-[#f5ece1] transition"
            >
              <Printer className="h-3.5 w-3.5 text-[#e86a28]" />
              <span>Cetak</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Button for Mobile Screens */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-3 sm:hidden bg-white/95 border-t border-[#ebdccd] shadow-lg">
        <button
          onClick={() => setIsQrModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#e86a28] py-3.5 text-xs font-bold text-white shadow-md active:scale-[0.99]"
        >
          <QrCode className="h-4 w-4" />
          <span>Tunjukkan QR ke Apoteker</span>
        </button>
      </div>
    </div>
  );
}
