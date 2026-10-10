'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  QrCode,
  Calendar,
  User,
  Clock,
  Printer,
  BookmarkCheck,
  Building2,
  Sun,
  Sunrise,
  Moon,
  AlertCircle,
  FileText,
} from 'lucide-react';
import type { PrescriptionPayload, PrescriptionItem } from '../../lib/types';
import QrModal from './QrModal';

interface PrescriptionCardProps {
  payload: PrescriptionPayload;
  isValidSignature: boolean;
}

// Helper to determine dosage schedule chips
function parseDosageSchedule(sig: string): {
  slots: { label: string; icon: any }[];
  isAntibiotic: boolean;
} {
  const lower = sig.toLowerCase();
  const isAntibiotic = lower.includes('habiskan');
  const slots: { label: string; icon: any }[] = [];

  if (lower.includes('3x') || lower.includes('3 x') || lower.includes('tiga kali')) {
    slots.push({ label: 'Pagi', icon: Sunrise });
    slots.push({ label: 'Siang', icon: Sun });
    slots.push({ label: 'Malam', icon: Moon });
  } else if (lower.includes('2x') || lower.includes('2 x') || lower.includes('dua kali')) {
    slots.push({ label: 'Pagi', icon: Sunrise });
    slots.push({ label: 'Malam', icon: Moon });
  } else if (lower.includes('1x') || lower.includes('1 x') || lower.includes('satu kali')) {
    if (lower.includes('malam')) {
      slots.push({ label: 'Malam Hari', icon: Moon });
    } else {
      slots.push({ label: '1x Sehari', icon: Sun });
    }
  } else {
    slots.push({ label: 'Sesuai Anjuran', icon: Clock });
  }

  return { slots, isAntibiotic };
}

