'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, AlertTriangle } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
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
        setErrorMsg('Data resep dalam tautan tidak dapat diuraikan atau format tidak valid.');
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
            s: '3x1 tablet sesudah makan',
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
    <div className="min-h-screen bg-[#fbfbfb] text-neutral-900 pb-20">
      <Navbar />

      {/* Main Container */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-900">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Terjadi Kesalahan</p>
              <p className="mt-0.5 text-red-800">{errorMsg}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 mb-3" />
            <p className="text-xs font-semibold text-neutral-900">
              Memverifikasi Resep Kriptografi...
            </p>
            <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
              Validasi Ed25519 offline di peramban
            </p>
          </div>
        ) : payload ? (
          <PrescriptionCard
            payload={payload}
            isValidSignature={isValidSignature}
          />
        ) : (
          /* Clean Minimal Empty state */
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-neutral-200 bg-white p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-neutral-100 text-neutral-600 mb-3">
              <FileText className="h-6 w-6" />
            </div>

            <h2 className="text-base font-bold text-neutral-900">
              Belum Ada Data Resep
            </h2>
            <p className="mt-1 max-w-sm text-xs text-neutral-500 leading-relaxed">
              Pindai QR code pada struk dokter menggunakan kamera ponsel untuk membuka resep, atau muat data sampel di bawah.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleLoadDemo}
                className="rounded bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition"
              >
                Muat Resep Contoh (Demo)
              </button>
              <Link
                href="/doctor"
                className="rounded border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition"
              >
                Tulis Resep di Portal Dokter
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
