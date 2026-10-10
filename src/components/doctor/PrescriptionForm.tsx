'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Key,
  Smartphone,
  CheckCircle2,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Doctor Credentials & Host Banner */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-100 pb-3">
          <div>
            <div className="text-xs font-bold text-neutral-900">{doctor.name}</div>
            <div className="text-[11px] text-neutral-500 font-mono">
              SIP: {doctor.sip} &bull; {doctor.faskes}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowKeyModal(!showKeyModal)}
            className="inline-flex items-center gap-1.5 rounded border border-neutral-200 px-2 py-1 text-[11px] text-neutral-600 hover:bg-neutral-50 transition w-fit"
          >
            <Key className="h-3 w-3 text-neutral-500" />
            <span>Kunci Ed25519</span>
          </button>
        </div>

        {/* QR Base URL Configuration */}
        <div className="text-xs space-y-1.5">
          <label className="block text-neutral-600 font-medium text-[11px]">
            Host QR Pasien (Untuk Pemindaian Kamera Ponsel)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => onBaseUrlChange(e.target.value)}
              placeholder="http://192.168.1.7:3000"
              className="flex-1 rounded border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-mono text-xs text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
            />
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => onBaseUrlChange('http://192.168.1.7:3000')}
                className="rounded bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition flex items-center gap-1"
              >
                <Smartphone className="h-3 w-3" />
                <span>Wi-Fi (192.168.1.7)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') onBaseUrlChange(window.location.origin);
                }}
                className="rounded border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
              >
                Localhost
              </button>
            </div>
          </div>
        </div>

        {/* Keys Details Drawer */}
        {showKeyModal && (
          <div className="rounded border border-neutral-200 bg-neutral-50 p-3 text-xs space-y-2 mt-2">
            <div className="flex items-center justify-between font-semibold text-neutral-800">
              <span>Pasangan Kunci Kriptografi (Ed25519)</span>
              <button
                type="button"
                onClick={handleGenerateKeys}
                className="text-neutral-900 underline text-[11px]"
              >
                Generate Ulang
              </button>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-neutral-400 block">
                Public Key (Diverifikasi oleh Viewer &amp; Apotek)
              </span>
              <p className="font-mono text-[10px] text-neutral-800 break-all bg-white p-1.5 rounded border border-neutral-200 mt-0.5">
                {doctor.publicKey}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-neutral-400 block">
                Private Key (Tersimpan Lokal untuk Tanda Tangan)
              </span>
              <p className="font-mono text-[10px] text-neutral-800 break-all bg-white p-1.5 rounded border border-neutral-200 mt-0.5">
                {doctor.privateKey.slice(0, 16)}... (Aman di memori)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Patient Information Section */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4 sm:p-5 space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
          Data Pasien
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block text-neutral-600 font-medium mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full rounded border border-neutral-200 px-3 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none"
              placeholder="e.g. Budi Santoso"
            />
          </div>

          <div>
            <label className="block text-neutral-600 font-medium mb-1">
              Usia (Tahun)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              required
              value={patientAge}
              onChange={(e) => setPatientAge(Number(e.target.value))}
              className="w-full rounded border border-neutral-200 px-3 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-neutral-600 font-medium mb-1">
              Jenis Kelamin
            </label>
            <select
              value={patientGender}
              onChange={(e) => setPatientGender(e.target.value as 'L' | 'P')}
              className="w-full rounded border border-neutral-200 px-3 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none"
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prescription Medications Section */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-100 pb-3">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Daftar Obat (R/)
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-neutral-400">Template Cepat:</span>
            {DEMO_PRESCRIPTION_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTemplate(idx)}
                className="rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-700 hover:bg-neutral-100 transition"
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
              className="flex flex-col sm:flex-row sm:items-center gap-2 rounded border border-neutral-200 bg-neutral-50/50 p-2 text-xs"
            >
              <span className="font-mono text-xs font-bold text-neutral-400 w-5 text-center shrink-0">
                {index + 1}.
              </span>

              <div className="flex-1">
                <input
                  type="text"
                  required
                  placeholder="Nama & Dosis Obat (e.g. Paracetamol 500mg)"
                  value={item.n}
                  onChange={(e) => handleItemChange(index, 'n', e.target.value)}
                  className="w-full rounded border border-neutral-200 bg-white px-2.5 py-1.5 font-medium text-neutral-900 focus:border-neutral-900 focus:outline-none"
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
                  className="w-full rounded border border-neutral-200 bg-white px-2.5 py-1.5 font-mono text-center text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  required
                  placeholder="Aturan Pakai (e.g. 3x1 tablet sesudah makan)"
                  value={item.s}
                  onChange={(e) => handleItemChange(index, 's', e.target.value)}
                  className="w-full rounded border border-neutral-200 bg-white px-2.5 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                disabled={items.length <= 1}
                className="p-1.5 text-neutral-400 hover:text-red-600 disabled:opacity-20 transition"
                title="Hapus baris obat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 rounded border border-dashed border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 transition"
        >
          <Plus className="h-3.5 w-3.5" /> Tambah Obat Lain
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isGenerating}
        className="flex w-full items-center justify-center gap-2 rounded bg-neutral-900 py-3 text-xs font-bold text-white hover:bg-neutral-800 transition active:scale-[0.99] disabled:opacity-50"
      >
        <CheckCircle2 className="h-4 w-4" />
        <span>{isGenerating ? 'Menandatangani Kriptografi...' : 'Terbitkan & Cetak Struk QR'}</span>
      </button>
    </form>
  );
}
