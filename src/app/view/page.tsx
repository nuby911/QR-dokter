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
    <div className="min-h-screen bg-[#fafaf9] text-ink-900 pb-20">
      {/* Top Header */}
      <header className="border-b border-ink-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-20">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-100 transition shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Beranda</span>
            </Link>
            <div className="h-4 w-px bg-ink-200" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest-900 text-white shadow-xs">
                <HeartPulse className="h-4 w-4 text-forest-300" />
              </div>
              <div>
                <span className="font-bold text-ink-950 text-sm tracking-tight block">
                  MediQR &bull; Tiket Resep Pasien
                </span>
                <span className="text-[10px] text-ink-500 font-mono hidden sm:block">
                  VIEWER RESEP TERVERIFIKASI &bull; OFFLINE READY
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-200 bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Koneksi</span> Mandiri
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Terjadi Kesalahan</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-3 border-forest-200 border-t-forest-800 mb-3" />
            <p className="text-sm font-bold text-ink-900">
              Membaca &amp; Memverifikasi Resep Kriptografi...
            </p>
            <p className="text-xs text-ink-500 mt-1 font-mono">
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
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-ink-200 bg-white p-8 text-center shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 border border-forest-200/70 text-forest-800 mb-4">
              <FileQuestion className="h-7 w-7" />
            </div>

            <h2 className="text-lg sm:text-xl font-black text-ink-950 tracking-tight">
              Belum Ada Resep yang Dipindai
            </h2>
            <p className="mt-2 max-w-md text-xs text-ink-500 leading-relaxed">
              Halaman ini otomatis menampilkan resep saat Anda memindai QR Code di struk dokter menggunakan kamera HP.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLoadDemo}
                className="flex items-center justify-center gap-2 rounded-xl bg-forest-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-forest-800"
              >
                <Sparkles className="h-4 w-4 text-forest-300" />
                <span>Coba Buka Resep Contoh (Demo)</span>
              </button>
              <Link
                href="/doctor"
                className="flex items-center justify-center gap-2 rounded-xl border border-ink-300 bg-white px-5 py-2.5 text-xs font-semibold text-ink-800 hover:bg-ink-50 transition"
              >
                <span>Buat Resep Baru di Portal Dokter</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
