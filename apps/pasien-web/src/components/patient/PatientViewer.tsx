'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  HeartPulse,
  ClipboardPaste,
  Download,
} from 'lucide-react';
import type { PrescriptionPayload } from '../../lib/types';
import { decodePrescriptionFromUrlHash, encodePrescriptionToUrl } from '../../lib/qr-codec';
import { verifyPrescriptionSignature, signPrescription } from '../../lib/crypto';
import PrescriptionCard from './PrescriptionCard';
import { DEMO_DOCTOR } from '../../lib/demo-data';

export default function PatientViewer() {
  const [payload, setPayload] = useState<PrescriptionPayload | null>(null);
  const [isValidSignature, setIsValidSignature] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pasteInput, setPasteInput] = useState<string>('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  const processInput = async (inputStr: string) => {
    setLoading(true);
    setErrorMsg(null);

    const decoded = decodePrescriptionFromUrlHash(inputStr);
    if (!decoded) {
      setLoading(false);
      setPayload(null);
      if (inputStr.trim().length > 5) {
        setErrorMsg('Data resep tidak dapat diuraikan. Pastikan kode atau tautan lengkap dan tidak terpotong.');
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

      if (hash && hash.includes('d=')) {
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
        id: 'RX-20261010-001',
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

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteInput.trim()) return;
    processInput(pasteInput.trim());
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#241a14] pb-24">
      {/* Dedicated Patient Header - Strictly isolated, NO links to Doctor/Pharmacy */}
      <header className="border-b border-[#ebdccd] bg-white/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e86a28] text-white shadow-sm">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-[#241a14] tracking-tight">
                MediQR Pasien
              </h1>
              <p className="text-[11px] text-[#716358] font-mono">
                Portal Resep Digital Pribadi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canInstall && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 rounded-full bg-[#e86a28] hover:bg-[#d95a18] px-3 py-1 text-xs font-bold text-white shadow-sm transition active:scale-95"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Pasang App</span>
              </button>
            )}
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-semibold text-emerald-900">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
              <span>Privasi Terjamin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs text-red-900 shadow-sm">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Gagal Menguraikan Resep</p>
              <p className="mt-0.5 text-red-800">{errorMsg}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#ebdccd] border-t-[#e86a28] mb-3" />
            <p className="text-sm font-bold text-[#241a14]">
              Memverifikasi Kriptografi Resep...
            </p>
            <p className="text-xs text-[#716358] font-mono mt-0.5">
              Validasi Ed25519 langsung di perangkat Anda
            </p>
          </div>
        ) : payload ? (
          <PrescriptionCard
            payload={payload}
            isValidSignature={isValidSignature}
          />
        ) : (
          /* Clean Welcome Screen when opened without hash */
          <div className="rounded-3xl border border-[#ebdccd] bg-white p-8 sm:p-10 shadow-sm text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5ece1] text-[#e86a28] mb-5">
              <QrCode className="h-8 w-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#241a14] tracking-tight">
              Pindai QR Resep Dokter Anda
            </h2>
            <p className="mt-2 max-w-md mx-auto text-xs sm:text-sm text-[#716358] leading-relaxed">
              Buka kamera ponsel Anda dan arahkan ke kode QR yang tercetak pada struk fisik dari dokter. Resep akan otomatis terbuka di halaman ini secara aman.
            </p>

            <div className="mt-8 pt-6 border-t border-[#ebdccd]/60 max-w-md mx-auto text-left">
              <label className="block text-xs font-mono font-bold uppercase text-[#716358] mb-2">
                Atau Tempel Tautan / Kode Resep
              </label>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={pasteInput}
                  onChange={(e) => setPasteInput(e.target.value)}
                  placeholder="https://mediqr.app/#d=... atau #d=..."
                  className="flex-1 rounded-full border border-[#ebdccd] bg-[#fbfbf8] px-4 py-2.5 text-xs text-[#241a14] placeholder-[#a39487] focus:border-[#e86a28] focus:bg-white focus:outline-none transition"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#241a14] hover:bg-[#3d2e24] px-4 py-2.5 text-xs font-bold text-white transition shrink-0 flex items-center gap-1.5"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  <span>Buka</span>
                </button>
              </form>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleLoadDemo}
                className="rounded-full bg-[#e86a28] hover:bg-[#d95a18] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-[0.99]"
              >
                Coba Buka Resep Contoh (Demo)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
