'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileQuestion,
  Sparkles,
  ArrowLeft,
  HeartPulse,
  AlertTriangle,
} from 'lucide-react';
import type { PrescriptionPayload } from '../../lib/types';
import { decodePrescriptionFromUrlHash, encodePrescriptionToUrl } from '../../lib/qr-codec';
import { verifyPrescriptionSignature, signPrescription } from '../../lib/crypto';
import PrescriptionCard from '../../components/patient/PrescriptionCard';
import { DEMO_DOCTOR } from '../../lib/demo-data';

export default function PatientViewPage() {
  const [payload, setPayload] = useState<PrescriptionPayload | null>(null);
  const [isValidSignature, setIsValidSignature] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processInput = async (inputStr: string) => {
    setLoading(true);
    setErrorMsg(null);

    const decoded = decodePrescriptionFromUrlHash(inputStr);
    if (!decoded) {
      setLoading(false);
      setPayload(null);
      if (inputStr.trim().length > 5) {
        setErrorMsg('Data resep dalam link tidak dapat diuraikan atau format tidak sesuai.');
      }
      return;
    }

    try {
      const valid = await verifyPrescriptionSignature(decoded);
      setIsValidSignature(valid);
      setPayload(decoded);
    } catch (err) {
      console.error('Error verifying signature:', err);
      setIsValidSignature(false);
      setPayload(decoded);
      setErrorMsg('Gagal memverifikasi tanda tangan digital: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleUrlChange = () => {
      if (typeof window === 'undefined') return;

      // Check hash first (#d=...), then query string (?d=...), then full URL
      const hash = window.location.hash;
      const search = window.location.search;
      const full = window.location.href;

      if (hash && hash.length > 2) {
        processInput(hash);
      } else if (search && search.includes('d=')) {
        processInput(search);
      } else if (full && full.includes('d=')) {
        processInput(full);
      } else {
        setLoading(false);
        setPayload(null);
      }
    };

    handleUrlChange();

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const handleLoadDemo = async () => {
    try {
      const demoRaw = {
        v: 1,
        id: 'RX-20261010-DEMO',
        doc: {
          n: DEMO_DOCTOR.name,
          sip: DEMO_DOCTOR.sip,
          pk: DEMO_DOCTOR.publicKey,
          faskes: DEMO_DOCTOR.faskes,
        },
        pat: {
          n: 'Budi Santoso',
          a: 32,
          g: 'L' as const,
          phone: '081298765432',
        },
        dt: new Date().toISOString().slice(0, 10),
        rx: [
          {
            n: 'Paracetamol 500mg',
            q: 10,
            s: '3x1 tablet sesudah makan (bila demam)',
          },
          {
            n: 'Amoxicillin 500mg',
            q: 15,
            s: '3x1 kaplet sesudah makan (habiskan)',
          },
        ],
      };

      const sig = await signPrescription(demoRaw, DEMO_DOCTOR.privateKey);
      const demoPayload = { ...demoRaw, sig };

      const url = encodePrescriptionToUrl(demoPayload);
      const hash = url.substring(url.indexOf('#'));
      window.location.hash = hash;
      processInput(hash);
    } catch (err) {
      alert('Error saat memuat demo: ' + String(err));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 pb-20">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-20 shadow-xs">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Beranda
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
                <HeartPulse className="h-4 w-4" />
              </div>
              <span className="font-bold text-slate-900 text-sm">
                MediQR Pasien
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
              Viewer Resep Mandiri
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Terjadi Kesalahan</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600 mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              Membaca &amp; Memverifikasi Resep Kriptografi...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Memeriksa keaslian tanda tangan dokter secara lokal di browser
            </p>
          </div>
        ) : payload ? (
          <PrescriptionCard
            payload={payload}
            isValidSignature={isValidSignature}
          />
        ) : (
          /* Empty state when no hash is in URL */
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 mb-4">
              <FileQuestion className="h-8 w-8" />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Belum Ada Resep yang Dipindai
            </h2>
            <p className="mt-2 max-w-md text-xs text-slate-500 leading-relaxed">
              Halaman ini otomatis memuat data resep saat Anda memindai QR Code di struk dokter menggunakan kamera HP.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLoadDemo}
                className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700"
              >
                <Sparkles className="h-4 w-4" />
                Coba Buka Resep Contoh (Demo)
              </button>
              <Link
                href="/doctor"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Buat Resep Baru di Portal Dokter
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
