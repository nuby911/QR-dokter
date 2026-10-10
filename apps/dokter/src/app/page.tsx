'use client';

import React, { useState, useEffect } from 'react';
import PrescriptionForm from '../components/doctor/PrescriptionForm';
import ThermalReceiptPreview from '../components/doctor/ThermalReceiptPreview';
import DoctorOnboardingModal from '../components/doctor/DoctorOnboardingModal';
import type { PrescriptionPayload, DoctorProfile } from '../lib/types';
import { getDoctorProfile, clearDoctorProfile } from '../lib/doctor-store';
import { ShieldCheck, Stethoscope, Settings, RotateCcw } from 'lucide-react';

export default function DoctorAppPage() {
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isOnboardingMandatory, setIsOnboardingMandatory] = useState<boolean>(false);
  const [activePrescription, setActivePrescription] = useState<PrescriptionPayload | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>('https://mediqr.app');
  const [isClientReady, setIsClientReady] = useState<boolean>(false);

  useEffect(() => {
    setIsClientReady(true);
    let initialHost = 'https://mediqr.app';
    if (typeof window !== 'undefined') {
      const savedHost = localStorage.getItem('mediqr_viewer_host');
      if (savedHost) {
        initialHost = savedHost;
      }
    }
    setBaseUrl(initialHost);

    const savedProfile = getDoctorProfile();
    if (!savedProfile) {
      // First-run: User MUST fill in profile before using app
      setIsOnboardingMandatory(true);
      setShowOnboarding(true);
    } else {
      setDoctorProfile(savedProfile);
    }
  }, []);

  const handleProfileSaved = (profile: DoctorProfile) => {
    setDoctorProfile(profile);
    setShowOnboarding(false);
    setIsOnboardingMandatory(false);
  };

  const handleResetProfile = () => {
    if (confirm('Apakah Anda yakin ingin mereset profil dokter? Anda akan diminta mengisi data profil baru dari awal.')) {
      clearDoctorProfile();
      setDoctorProfile(null);
      setActivePrescription(null);
      setIsOnboardingMandatory(true);
      setShowOnboarding(true);
    }
  };

  const handlePrescriptionGenerated = (payload: PrescriptionPayload, url: string) => {
    setActivePrescription(payload);
    setBaseUrl(url);
    if (typeof window !== 'undefined' && url) {
      localStorage.setItem('mediqr_viewer_host', url);
    }
  };

  if (!isClientReady) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="text-xs font-mono text-[#716358] animate-pulse">
          Memuat MediQR Dokter...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#241a14] pb-20">
      {/* Mandatory / Edit Doctor Onboarding Modal */}
      <DoctorOnboardingModal
        isOpen={showOnboarding}
        isMandatory={isOnboardingMandatory}
        currentProfile={doctorProfile}
        onSaved={handleProfileSaved}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Dedicated Doctor App Header */}
      <header className="border-b border-[#ebdccd] bg-white/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e86a28] text-white shadow-sm">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-[#241a14] tracking-tight">
                  MediQR Dokter
                </h1>
                {doctorProfile && (
                  <span className="rounded-full bg-[#f5ece1] px-2.5 py-0.5 text-[11px] font-bold text-[#e86a28]">
                    {doctorProfile.name}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#716358] font-mono">
                {doctorProfile ? `${doctorProfile.faskes} (SIP: ${doctorProfile.sip})` : 'Terminal Peresepan Medis Mandiri'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-semibold text-emerald-900">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
              <span>Mode Offline Siap</span>
            </div>

            {doctorProfile && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsOnboardingMandatory(false);
                    setShowOnboarding(true);
                  }}
                  className="flex items-center gap-1 rounded-full border border-[#ebdccd] bg-white px-3 py-1 text-xs font-medium text-[#716358] hover:bg-[#f5ece1] hover:text-[#241a14] transition"
                  title="Ubah identitas dokter"
                >
                  <Settings className="h-3.5 w-3.5 text-[#e86a28]" />
                  <span>Profil</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetProfile}
                  className="p-1.5 rounded-full border border-[#ebdccd] bg-white text-[#a39487] hover:text-red-700 hover:bg-[#f5ece1] transition"
                  title="Reset identitas dokter ke awal"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Workspace (Only visible if profile exists) */}
      {doctorProfile && (
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="border-b border-[#ebdccd] pb-6 mb-8">
            <div className="inline-block rounded-full bg-[#f5ece1] px-3.5 py-1 text-[11px] font-mono uppercase tracking-wider font-bold text-[#e86a28] mb-2">
              Workstation Dokter &bull; {doctorProfile.name}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#241a14]">
              Penerbitan Resep Medis
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-[#716358]">
              Penulisan resep mandiri dengan tanda tangan digital Ed25519 dan pratinjau cetak struk thermal 80mm.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            {/* Left: Input Form (7 cols) */}
            <div className="lg:col-span-7">
              <PrescriptionForm
                doctor={doctorProfile}
                onEditDoctorProfile={() => {
                  setIsOnboardingMandatory(false);
                  setShowOnboarding(true);
                }}
                onPrescriptionGenerated={handlePrescriptionGenerated}
                baseUrl={baseUrl}
                onBaseUrlChange={(url) => {
                  setBaseUrl(url);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('mediqr_viewer_host', url);
                  }
                }}
              />
            </div>

            {/* Right: Thermal Receipt Preview (5 cols) */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider font-bold text-[#716358]">
                  Output Struk Fisik Thermal (80mm)
                </div>
                <ThermalReceiptPreview
                  payload={activePrescription}
                  baseUrl={baseUrl}
                />
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
