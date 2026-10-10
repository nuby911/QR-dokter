'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  Stethoscope,
  User,
  Key,
  Wifi,
  FileCheck2,
  Smartphone,
} from 'lucide-react';
import type { PrescriptionPayload, PrescriptionItem, DoctorProfile } from '../../lib/types';
import { DEMO_DOCTOR, DEMO_PRESCRIPTION_TEMPLATES } from '../../lib/demo-data';
import { signPrescription, generateDoctorKeyPair } from '../../lib/crypto';

interface PrescriptionFormProps {
  onPrescriptionGenerated: (payload: PrescriptionPayload, baseUrl: string) => void;
  baseUrl: string;
  onBaseUrlChange: (url: string) => void;
}

export default function PrescriptionForm({
  onPrescriptionGenerated,
  baseUrl,
  onBaseUrlChange,
}: PrescriptionFormProps) {
  const [doctor, setDoctor] = useState<DoctorProfile>(DEMO_DOCTOR);
  const [patientName, setPatientName] = useState<string>('Budi Santoso');
  const [patientAge, setPatientAge] = useState<number>(32);
  const [patientGender, setPatientGender] = useState<'L' | 'P'>('L');
  const [patientPhone, setPatientPhone] = useState<string>('081298765432');

  const [items, setItems] = useState<PrescriptionItem[]>([
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
  ]);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  // Set default baseUrl: prioritize LAN IP if on localhost
  useEffect(() => {
    if (!baseUrl && typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        onBaseUrlChange(`http://192.168.1.7:${window.location.port || '3000'}`);
      } else {
        onBaseUrlChange(window.location.origin);
      }
    }
  }, [baseUrl, onBaseUrlChange]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        n: '',
        q: 10,
        s: '3x1 tablet sesudah makan',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof PrescriptionItem,
    value: string | number
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleApplyTemplate = (templateIndex: number) => {
    const tmpl = DEMO_PRESCRIPTION_TEMPLATES[templateIndex];
    if (tmpl) {
      setItems(JSON.parse(JSON.stringify(tmpl.items)));
    }
  };

  const handleGenerateKeys = async () => {
    const pair = await generateDoctorKeyPair();
    setDoctor((prev) => ({
      ...prev,
      privateKey: pair.privateKey,
      publicKey: pair.publicKey,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Tambahkan minimal 1 item obat.');
      return;
    }

    const filteredItems = items.filter((it) => it.n.trim() !== '');
    if (filteredItems.length === 0) {
      alert('Nama obat tidak boleh kosong.');
      return;
    }

    setIsGenerating(true);
    try {
      const prescriptionId = `RX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
        100 + Math.random() * 900
      )}`;

      const rawPayload: Omit<PrescriptionPayload, 'sig'> = {
        v: 1,
        id: prescriptionId,
        doc: {
          n: doctor.name,
          sip: doctor.sip,
          pk: doctor.publicKey,
          faskes: doctor.faskes,
        },
        pat: {
          n: patientName.trim() || 'Pasien Umum',
          a: Number(patientAge) || 25,
          g: patientGender,
          phone: patientPhone.trim(),
        },
        dt: new Date().toISOString().slice(0, 10),
        rx: filteredItems,
      };

      const signature = await signPrescription(rawPayload, doctor.privateKey);

      const fullPayload: PrescriptionPayload = {
        ...rawPayload,
        sig: signature,
      };

      onPrescriptionGenerated(fullPayload, baseUrl);
    } catch (err) {
      console.error('Error generating prescription:', err);
      alert('Gagal membuat resep: ' + String(err));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Doctor & Clinic Badge */}
      <div className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4 text-ink-900 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-forest-950 text-white">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink-900">{doctor.name}</h3>
            <p className="text-xs text-ink-500">
              {doctor.sip} • <span className="font-semibold text-forest-800">{doctor.faskes}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowKeyModal(!showKeyModal)}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-700 shadow-2xs hover:bg-ink-50 transition sm:self-auto"
        >
          <Key className="h-3 w-3 text-forest-700" />
          Kunci Ed25519
        </button>
      </div>

      {/* Target Host Setting for Mobile Scanning */}
      <div className="flex flex-col gap-2 rounded-xl border border-ink-200 bg-white p-3.5 shadow-2xs text-xs">
        <div className="flex items-center justify-between font-semibold text-ink-800">
          <span className="flex items-center gap-1.5 text-forest-800">
            <Wifi className="h-4 w-4 text-forest-700" /> Target Host QR (Untuk Scan HP Pasien)
          </span>
          <span className="text-[11px] font-normal text-ink-400">
            URL yang dimuat ke dalam QR Code
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => onBaseUrlChange(e.target.value)}
            placeholder="http://192.168.1.7:3000"
            className="flex-1 rounded-lg border border-ink-200 bg-ink-50/40 px-3 py-1.5 text-ink-900 font-mono text-xs focus:border-forest-600 focus:bg-white focus:outline-none"
          />
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => onBaseUrlChange('http://192.168.1.7:3000')}
              className="flex items-center gap-1 rounded-lg bg-forest-950 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-forest-900 transition shadow-2xs"
            >
              <Smartphone className="h-3 w-3" />
              IP Wi-Fi (192.168.1.7)
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') onBaseUrlChange(window.location.origin);
              }}
              className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50"
            >
              Localhost
            </button>
          </div>
        </div>

        {baseUrl.includes('localhost') && (
          <p className="text-[11px] text-amber-800 bg-amber-50 rounded-lg p-2 border border-amber-200">
            ⚠️ <strong>Perhatian:</strong> Jika memakai <em>localhost</em>, kamera HP tidak akan bisa membukanya. Klik tombol <strong>&quot;IP Wi-Fi&quot;</strong> di samping agar HP bisa langsung scan.
          </p>
        )}
      </div>

      {/* Expandable Key Details Drawer */}
      {showKeyModal && (
        <div className="rounded-xl border border-ink-200 bg-ink-50 p-4 text-xs space-y-2">
          <div className="flex items-center justify-between font-semibold text-ink-800">
            <span>Kriptografi Asimetris Dokter (Ed25519)</span>
            <button
              type="button"
              onClick={handleGenerateKeys}
              className="text-forest-700 hover:underline"
            >
              Generate Kunci Baru
            </button>
          </div>
          <div>
            <span className="text-ink-500">Public Key (Verifikasi Apotek):</span>
            <p className="font-mono text-[10px] text-ink-800 break-all bg-white p-1.5 rounded border border-ink-200">
              {doctor.publicKey}
            </p>
          </div>
          <div>
            <span className="text-ink-500">Private Key (Tersimpan Rahasia di Browser):</span>
            <p className="font-mono text-[10px] text-ink-800 break-all bg-white p-1.5 rounded border border-ink-200">
              {doctor.privateKey.slice(0, 16)}... (Dilindungi)
            </p>
          </div>
        </div>
      )}

      {/* Patient Information Section */}
      <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-ink-100 pb-3 font-semibold text-xs uppercase tracking-wider text-ink-500">
          <User className="h-4 w-4 text-forest-700" />
          <span>Informasi Pasien</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink-600 mb-1">
              Nama Pasien
            </label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full rounded-lg border border-ink-200 px-3 py-1.5 text-xs text-ink-900 focus:border-forest-600 focus:outline-none"
              placeholder="e.g. Budi Santoso"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-600 mb-1">
              Usia (Tahun)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              required
              value={patientAge}
              onChange={(e) => setPatientAge(Number(e.target.value))}
              className="w-full rounded-lg border border-ink-200 px-3 py-1.5 text-xs text-ink-900 focus:border-forest-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-600 mb-1">
              Jenis Kelamin
            </label>
            <select
              value={patientGender}
              onChange={(e) => setPatientGender(e.target.value as 'L' | 'P')}
              className="w-full rounded-lg border border-ink-200 px-3 py-1.5 text-xs text-ink-900 focus:border-forest-600 focus:outline-none"
            >
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prescription Medications Section */}
      <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-ink-100 pb-3">
          <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-ink-500">
            <FileCheck2 className="h-4 w-4 text-forest-700" />
            <span>Order Resep Obat (R/)</span>
          </div>

          {/* Clean Quick Templates */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-ink-400">Template:</span>
            {DEMO_PRESCRIPTION_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTemplate(idx)}
                className="rounded-md border border-ink-200 bg-ink-50 px-2 py-0.5 text-[11px] font-medium text-ink-700 hover:bg-ink-100 transition"
              >
                {tmpl.title}
              </button>
            ))}
          </div>
        </div>

        {/* Drug Item Rows */}
        <div className="space-y-2.5">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-lg border border-ink-200 bg-ink-50/40 p-2.5 sm:flex-row sm:items-center"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-ink-200 text-[10px] font-mono font-bold text-ink-700">
                {index + 1}
              </span>

              <div className="flex-1">
                <input
                  type="text"
                  required
                  placeholder="Nama Obat & Kekuatan (misal: Paracetamol 500mg)"
                  value={item.n}
                  onChange={(e) => handleItemChange(index, 'n', e.target.value)}
                  className="w-full rounded-md border border-ink-200 bg-white px-2.5 py-1 text-xs font-semibold text-ink-900 focus:border-forest-600 focus:outline-none"
                />
              </div>

              <div className="w-20">
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Qty"
                  value={item.q}
                  onChange={(e) => handleItemChange(index, 'q', Number(e.target.value))}
                  className="w-full rounded-md border border-ink-200 bg-white px-2.5 py-1 text-xs font-mono font-bold text-ink-900 text-center focus:border-forest-600 focus:outline-none"
                />
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  required
                  placeholder="Aturan Pakai (misal: 3x1 tab sesudah makan)"
                  value={item.s}
                  onChange={(e) => handleItemChange(index, 's', e.target.value)}
                  className="w-full rounded-md border border-ink-200 bg-white px-2.5 py-1 text-xs text-ink-800 focus:border-forest-600 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                disabled={items.length <= 1}
                className="p-1.5 text-ink-400 hover:text-rose-600 disabled:opacity-30 self-end sm:self-auto"
                title="Hapus obat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 transition"
        >
          <Plus className="h-3.5 w-3.5" /> Tambah Obat Lain
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isGenerating}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest-950 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-forest-900 active:scale-98 disabled:opacity-60"
      >
        <FileCheck2 className="h-4 w-4" />
        {isGenerating ? 'Menandatangani Kriptografi...' : 'Terbitkan & Buat Struk QR'}
      </button>
    </form>
  );
}
