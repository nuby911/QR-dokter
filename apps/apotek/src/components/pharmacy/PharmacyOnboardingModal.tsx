'use client';

import React, { useState } from 'react';
import { Pill, ShieldCheck, CheckCircle2, X, Store, Box } from 'lucide-react';
import type { PharmacyProfile } from '../../lib/types';
import { savePharmacyProfile, seedDemoInventory, clearInventory } from '../../lib/inventory-store';

interface PharmacyOnboardingModalProps {
  isOpen: boolean;
  isMandatory?: boolean;
  currentProfile?: PharmacyProfile | null;
  onSaved: (profile: PharmacyProfile) => void;
  onClose?: () => void;
}

export default function PharmacyOnboardingModal({
  isOpen,
  isMandatory = false,
  currentProfile,
  onSaved,
  onClose,
}: PharmacyOnboardingModalProps) {
  const [name, setName] = useState<string>(currentProfile?.name || '');
  const [sia, setSia] = useState<string>(currentProfile?.sia || '');
  const [pharmacist, setPharmacist] = useState<string>(currentProfile?.pharmacist || '');
  const [address, setAddress] = useState<string>(currentProfile?.address || '');
  const [phone, setPhone] = useState<string>(currentProfile?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !sia.trim() || !pharmacist.trim()) {
      setError('Mohon lengkapi Nama Apotek, Nomor SIA/SIPA, dan Nama Apoteker.');
      return;
    }

    setIsSubmitting(true);
    try {
      const profile: PharmacyProfile = {
        name: name.trim(),
        sia: sia.trim(),
        pharmacist: pharmacist.trim(),
        address: address.trim(),
        phone: phone.trim(),
      };

      savePharmacyProfile(profile);

      // Mandatory first-run setup always starts with clean empty inventory
      if (isMandatory) {
        clearInventory();
      }

      onSaved(profile);
    } catch (err) {
      console.error('Error saving pharmacy profile:', err);
      setError('Gagal menyimpan profil: ' + String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-[#ebdccd] bg-white p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 my-8">
        {!isMandatory && onClose && (
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-1 rounded-full text-[#716358] hover:text-[#241a14] hover:bg-[#f5ece1] transition"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e86a28] text-white shadow-md mx-auto mb-1">
            <Pill className="h-7 w-7" />
          </div>
          <div className="inline-block rounded-full bg-[#f5ece1] px-3 py-1 text-[11px] font-mono uppercase font-bold text-[#e86a28]">
            {isMandatory ? 'Setup Awal Pengguna Baru' : 'Pengaturan Profil Apotek'}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#241a14] tracking-tight">
            {isMandatory ? 'Lengkapi Identitas Apotek' : 'Edit Identitas Apotek'}
          </h2>
          <p className="text-xs text-[#716358] max-w-sm mx-auto leading-relaxed">
            {isMandatory
              ? 'Anda wajib melengkapi identitas apotek dan apoteker sebelum membuka terminal kasir farmasi. Pengaturan ini hanya perlu diisi sekali.'
              : 'Perbarui data identitas apotek dan apoteker penanggung jawab.'}
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#716358] font-bold mb-1">
              Nama Apotek <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Apotek Kimia Prima Sentosa"
              className="w-full rounded-xl border border-[#ebdccd] bg-[#fbfbf8] px-3.5 py-2.5 text-xs text-[#241a14] focus:border-[#e86a28] focus:bg-white focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#716358] font-bold mb-1">
                Nomor SIA / SIPA <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={sia}
                onChange={(e) => setSia(e.target.value)}
                placeholder="Contoh: 19850412/SIPA/DKS/2026"
                className="w-full rounded-xl border border-[#ebdccd] bg-[#fbfbf8] px-3.5 py-2.5 text-xs text-[#241a14] font-mono focus:border-[#e86a28] focus:bg-white focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[#716358] font-bold mb-1">
                Nama Apoteker (SIPA) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={pharmacist}
                onChange={(e) => setPharmacist(e.target.value)}
                placeholder="Contoh: apt. Hendra Kusuma, S.Farm"
                className="w-full rounded-xl border border-[#ebdccd] bg-[#fbfbf8] px-3.5 py-2.5 text-xs text-[#241a14] focus:border-[#e86a28] focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#716358] font-medium mb-1">
                Alamat Apotek
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Contoh: Jl. Gajah Mada No. 88"
                className="w-full rounded-xl border border-[#ebdccd] bg-[#fbfbf8] px-3.5 py-2.5 text-xs text-[#241a14] focus:border-[#e86a28] focus:bg-white focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[#716358] font-medium mb-1">
                No. Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 0812-3456-7890"
                className="w-full rounded-xl border border-[#ebdccd] bg-[#fbfbf8] px-3.5 py-2.5 text-xs text-[#241a14] focus:border-[#e86a28] focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          {/* Initial Inventory Notice (Only on mandatory setup) */}
          {isMandatory && (
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 space-y-1">
              <span className="font-bold text-emerald-950 block">
                Etalase Master Obat Dimulai dari Nol (0 Obat)
              </span>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Katalog obat akan dimulai bersih dari nol tanpa data dummy. Anda dapat memasukkan data obat apotek Anda satu per satu lewat tombol &quot;+ Tambah Obat&quot;.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#e86a28] hover:bg-[#d95a18] py-3.5 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg transition active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {isSubmitting
                ? 'Menyimpan Profil...'
                : isMandatory
                ? 'Simpan & Buka Terminal Apotek'
                : 'Simpan Perubahan'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
