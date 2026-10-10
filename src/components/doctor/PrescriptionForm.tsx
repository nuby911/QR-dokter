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

  // Auto detect current origin in browser
  useEffect(() => {
    if (!baseUrl && typeof window !== 'undefined') {
      onBaseUrlChange(window.location.origin);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Doctor & Facility Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-emerald-50/40 p-4 text-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{doctor.name}</h3>
            <p className="text-xs text-slate-500">
              {doctor.sip} • <span className="font-medium text-teal-700">{doctor.faskes}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowKeyModal(!showKeyModal)}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50 sm:self-auto"
        >
          <Key className="h-3.5 w-3.5 text-teal-600" />
          Kunci Ed25519
        </button>
      </div>

      {/* Network / Mobile Host Setting Bar */}
      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm text-xs">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span className="flex items-center gap-1.5 text-teal-700">
            <Wifi className="h-4 w-4" /> Alamat Host QR (Untuk Test Scan via HP)
          </span>
          <span className="text-[11px] font-normal text-slate-400">
            Kamera HP akan membuka URL ini
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => onBaseUrlChange(e.target.value)}
            placeholder="http://192.168.x.x:3000 atau https://domain.com"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 font-mono text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') onBaseUrlChange(window.location.origin);
            }}
            className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
          >
            Reset Asal
          </button>
        </div>
      </div>

      {/* Key Details Expandable Modal / Drawer */}
      {showKeyModal && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
          <div className="flex items-center justify-between font-semibold text-slate-800">
            <span>Kriptografi Asimetris Dokter (Ed25519)</span>
            <button
              type="button"
              onClick={handleGenerateKeys}
              className="text-teal-600 hover:underline"
            >
              Generate Kunci Baru
            </button>
          </div>
          <div>
            <span className="text-slate-500">Public Key (Verifikasi Apotek):</span>
            <p className="font-mono text-[10px] text-slate-700 break-all bg-white p-1.5 rounded border border-slate-200">
              {doctor.publicKey}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Private Key (Tersimpan Rahasia di Browser):</span>
            <p className="font-mono text-[10px] text-slate-700 break-all bg-white p-1.5 rounded border border-slate-200">
              {doctor.privateKey.slice(0, 16)}... (Dilindungi)
            </p>
          </div>
        </div>
      )}

      {/* Patient Information Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 font-semibold text-slate-900">
          <User className="h-4 w-4 text-teal-600" />
          <span>Informasi Pasien</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Nama Pasien
            </label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="e.g. Budi Santoso"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Usia (Tahun)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              required
              value={patientAge}
              onChange={(e) => setPatientAge(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Jenis Kelamin
            </label>
            <select
              value={patientGender}
              onChange={(e) => setPatientGender(e.target.value as 'L' | 'P')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prescription Items Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <FileCheck2 className="h-4 w-4 text-teal-600" />
            <span>Daftar Obat (R/)</span>
          </div>

          {/* Quick Prescription Templates */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Template Cepat:
            </span>
            {DEMO_PRESCRIPTION_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTemplate(idx)}
                className="rounded-md bg-teal-50 px-2 py-1 text-[11px] font-medium text-teal-700 transition hover:bg-teal-100"
              >
                {tmpl.title}
              </button>
            ))}
          </div>
        </div>

        {/* Drug Item Rows */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:flex-row sm:items-center"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                {index + 1}
              </span>

              <div className="flex-1">
                <input
                  type="text"
                  required
                  placeholder="Nama Obat & Kekuatan (misal: Paracetamol 500mg)"
                  value={item.n}
                  onChange={(e) => handleItemChange(index, 'n', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="w-24">
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Jumlah"
                  value={item.q}
                  onChange={(e) => handleItemChange(index, 'q', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  required
                  placeholder="Aturan Pakai (misal: 3x1 tab sesudah makan)"
                  value={item.s}
                  onChange={(e) => handleItemChange(index, 's', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                disabled={items.length <= 1}
                className="self-end p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 sm:self-auto"
                title="Hapus obat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-teal-300 px-3.5 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-50"
        >
          <Plus className="h-4 w-4" /> Tambah Obat Lain
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isGenerating}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 font-bold text-white shadow-md transition hover:bg-teal-700 active:scale-[0.99] disabled:opacity-60"
      >
        <FileCheck2 className="h-5 w-5" />
        {isGenerating ? 'Menandatangani Kriptografi...' : 'Terbitkan & Buat Struk QR'}
      </button>
    </form>
  );
}
