import type { DoctorProfile } from './types';
import { generateDoctorKeyPair } from './crypto';

const DOCTOR_PROFILE_KEY = 'mediqr_doctor_profile_v1';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

// In-memory fallback for SSR
let memoryDoctorProfile: DoctorProfile | null = null;

export function getDoctorProfile(): DoctorProfile | null {
  if (!isBrowser()) return memoryDoctorProfile;
  try {
    const raw = window.localStorage.getItem(DOCTOR_PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return memoryDoctorProfile;
  }
}

export function saveDoctorProfile(profile: DoctorProfile): void {
  if (!isBrowser()) {
    memoryDoctorProfile = profile;
    return;
  }
  try {
    window.localStorage.setItem(DOCTOR_PROFILE_KEY, JSON.stringify(profile));
    memoryDoctorProfile = profile;
  } catch (err) {
    console.error('Failed to save doctor profile:', err);
  }
}

export function clearDoctorProfile(): void {
  memoryDoctorProfile = null;
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(DOCTOR_PROFILE_KEY);
    } catch {
      // ignore
    }
  }
}

export async function createDefaultDoctorProfile(
  name: string,
  sip: string,
  faskes: string,
  address?: string,
  phone?: string
): Promise<DoctorProfile> {
  const pair = await generateDoctorKeyPair();
  const profile: DoctorProfile = {
    name: name.trim(),
    sip: sip.trim(),
    faskes: faskes.trim(),
    address: address?.trim(),
    phone: phone?.trim(),
    privateKey: pair.privateKey,
    publicKey: pair.publicKey,
  };
  saveDoctorProfile(profile);
  return profile;
}
