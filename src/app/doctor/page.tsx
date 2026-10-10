'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Stethoscope, Sparkles } from 'lucide-react';
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
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      setBaseUrl(origin);

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
            s: '3x1 tablet sesudah makan (bila demam)',
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
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Top Navigation Bar */}
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
                <Stethoscope className="h-4 w-4" />
              </div>
              <span className="font-bold text-slate-900 text-sm sm:text-base">
                Portal Dokter — Pembuat Resep &amp; Struk QR
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Mode Aktif
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Input Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="mb-4">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
                Tulis Resep Pasien
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Resep otomatis ditandatangani secara kriptografi dan dikonversi menjadi QR Code mandiri tanpa database server.
              </p>
            </div>

            <PrescriptionForm
              onPrescriptionGenerated={handlePrescriptionGenerated}
              baseUrl={baseUrl}
              onBaseUrlChange={setBaseUrl}
            />
          </div>

          {/* Right: Thermal Receipt Preview (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-20">
              <div className="mb-4 text-center lg:text-left">
                <h2 className="text-lg font-bold text-slate-900">
                  Preview Struk Thermal (80mm)
                </h2>
                <p className="text-xs text-slate-500">
                  Arahkan kamera HP ke QR di bawah untuk menguji sebagai pasien.
                </p>
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
