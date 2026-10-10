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
    <div className="min-h-screen bg-[#faf7f2] text-[#241a14] pb-24">
      <Navbar />

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        <div className="border-b border-[#ebdccd] pb-6">
          <div className="rounded-full bg-[#f5ece1] text-[#e86a28] px-3 py-1 text-[11px] font-mono uppercase font-bold tracking-wider inline-block mb-2">
            Terminal Kasir Farmasi
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#241a14]">
            Pelayanan Tebus Resep &amp; Inventaris
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#716358]">
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
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs font-medium text-red-800 shadow-sm">
            {errorMessage}
          </div>
        )}

        {/* 2. Dispense Workspace (Active when prescription is scanned) */}
        {activePrescription && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-[#ebdccd] pb-2">
              <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-[#716358]">
                Penebusan Resep Aktif
              </h2>
              <button
                onClick={() => setActivePrescription(null)}
                className="rounded-full border border-[#ebdccd] bg-white px-3 py-1 text-xs text-[#716358] hover:text-[#241a14] hover:bg-[#f5ece1] transition"
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
          <div className="text-xs font-mono uppercase tracking-wider font-bold text-[#716358]">
            Manajemen Stok &amp; Riwayat Penebusan
          </div>

          <InventoryManager key={inventoryRefreshKey} />
        </div>
      </main>
    </div>
  );
}
