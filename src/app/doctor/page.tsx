'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import PrescriptionForm from '../../components/doctor/PrescriptionForm';
import ThermalReceiptPreview from '../../components/doctor/ThermalReceiptPreview';
import type { PrescriptionPayload } from '../../lib/types';
import { DEMO_DOCTOR } from '../../lib/demo-data';
import { signPrescription } from '../../lib/crypto';

export default function DoctorPage() {
  const [activePrescription, setActivePrescription] = useState<PrescriptionPayload | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>('');

  useEffect(() => {
    // Generate initial sample prescription so preview is ready immediately
    const initDemo = async () => {
      let initialHost = 'http://192.168.1.7:3000';
      if (typeof window !== 'undefined') {
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          initialHost = window.location.origin;
        } else {
          initialHost = `http://192.168.1.7:${window.location.port || '3000'}`;
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
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#241a14] pb-20">
      <Navbar />

      {/* Main Content Workspace */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="border-b border-[#ebdccd] pb-6 mb-8">
          <div className="inline-block rounded-full bg-[#f5ece1] px-3 py-1 text-[11px] font-mono uppercase tracking-wider font-bold text-[#e86a28] mb-2">
            Terminal Peresepan Elektronik
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#241a14]">
            Penerbitan Resep Medis
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#716358]">
            Penulisan resep dengan tanda tangan kriptografi Ed25519 dan output cetak struk thermal 80mm.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left: Input Form (7 cols) */}
          <div className="lg:col-span-7">
            <PrescriptionForm
              onPrescriptionGenerated={handlePrescriptionGenerated}
              baseUrl={baseUrl}
              onBaseUrlChange={setBaseUrl}
            />
          </div>

          {/* Right: Thermal Receipt Preview (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-20 space-y-3">
              <div className="text-xs font-mono uppercase text-neutral-400">
                Pratinjau Output Fisik (80mm)
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