// Helper to infer medicine form badge
function inferMedicineForm(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('kapsul') || lower.includes('cap')) return 'Kapsul';
  if (lower.includes('kaplet')) return 'Kaplet';
  if (lower.includes('sirup') || lower.includes('syrup') || lower.includes('drop')) return 'Sirup';
  if (lower.includes('salep') || lower.includes('cream') || lower.includes('gel')) return 'Salep';
  return 'Tablet';
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
    setTimeout(() => setIsBookmarked(false), 3000);
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        payload={payload}
      />

      {/* Security Verification Banner */}
      {isValidSignature ? (
        <div className="flex items-center justify-between rounded-xl border border-forest-200 bg-forest-50/80 px-4 py-3 text-xs text-forest-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-700 text-white">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-bold text-forest-950">
                Resep Sah Terverifikasi (Kriptografi Ed25519)
              </span>
              <p className="text-[11px] text-forest-700 mt-0.5">
                Diterbitkan resmi oleh <strong>{payload.doc.n}</strong> ({payload.doc.sip})
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block font-mono text-[10px] text-forest-600 bg-forest-100/70 px-2 py-0.5 rounded">
            Tanda Tangan Asli
          </span>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs text-rose-950 shadow-2xs">
          <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-900 text-sm">
              Peringatan: Tanda Tangan Kriptografi Tidak Valid!
            </span>
            <p className="text-[11px] text-rose-800 mt-0.5">
              Data resep ini tidak cocok dengan kunci digital dokter. Resep kemungkinan telah diubah atau dipalsukan. Jangan tebus resep ini tanpa konfirmasi dokter.
            </p>
          </div>
        </div>
      )}

      {/* Main Digital Prescription Pass / Ticket Style */}
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-xs">
        {/* Ticket Header Stub */}
        <div className="border-b border-ink-200 bg-ink-50/50 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800">
                <Building2 className="h-3.5 w-3.5 text-forest-700" />
                <span>{payload.doc.faskes}</span>
              </div>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">
                Lembar Resep Medis Pasien
              </h1>
              <p className="font-mono text-xs text-ink-400 mt-0.5">
                Ref: {payload.id}
              </p>
            </div>

            {/* Quick Action Button for Pharmacist */}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-forest-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-forest-900 active:scale-98"
            >
              <QrCode className="h-4 w-4" />
              Tunjukkan QR ke Apoteker
            </button>
          </div>

          {/* Demographics Strip */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-ink-200/80 pt-4 text-xs">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400 block">
                Pasien
              </span>
              <span className="font-semibold text-ink-900">
                {payload.pat.n}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400 block">
                Usia / Gender
              </span>
              <span className="font-semibold text-ink-900">
                {payload.pat.a} Tahun ({payload.pat.g === 'L' ? 'Laki-laki' : 'Perempuan'})
              </span>
            </div>

            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400 block">
                Tanggal Terbit
              </span>
              <span className="font-semibold text-ink-900 font-mono">
                {payload.dt}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400 block">
                Dokter Pemeriksa
              </span>
              <span className="font-semibold text-ink-900">
                {payload.doc.n}
              </span>
            </div>
          </div>
        </div>

        {/* Perforated Decorative Line */}
        <div className="perforated-divider h-px w-full" />

        {/* Medications Order List */}
        <div className="p-5 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-forest-700" />
              Rincian Obat yang Diresepkan ({payload.rx.length} Item)
            </h2>
            <span className="text-[11px] text-ink-400">
              Ikuti jadwal konsumsi dokter
            </span>
          </div>

          <div className="space-y-3">
            {payload.rx.map((item, idx) => {
              const { slots, isAntibiotic } = parseDosageSchedule(item.s);
              const formType = inferMedicineForm(item.n);

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-ink-200 bg-white p-4 transition hover:border-ink-300 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ink-100 text-xs font-mono font-bold text-ink-700">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-ink-900 text-sm sm:text-base">
                            {item.n}
                          </h3>
                          <span className="rounded-md border border-ink-200 bg-ink-50 px-2 py-0.5 text-[10px] font-medium text-ink-600">
                            {formType}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-ink-700 font-medium">
                          Aturan Pakai: <span className="text-ink-900">{item.s}</span>
                        </p>
                      </div>
                    </div>

                    <span className="rounded-lg bg-ink-50 border border-ink-200 px-2.5 py-1 text-xs font-mono font-bold text-ink-800 shrink-0">
                      Qty: {item.q}
                    </span>
                  </div>

                  {/* Visual Dosage Schedule Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-ink-100">
                    <span className="text-[10px] uppercase font-bold text-ink-400 tracking-wider mr-1">
                      Waktu Minum:
                    </span>
                    {slots.map((slot, sIdx) => {
                      const SlotIcon = slot.icon;
                      return (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1 rounded-md bg-forest-50 border border-forest-100 px-2 py-0.5 text-[11px] font-medium text-forest-800"
                        >
                          <SlotIcon className="h-3 w-3 text-forest-600" />
                          {slot.label}
                        </span>
                      );
                    })}

                    {isAntibiotic && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                        <AlertCircle className="h-3 w-3 text-amber-600" />
                        Wajib Dihabiskan
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clinical Advice Box */}
          <div className="rounded-xl border border-ink-200/80 bg-ink-50/60 p-4 text-xs text-ink-600 space-y-1 leading-relaxed">
            <p className="font-semibold text-ink-900">
              ℹ️ Catatan Penting Pasien:
            </p>
            <p>
              • Resep digital ini <strong>tidak akan hangus</strong> dan tersimpan sebagai catatan riwayat medis pribadi Anda.
            </p>
            <p>
              • Untuk menebus obat di apotek, tunjukkan layar QR code ini kepada petugas farmasi untuk dipindai secara langsung.
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 bg-ink-50/40 p-4 sm:px-7">
          <span className="text-[11px] text-ink-400 font-mono">
            MediQR Zero-Knowledge Protocol
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmark}
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 transition shadow-2xs"
            >
              <BookmarkCheck className="h-3.5 w-3.5 text-forest-600" />
              {isBookmarked ? 'Tersimpan!' : 'Simpan Resep'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 transition shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5 text-ink-500" />
              Cetak / PDF
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Sticky Bar for Mobile Screens */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-3 sm:hidden bg-white/95 backdrop-blur-md border-t border-ink-200 shadow-lg">
        <button
          onClick={() => setIsQrModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest-950 py-3 text-xs font-bold text-white shadow-md active:scale-98 transition"
        >
          <QrCode className="h-4 w-4" />
          Tunjukkan QR ke Apoteker
        </button>
      </div>
    </div>
  );
}
