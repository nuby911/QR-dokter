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
    <div className="min-h-screen bg-[#faf7f2] text-[#241a14] pb-20">
      <Navbar />

      {/* Main Container */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs text-red-900 shadow-sm">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Terjadi Kesalahan</p>
              <p className="mt-0.5 text-red-800">{errorMsg}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#ebdccd] border-t-[#e86a28] mb-3" />
            <p className="text-sm font-bold text-[#241a14]">
              Memverifikasi Resep Kriptografi...
            </p>
            <p className="text-xs text-[#716358] font-mono mt-0.5">
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
          <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-[#ebdccd] bg-white p-8 sm:p-12 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fbfbf8] border border-[#ebdccd] text-[#e86a28] mb-4">
              <FileText className="h-6 w-6" />
            </div>

            <h2 className="text-lg sm:text-xl font-black text-[#241a14] tracking-tight">
              Belum Ada Data Resep
            </h2>
            <p className="mt-1.5 max-w-md text-xs sm:text-sm text-[#716358] leading-relaxed">
              Pindai QR code pada struk dokter menggunakan kamera ponsel untuk membuka lembar resep, atau muat data sampel di bawah.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLoadDemo}
                className="rounded-full bg-[#e86a28] hover:bg-[#d95a18] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-[0.99]"
              >
                Muat Resep Contoh (Demo)
              </button>
              <Link
                href="/doctor"
                className="rounded-full border border-[#ebdccd] bg-white px-5 py-2.5 text-xs font-semibold text-[#241a14] hover:bg-[#f5ece1] transition"
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
