'use client';

import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
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
    <div className="min-h-screen bg-[#fbfbfb] text-neutral-900 pb-24">
      <Navbar />

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        <div className="border-b border-neutral-200 pb-6">
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
            Terminal Kasir Farmasi
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Pelayanan Tebus Resep &amp; Inventaris
          </h1>
          <p className="mt-1 text-xs text-neutral-600">
            Pemindaian QR resep, pencocokan sediaan etalase, dan pemotongan stok otomatis.
          </p>
        </div>

        {/* 1. Scanner Input Header Card */}
        <QrScannerInput
          onScanResult={handleScanResult}
          isLoading={isProcessing}
        />

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-800">
            {errorMessage}
          </div>
        )}

        {/* 2. Dispense Workspace (Active when prescription is scanned) */}
        {activePrescription && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                Penebusan Resep Aktif
              </h2>
              <button
                onClick={() => setActivePrescription(null)}
                className="text-xs text-neutral-500 hover:text-neutral-900 underline"
              >
                Tutup Lembar Ini
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
        <div className="space-y-3 pt-4">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Manajemen Stok &amp; Riwayat Penebusan
          </div>

          <InventoryManager key={inventoryRefreshKey} />
        </div>
      </main>
    </div>
  );
}
