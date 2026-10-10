'use client';

import React, { useState } from 'react';
import { Pill, ShieldCheck, CheckCircle2 } from 'lucide-react';
import QrScannerInput from '../components/pharmacy/QrScannerInput';
import DispenseWorkspace from '../components/pharmacy/DispenseWorkspace';
import InventoryManager from '../components/pharmacy/InventoryManager';
import type { PrescriptionPayload } from '../lib/types';
import { decodePrescriptionFromUrlHash } from '../lib/qr-codec';
import { verifyPrescriptionSignature } from '../lib/crypto';

export default function PharmacyAppPage() {
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
      {/* Dedicated Pharmacy Header - Strictly isolated, NO links to Doctor/Patient portals */}
      <header className="border-b border-[#ebdccd] bg-white/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e86a28] text-white shadow-sm">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-[#241a14] tracking-tight">
                MediQR Apotek
              </h1>
              <p className="text-[11px] text-[#716358] font-mono">
                Terminal Kasir &amp; Inventaris Farmasi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-semibold text-emerald-900">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
              <span>Sistem Kasir Mandiri</span>
            </div>
            <span className="hidden sm:inline font-mono text-[11px] text-[#a39487]">
              Port 3003
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        <div className="border-b border-[#ebdccd] pb-6">
          <div className="rounded-full bg-[#f5ece1] text-[#e86a28] px-3 py-1 text-[11px] font-mono uppercase font-bold tracking-wider inline-block mb-2">
            Workstation Farmasi
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#241a14]">
            Pelayanan Tebus Resep &amp; Inventaris
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-[#716358]">
            Pemindaian QR resep dari pasien/struk, verifikasi kriptografis Ed25519 dokter, pencocokan obat etalase, dan pemotongan stok kasir otomatis.
          </p>
        </div>

        {/* 1. Scanner Input Card */}
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
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#716358]">
                Penebusan Resep Aktif: {activePrescription.id}
              </h3>
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
