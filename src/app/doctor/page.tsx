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
    <div className="min-h-screen bg-[#fafaf9] text-ink-900 pb-16">
      {/* Top Navigation Bar */}
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
                <Stethoscope className="h-4 w-4 text-forest-300" />
              </div>
              <div>
                <span className="font-bold text-ink-950 text-sm tracking-tight block">
                  Portal Peresepan Dokter
                </span>
                <span className="text-[10px] text-ink-500 font-mono hidden sm:block">
                  GENERATOR RESEP KRIPTOGRAFIS &bull; CETAK 80MM
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-200 bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Praktik Aktif</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Input Form (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-forest-700 mb-1">
                <span>● KLINIK WORKSTATION</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-ink-950 tracking-tight">
                Tulis Resep Pasien
              </h1>
              <p className="mt-0.5 text-xs text-ink-500">
                Resep otomatis ditandatangani kriptografi Ed25519 dan dikonversi menjadi QR Code mandiri tanpa database server.
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
              <div className="mb-3 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-ink-500 mb-1">
                  <span>● OUTPUT FISIK KASIR</span>
                </div>
                <h2 className="text-base font-bold text-ink-950">
                  Preview Struk Thermal (80mm)
                </h2>
                <p className="text-xs text-ink-500">
                  Arahkan kamera HP ke QR Code di bawah untuk menguji sebagai pasien.
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
