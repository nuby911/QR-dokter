'use client';

import React, { useState, useEffect } from 'react';
import PrescriptionForm from '../components/doctor/PrescriptionForm';
import ThermalReceiptPreview from '../components/doctor/ThermalReceiptPreview';
import type { PrescriptionPayload } from '../lib/types';
import { DEMO_DOCTOR } from '../lib/demo-data';
import { signPrescription } from '../lib/crypto';
import { ShieldCheck, Stethoscope } from 'lucide-react';

export default function DoctorAppPage() {
  const [activePrescription, setActivePrescription] = useState<PrescriptionPayload | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>('https://mediqr.app');

  useEffect(() => {
    const initDemo = async () => {
      let initialHost = 'https://mediqr.app';
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('mediqr_viewer_host');
        if (saved) {
          initialHost = saved;
        }
      }
      setBaseUrl(initialHost);

      const rawPayload = {
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
            n: 'Cetirizine 10mg',
            q: 5,
            s: '1x1 tablet malam hari',
          },
        ],
      };

      const sig = await signPrescription(rawPayload, DEMO_DOCTOR.privateKey);
      setActivePrescription({ ...rawPayload, sig });
    };

    initDemo();
  }, []);

  const handlePrescriptionGenerated = (payload: PrescriptionPayload, url: string) => {
    setActivePrescription(payload);
    setBaseUrl(url);
    if (typeof window !== 'undefined' && url) {
      localStorage.setItem('mediqr_viewer_host', url);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#241a14] pb-20">
      {/* Dedicated Doctor App Header */}
      <header className="border-b border-[#ebdccd] bg-white/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e86a28] text-white shadow-sm">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-[#241a14] tracking-tight">
                MediQR Dokter
              </h1>
              <p className="text-[11px] text-[#716358] font-mono">
                Terminal Peresepan Medis Mandiri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-semibold text-emerald-900">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
              <span>Mode Offline Siap</span>
            </div>
            <span className="hidden sm:inline font-mono text-[11px] text-[#a39487]">
              Ed25519 &bull; Standalone
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="border-b border-[#ebdccd] pb-6 mb-8">
          <div className="inline-block rounded-full bg-[#f5ece1] px-3.5 py-1 text-[11px] font-mono uppercase tracking-wider font-bold text-[#e86a28] mb-2">
            Workstation Dokter
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
    </div>
  );
}
