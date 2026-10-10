'use client';

import React, { useState } from 'react';
import { Stethoscope, ShieldCheck, Key, CheckCircle2, Sparkles, X } from 'lucide-react';
import type { DoctorProfile } from '../../lib/types';
import { saveDoctorProfile, createDefaultDoctorProfile } from '../../lib/doctor-store';
import { generateDoctorKeyPair } from '../../lib/crypto';

interface DoctorOnboardingModalProps {
  isOpen: boolean;
  isMandatory?: boolean;
  currentProfile?: DoctorProfile | null;
  onSaved: (profile: DoctorProfile) => void;
  onClose?: () => void;
}

export default function DoctorOnboardingModal({
  isOpen,
  isMandatory = false,
  currentProfile,
  onSaved,
  onClose,
}: DoctorOnboardingModalProps) {
  const [name, setName] = useState<string>(currentProfile?.name || '');
  const [sip, setSip] = useState<string>(currentProfile?.sip || '');
  const [faskes, setFaskes] = useState<string>(currentProfile?.faskes || '');
  const [address, setAddress] = useState<string>(currentProfile?.address || '');
  const [phone, setPhone] = useState<string>(currentProfile?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !sip.trim() || !faskes.trim()) {
      setError('Mohon lengkapi Nama Dokter, Nomor SIP, dan Nama Faskes.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalProfile: DoctorProfile;
      if (currentProfile && currentProfile.privateKey && currentProfile.publicKey) {
        // Keep existing keys if editing
        finalProfile = {
          ...currentProfile,
          name: name.trim(),
          sip: sip.trim(),
          faskes: faskes.trim(),
          address: address.trim(),
          phone: phone.trim(),
        };
        saveDoctorProfile(finalProfile);
      } else {
        // Generate new unique Ed25519 keypair for new setup
        finalProfile = await createDefaultDoctorProfile(name, sip, faskes, address, phone);
      }

      onSaved(finalProfile);
    } catch (err) {
      console.error('Error saving profile:', err);
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
            <Stethoscope className="h-7 w-7" />
          </div>
          <div className="inline-block rounded-full bg-[#f5ece1] px-3 py-1 text-[11px] font-mono uppercase font-bold text-[#e86a28]">
            {isMandatory ? 'Setup Awal Pengguna Baru' : 'Pengaturan Profil Dokter'}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#241a14] tracking-tight">
            {isMandatory ? 'Lengkapi Profil Praktik Dokter' : 'Edit Identitas Dokter'}
          </h2>
          <p className="text-xs text-[#716358] max-w-sm mx-auto leading-relaxed">
            {isMandatory
              ? 'Anda wajib melengkapi identitas dokter dan faskes sebelum menerbitkan resep medis. Pengaturan ini hanya perlu diisi sekali.'
              : 'Perbarui data identitas dokter dan faskes yang akan tercetak pada setiap struk peresepan.'}
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
              Nama Lengkap &amp; Gelar <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: dr. Budi Santoso, Sp.A"
              className="w-full rounded-xl border border-[#ebdccd] bg-[#fbfbf8] px-3.5 py-2.5 text-xs text-[#241a14] focus:border-[#e86a28] focus:bg-white focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#716358] font-bold mb-1">
                Nomor SIP (Surat Izin Praktik) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={sip}
                onChange={(e) => setSip(e.target.value)}
                placeholder="Contoh: 503/SIP/123/DKS/2026"
                className="w-full rounded-xl border border-[#ebdccd] bg-[#fbfbf8] px-3.5 py-2.5 text-xs text-[#241a14] font-mono focus:border-[#e86a28] focus:bg-white focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[#716358] font-bold mb-1">
                Klinik / RS / Faskes <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={faskes}
                onChange={(e) => setFaskes(e.target.value)}
                placeholder="Contoh: Klinik Pratama Medika"
                className="w-full rounded-xl border border-[#ebdccd] bg-[#fbfbf8] px-3.5 py-2.5 text-xs text-[#241a14] focus:border-[#e86a28] focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#716358] font-medium mb-1">
                Alamat Praktik (Opsional)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Contoh: Jl. Sudirman No. 10"
                className="w-full rounded-xl border border-[#ebdccd] bg-[#fbfbf8] px-3.5 py-2.5 text-xs text-[#241a14] focus:border-[#e86a28] focus:bg-white focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[#716358] font-medium mb-1">
                No. Telepon / WhatsApp (Opsional)
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

          {/* Cryptography Badge */}
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>Keamanan Kriptografi Ed25519 Standalone</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Sistem akan secara otomatis menerbitkan pasangan <strong>Kunci Digital Pribadi</strong> unik yang disimpan di perangkat Anda. Resep yang diterbitkan terjamin 100% otentik dan anti-pemalsuan.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#e86a28] hover:bg-[#d95a18] py-3.5 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg transition active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {isSubmitting
                ? 'Menyimpan & Menerbitkan Kunci...'
                : isMandatory
                ? 'Simpan & Buka Terminal Dokter'
                : 'Simpan Perubahan'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
