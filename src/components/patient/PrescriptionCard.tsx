'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  QrCode,
  Pill,
  Calendar,
  User,
  Clock,
  Printer,
  BookmarkCheck,
  Building2,
} from 'lucide-react';
import type { PrescriptionPayload } from '../../lib/types';
import QrModal from './QrModal';

interface PrescriptionCardProps {
  payload: PrescriptionPayload;
  isValidSignature: boolean;
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
    <div className="space-y-6">
      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        payload={payload}
      />

      {/* Security Verification Banner */}
      {isValidSignature ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50/50 p-4 shadow-xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-950 text-sm sm:text-base">
              Resep Asli Terverifikasi (Digital Signature Valid)
            </h3>
            <p className="mt-0.5 text-xs text-emerald-800">
              Resep diterbitkan dan ditandatangani secara sah oleh{' '}
              <span className="font-semibold">{payload.doc.n}</span> ({payload.doc.sip}).
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-rose-950 text-sm sm:text-base">
              Peringatan: Tanda Tangan Tidak Valid!
            </h3>
            <p className="mt-0.5 text-xs text-rose-800">
              Data resep ini tidak cocok dengan kunci digital dokter. Resep kemungkinan telah diubah atau dipalsukan. Jangan tebus resep ini tanpa konfirmasi dokter.
            </p>
          </div>
        </div>
      )}

      {/* Main Prescription Sheet */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
        {/* Top Header Card */}
        <div className="border-b border-slate-100 bg-slate-50/60 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                <Building2 className="h-3.5 w-3.5 text-teal-600" />
                {payload.doc.faskes}
              </div>
              <h1 className="mt-2 text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
                Resep Pasien Digital
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                No. Resep: {payload.id}
              </p>
            </div>

            {/* Quick Action Button for Pharmacist */}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-xs font-bold text-white shadow-md transition hover:bg-teal-700 active:scale-95 sm:self-auto"
            >
              <QrCode className="h-4 w-4" />
              Tunjukkan QR ke Apoteker
            </button>
          </div>

          {/* Patient and Doctor Snapshot Grid */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 border-t border-slate-200/60 pt-4 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <User className="h-4 w-4 text-teal-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Nama Pasien</span>
                <span className="font-semibold text-slate-900">
                  {payload.pat.n} ({payload.pat.a} th / {payload.pat.g})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="h-4 w-4 text-teal-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Tanggal Resep</span>
                <span className="font-semibold text-slate-900">{payload.dt}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="h-4 w-4 text-teal-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Dokter Pemeriksa</span>
                <span className="font-semibold text-slate-900">{payload.doc.n}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Medications List */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Pill className="h-4 w-4 text-teal-600" />
              Daftar Obat yang Diresepkan ({payload.rx.length} Item)
            </h2>
            <span className="text-xs text-slate-400">
              Simpan dan ikuti aturan pakai dokter
            </span>
          </div>

          <div className="space-y-3">
            {payload.rx.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {item.n}
                    </h3>
                    <p className="mt-0.5 text-xs text-teal-700 font-medium">
                      Aturan Pakai: {item.s}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs">
                    Jumlah: {item.q}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Help notice for the patient */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">
              💡 Petunjuk untuk Pasien:
            </p>
            <p>
              • Resep ini <strong>tidak akan hangus</strong> dan dapat Anda akses kembali kapan saja melalui link ini.
            </p>
            <p>
              • Untuk menebus obat, bawa ponsel Anda atau struk cetak ke apotek mana pun yang terdaftar, lalu klik tombol <strong>&quot;Tunjukkan QR ke Apoteker&quot;</strong>.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/40 p-4 sm:px-8">
          <div className="text-[11px] text-slate-400">
            Resep Digital Aman • Tanpa Akses Database Pihak Ketiga
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmark}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <BookmarkCheck className="h-4 w-4 text-teal-600" />
              {isBookmarked ? 'Tersimpan!' : 'Simpan Resep'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <Printer className="h-4 w-4 text-slate-600" />
              Cetak / Simpan PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
