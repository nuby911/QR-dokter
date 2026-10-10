import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDoctorProfile,
  saveDoctorProfile,
  clearDoctorProfile,
  createDefaultDoctorProfile,
} from '../apps/dokter/src/lib/doctor-store';
import {
  getPharmacyProfile,
  savePharmacyProfile,
  clearPharmacyProfile,
  getInventoryItems,
  seedDemoInventory,
  clearInventory,
} from '../apps/apotek/src/lib/inventory-store';

describe('First-Run Onboarding & Persistent Profiles', () => {
  beforeEach(() => {
    clearDoctorProfile();
    clearPharmacyProfile();
    clearInventory();
  });

  describe('Dokter Onboarding', () => {
    it('returns null on fresh install before setup', () => {
      expect(getDoctorProfile()).toBeNull();
    });

    it('generates unique Ed25519 keypair and saves doctor profile on first-time setup', async () => {
      const profile = await createDefaultDoctorProfile(
        'dr. Rian Pratama, Sp.A',
        '503/SIP/999/2026',
        'Klinik Sehat Keluarga'
      );

      expect(profile.name).toBe('dr. Rian Pratama, Sp.A');
      expect(profile.sip).toBe('503/SIP/999/2026');
      expect(profile.faskes).toBe('Klinik Sehat Keluarga');
      expect(profile.privateKey).toBeDefined();
      expect(profile.privateKey.length).toBe(64); // 32-byte hex
      expect(profile.publicKey).toBeDefined();
      expect(profile.publicKey.length).toBe(64); // 32-byte hex

      // Should persist in store
      const retrieved = getDoctorProfile();
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('dr. Rian Pratama, Sp.A');
    });

    it('can reset doctor profile cleanly', async () => {
      await createDefaultDoctorProfile(
        'dr. Rian Pratama, Sp.A',
        '503/SIP/999/2026',
        'Klinik Sehat Keluarga'
      );
      expect(getDoctorProfile()).not.toBeNull();

      clearDoctorProfile();
      expect(getDoctorProfile()).toBeNull();
    });
  });

  describe('Apotek Onboarding & Inventory Initialization', () => {
    it('returns null on fresh install before pharmacy setup', () => {
      expect(getPharmacyProfile()).toBeNull();
    });

    it('starts with empty inventory on fresh install', () => {
      expect(getInventoryItems()).toEqual([]);
    });

    it('saves pharmacy profile permanently', () => {
      savePharmacyProfile({
        name: 'Apotek Mandiri Sehat',
        sia: '19870101/SIPA/2026',
        pharmacist: 'apt. Dewi Lestari, S.Farm',
        address: 'Jl. Merdeka No. 12',
      });

      const profile = getPharmacyProfile();
      expect(profile).not.toBeNull();
      expect(profile?.name).toBe('Apotek Mandiri Sehat');
      expect(profile?.pharmacist).toBe('apt. Dewi Lestari, S.Farm');
    });

    it('allows seeding demo inventory and clearing inventory', () => {
      expect(getInventoryItems().length).toBe(0);

      seedDemoInventory();
      expect(getInventoryItems().length).toBeGreaterThan(0);

      clearInventory();
      expect(getInventoryItems().length).toBe(0);
    });
  });
});
