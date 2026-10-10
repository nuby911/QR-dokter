import * as ed from '@noble/ed25519';
import type { PrescriptionPayload } from './types';

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Produces deterministic canonical JSON string where all object keys are sorted.
 */
export function canonicalStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalStringify).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  return (
    '{' +
    keys.map((k) => JSON.stringify(k) + ':' + canonicalStringify(obj[k])).join(',') +
    '}'
  );
}

/**
 * Generates an Ed25519 keypair for a doctor.
 */
export async function generateDoctorKeyPair(): Promise<{
  privateKey: string;
  publicKey: string;
}> {
  const privBytes = ed.utils.randomPrivateKey();
  const pubBytes = await ed.getPublicKeyAsync(privBytes);
  return {
    privateKey: bytesToHex(privBytes),
    publicKey: bytesToHex(pubBytes),
  };
}

/**
 * Signs a prescription payload with doctor's private key.
 */
export async function signPrescription(
  payloadWithoutSig: Omit<PrescriptionPayload, 'sig'>,
  privateKeyHex: string
): Promise<string> {
  const canonical = canonicalStringify(payloadWithoutSig);
  const msgBytes = new TextEncoder().encode(canonical);
  const privBytes = hexToBytes(privateKeyHex);
  const sigBytes = await ed.signAsync(msgBytes, privBytes);
  return bytesToHex(sigBytes);
}

/**
 * Verifies the authenticity of a prescription payload against the doctor's public key.
 */
export async function verifyPrescriptionSignature(
  payload: PrescriptionPayload
): Promise<boolean> {
  try {
    const { sig, ...rest } = payload;
    if (!sig || !payload.doc?.pk) return false;
    const canonical = canonicalStringify(rest);
    const msgBytes = new TextEncoder().encode(canonical);
    const sigBytes = hexToBytes(sig);
    const pubBytes = hexToBytes(payload.doc.pk);
    return await ed.verifyAsync(sigBytes, msgBytes, pubBytes);
  } catch {
    return false;
  }
}
