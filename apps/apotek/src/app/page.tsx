'use client';

import React, { useState, useEffect } from 'react';
import { Pill, ShieldCheck, Settings, RotateCcw } from 'lucide-react';
import QrScannerInput from '../components/pharmacy/QrScannerInput';
import DispenseWorkspace from '../components/pharmacy/DispenseWorkspace';
import InventoryManager from '../components/pharmacy/InventoryManager';
import PharmacyOnboardingModal from '../components/pharmacy/PharmacyOnboardingModal';
import type { PrescriptionPayload, PharmacyProfile } from '../lib/types';
import { decodePrescriptionFromUrlHash } from '../lib/qr-codec';
import { verifyPrescriptionSignature } from '../lib/crypto';
import { getPharmacyProfile, clearPharmacyProfile, clearInventory } from '../lib/inventory-store';

export default function PharmacyAppPage() {
  const [pharmacyProfile, setPharmacyProfile] = useState<PharmacyProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isOnboardingMandatory, setIsOnboardingMandatory] = useState<boolean>(false);
  const [isClientReady, setIsClientReady] = useState<boolean>(false);

  const [activePrescription, setActivePrescription] = useState<PrescriptionPayload | null>(null);
  const [isValidSignature, setIsValidSignature] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inventoryRefreshKey, setInventoryRefreshKey] = useState<number>(0);

  useEffect(() => {
    setIsClientReady(true);
    const saved = getPharmacyProfile();
    if (!saved) {
      // First-run: User MUST fill in pharmacy profile before using app
      setIsOnboardingMandatory(true);
      setShowOnboarding(true);
    } else {
      setPharmacyProfile(saved);
    }
  }, []);

  const handleProfileSaved = (profile: PharmacyProfile) => {
    setPharmacyProfile(profile);
    setShowOnboarding(false);
    setIsOnboardingMandatory(false);
    setInventoryRefreshKey((prev) => prev + 1);
  };

  const handleResetPharmacy = () => {
    if (confirm('Apakah Anda yakin ingin mereset profil dan data apotek? Anda akan diminta mengisi ulang profil apotek dari awal.')) {
      clearPharmacyProfile();
      clearInventory();
      setPharmacyProfile(null);
      setActivePrescription(null);
      setIsOnboardingMandatory(true);
      setShowOnboarding(true);
      setInventoryRefreshKey((prev) => prev + 1);
    }
  };

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

  if (!isClientReady) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="text-xs font-mono text-[#716358] animate-pulse">
          Memuat MediQR Apotek...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#241a14] pb-24">
      {/* Mandatory / Edit Pharmacy Onboarding Modal */}
      <PharmacyOnboardingModal
        isOpen={showOnboarding}
        isMandatory={isOnboardingMandatory}
        currentProfile={pharmacyProfile}
        onSaved={handleProfileSaved}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Dedicated Pharmacy Header */}
      <header className="border-b border-[#ebdccd] bg-white/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e86a28] text-white shadow-sm">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-[#241a14] tracking-tight">
                  MediQR Apotek
                </h1>
                {pharmacyProfile && (
                  <span className="rounded-full bg-[#f5ece1] px-2.5 py-0.5 text-[11px] font-bold text-[#e86a28]">
                    {pharmacyProfile.name}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#716358] font-mono">
                {pharmacyProfile
                  ? `${pharmacyProfile.pharmacist} (SIA: ${pharmacyProfile.sia})`
                  : 'Terminal Kasir & Inventaris Farmasi'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-semibold text-emerald-900">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
              <span>Sistem Kasir Mandiri</span>
            </div>

            {pharmacyProfile && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsOnboardingMandatory(false);
                    setShowOnboarding(true);
                  }}
                  className="flex items-center gap-1 rounded-full border border-[#ebdccd] bg-white px-3 py-1 text-xs font-medium text-[#716358] hover:bg-[#f5ece1] hover:text-[#241a14] transition"
                  title="Ubah identitas apotek"
                >
                  <Settings className="h-3.5 w-3.5 text-[#e86a28]" />
                  <span>Profil</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetPharmacy}
                  className="p-1.5 rounded-full border border-[#ebdccd] bg-white text-[#a39487] hover:text-red-700 hover:bg-[#f5ece1] transition"
                  title="Reset profil dan data apotek"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container (Only rendered if profile exists) */}
      {pharmacyProfile && (
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
          <div className="border-b border-[#ebdccd] pb-6">
            <div className="rounded-full bg-[#f5ece1] text-[#e86a28] px-3 py-1 text-[11px] font-mono uppercase font-bold tracking-wider inline-block mb-2">
              Workstation Farmasi &bull; {pharmacyProfile.name}
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
      )}
    </div>
  );
}
