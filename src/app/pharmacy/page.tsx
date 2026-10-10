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
    <div className="min-h-screen bg-slate-50/80 pb-20">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-20 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
                <Store className="h-4 w-4" />
              </div>
              <span className="font-bold text-slate-900 text-sm sm:text-base">
                Portal Apotek — Kasir Farmasi &amp; Pengurang Stok
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">
              Apotek Mitra Sehat
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
            Pelayanan Tebus Resep &amp; Kasir Obat
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Pindai struk resep dari dokter untuk memverifikasi keaslian dan memotong stok fisik apotek secara otomatis.
          </p>
        </div>

        {/* 1. Scanner Input Header Card */}
        <QrScannerInput
          onScanResult={handleScanResult}
          isLoading={isProcessing}
        />

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 animate-in fade-in">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* 2. Dispense Workspace (Active when prescription is scanned) */}
        {activePrescription && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pill className="h-5 w-5 text-teal-600" />
                Lembar Kerja Penebusan Resep
              </h2>
              <button
                onClick={() => setActivePrescription(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
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
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="h-5 w-5 text-teal-600" />
              Manajemen Inventaris Stok Apotek
            </h2>
          </div>

          <InventoryManager key={inventoryRefreshKey} />
        </div>
      </main>
    </div>
  );
}
