import { describe, it, expect } from 'vitest';
import {
  generateDoctorKeyPair,
  signPrescription,
  verifyPrescriptionSignature,
} from '../apps/pasien-web/src/lib/crypto';
import {
  encodePrescriptionToUrl,
  decodePrescriptionFromUrlHash,
} from '../apps/pasien-web/src/lib/qr-codec';
import type { PrescriptionPayload } from '../apps/pasien-web/src/lib/types';

describe('Cryptographic Engine & QR Codec', () => {
  it('generates a valid 32-byte Ed25519 keypair in hex', async () => {
    const keyPair = await generateDoctorKeyPair();
    expect(keyPair.privateKey).toHaveLength(64); // 32 bytes hex
    expect(keyPair.publicKey).toHaveLength(64);  // 32 bytes hex
  });

  it('signs and verifies a valid prescription payload', async () => {
    const keyPair = await generateDoctorKeyPair();

    const payloadWithoutSig: Omit<PrescriptionPayload, 'sig'> = {
      v: 1,
      id: 'RX-20261010-001',
      doc: {
        n: 'dr. Andi Wijaya',
        sip: 'SIP.440/123/DISKES/2026',
        pk: keyPair.publicKey,
        faskes: 'Klinik Pratama Sehat',
      },
      pat: {
        n: 'Budi Santoso',
        a: 32,
        g: 'L',
      },
      dt: '2026-10-10',
      rx: [
        {
          n: 'Paracetamol 500mg',
          q: 10,
          s: '3x1 tab sesudah makan',
        },
      ],
    };

    const signature = await signPrescription(payloadWithoutSig, keyPair.privateKey);
    expect(signature).toBeDefined();
    expect(signature.length).toBeGreaterThan(0);

    const fullPayload: PrescriptionPayload = {
      ...payloadWithoutSig,
      sig: signature,
    };

    const isValid = await verifyPrescriptionSignature(fullPayload);
    expect(isValid).toBe(true);
  });

  it('detects tampering when prescription data is modified', async () => {
    const keyPair = await generateDoctorKeyPair();

    const payloadWithoutSig: Omit<PrescriptionPayload, 'sig'> = {
      v: 1,
      id: 'RX-20261010-002',
      doc: {
        n: 'dr. Andi Wijaya',
        sip: 'SIP.440/123/DISKES/2026',
        pk: keyPair.publicKey,
        faskes: 'Klinik Pratama Sehat',
      },
      pat: {
        n: 'Siti Rahma',
        a: 28,
        g: 'P',
      },
      dt: '2026-10-10',
      rx: [
        {
          n: 'Amoxicillin 500mg',
          q: 10,
          s: '3x1 tab habiskan',
        },
      ],
    };

    const signature = await signPrescription(payloadWithoutSig, keyPair.privateKey);

    // Tamper: Change quantity from 10 to 100
    const tamperedPayload: PrescriptionPayload = {
      ...payloadWithoutSig,
      rx: [
        {
          n: 'Amoxicillin 500mg',
          q: 100, // TAMPERED!
          s: '3x1 tab habiskan',
        },
      ],
      sig: signature,
    };

    const isValid = await verifyPrescriptionSignature(tamperedPayload);
    expect(isValid).toBe(false);
  });

  it('encodes prescription to universal URL and decodes back cleanly from hash fragment', async () => {
    const keyPair = await generateDoctorKeyPair();

    const payloadWithoutSig: Omit<PrescriptionPayload, 'sig'> = {
      v: 1,
      id: 'RX-20261010-003',
      doc: {
        n: 'dr. Andi Wijaya',
        sip: 'SIP.440/123',
        pk: keyPair.publicKey,
        faskes: 'Klinik Sehat',
      },
      pat: {
        n: 'Ahmad Dahlan',
        a: 45,
        g: 'L',
      },
      dt: '2026-10-10',
      rx: [
        {
          n: 'Cetirizine 10mg',
          q: 5,
          s: '1x1 malam hari',
        },
      ],
    };

    const signature = await signPrescription(payloadWithoutSig, keyPair.privateKey);
    const fullPayload: PrescriptionPayload = {
      ...payloadWithoutSig,
      sig: signature,
    };

    const url = encodePrescriptionToUrl(fullPayload, 'http://192.168.1.15:3000');
    expect(url).toContain('http://192.168.1.15:3000/view#d=');

    // Extract the hash part
    const hash = url.substring(url.indexOf('#'));
    const decoded = decodePrescriptionFromUrlHash(hash);

    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe('RX-20261010-003');
    expect(decoded?.rx[0].n).toBe('Cetirizine 10mg');
    expect(decoded?.sig).toBe(signature);
  });

  it('handles malformed or invalid hash gracefully returning null', () => {
    expect(decodePrescriptionFromUrlHash('')).toBeNull();
    expect(decodePrescriptionFromUrlHash('#')).toBeNull();
    expect(decodePrescriptionFromUrlHash('#d=invalid_garbage_base64_string')).toBeNull();
  });
});
