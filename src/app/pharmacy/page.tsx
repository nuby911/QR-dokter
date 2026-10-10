'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building, Store, Pill } from 'lucide-react';
import QrScannerInput from '../../components/pharmacy/QrScannerInput';
import DispenseWorkspace from '../../components/pharmacy/DispenseWorkspace';
import InventoryManager from '../../components/pharmacy/InventoryManager';
import type { PrescriptionPayload } from '../../lib/types';
import { decodePrescriptionFromUrlHash } from '../../lib/qr-codec';
import { verifyPrescriptionSignature } from '../../lib/crypto';

export default function PharmacyPage() {
  const [activePrescription, setActivePrescription] = useState<PrescriptionPayload | null>(null);
  const [isValidSignature, setIsValidSignature] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inventoryRefreshKey, setInventoryRefreshKey] = useState<number>(0);

  const handleScanResult = async (rawInput: string) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Extract hash or handle raw input
      let hash = rawInput;
      if (rawInput.includes('#')) {
        hash = rawInput.substring(rawInput.indexOf('#'));
      }

      const decoded = decodePrescriptionFromUrlHash(hash);
      if (!decoded) {
        setErrorMessage('QR Code tidak dikenali sebagai format resep yang valid.');
        setActivePrescription(null);
        return;
      }

      const valid = await verifyPrescriptionSignature(decoded);
      setIsValidSignature(valid);
      setActivePrescription(decoded);
    } catch (err) {
      console.error('Error handling scan:', err);
      setErrorMessage('Terjadi kesalahan saat memproses data resep.');
      setActivePrescription(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDispenseSuccess = () => {
    setInventoryRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-ink-900 pb-24">
      {/* Top Header Navigation */}
      <header className="border-b border-ink-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-100 transition shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali</span>
            </Link>
            <div className="h-4 w-px bg-ink-200" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest-900 text-white shadow-xs">
                <Store className="h-4 w-4 text-forest-300" />
              </div>
              <div>
                <span className="font-bold text-ink-950 text-sm tracking-tight block">
                  Kasir Farmasi &amp; Dispensing
                </span>
                <span className="text-[10px] text-ink-500 font-mono hidden sm:block">
                  TERMINAL DISPENSING APOTEK v1.0
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-forest-200 bg-forest-50 px-3 py-1 text-xs font-medium text-forest-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold">Apotek Mitra Sehat</span>
              <span className="text-forest-600 font-mono text-[11px] hidden md:inline">• POS Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Title & Description banner */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-ink-200/60 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-forest-700 mb-1">
              <span>● APOTEK WORKSTATION</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-ink-950 tracking-tight">
              Pelayanan Tebus Resep &amp; Kasir Obat
            </h1>
            <p className="mt-0.5 text-xs text-ink-600">
              Pindai QR struk pasien untuk verifikasi tanda tangan digital Ed25519 dan pemotongan stok otomatis di rak.
            </p>
          </div>
        </div>

        {/* 1. Scanner Input Header Card */}
        <QrScannerInput
          onScanResult={handleScanResult}
          isLoading={isProcessing}
        />

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-800 animate-in fade-in flex items-center gap-2">
            <span className="font-bold">⚠️ Error Pemindaian:</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 2. Dispense Workspace (Active when prescription is scanned) */}
        {activePrescription && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink-900 flex items-center gap-2 uppercase tracking-wide">
                <Pill className="h-4 w-4 text-forest-700" />
                Lembar Kerja Penebusan Resep Aktif
              </h2>
              <button
                onClick={() => setActivePrescription(null)}
                className="text-xs font-semibold text-ink-500 hover:text-ink-800 transition underline underline-offset-2"
              >
                Tutup Resep Ini
              </button>
            </div>

            <DispenseWorkspace
              prescription={activePrescription}
              isValidSignature={isValidSignature}
              onDispenseSuccess={handleDispenseSuccess}
            />
          </div>
        )}

        {/* 3. Pharmacy Stock & History Inventory Manager */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink-900 flex items-center gap-2 uppercase tracking-wide">
              <Building className="h-4 w-4 text-forest-700" />
              Inventaris Fisik &amp; Riwayat Penebusan
            </h2>
          </div>

          <InventoryManager key={inventoryRefreshKey} />
        </div>
      </main>
    </div>
  );
}
