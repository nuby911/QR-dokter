import { describe, it, expect } from 'vitest';
import { signPrescription, verifyPrescriptionSignature } from '../apps/pasien-web/src/lib/crypto';
import { encodePrescriptionToUrl, decodePrescriptionFromUrlHash } from '../apps/pasien-web/src/lib/qr-codec';
import { DEMO_DOCTOR } from '../apps/pasien-web/src/lib/demo-data';
import type { PrescriptionPayload } from '../apps/pasien-web/src/lib/types';

describe('Patient Web Viewer Logic', () => {
  it('correctly processes and validates a genuine prescription URL hash', async () => {
    const rawPayload: Omit<PrescriptionPayload, 'sig'> = {
      v: 1,
      id: 'RX-PATIENT-001',
      doc: {
        n: DEMO_DOCTOR.name,
        sip: DEMO_DOCTOR.sip,
        pk: DEMO_DOCTOR.publicKey,
        faskes: DEMO_DOCTOR.faskes,
      },
      pat: {
        n: 'Dewi Lestari',
        a: 29,
        g: 'P',
      },
      dt: '2026-10-10',
      rx: [
        {
          n: 'Amoxicillin 500mg',
          q: 15,
          s: '3x1 kaplet sesudah makan (habiskan)',
        },
      ],
    };

    const signature = await signPrescription(rawPayload, DEMO_DOCTOR.privateKey);
    const fullPayload: PrescriptionPayload = {
      ...rawPayload,
      sig: signature,
    };

    const url = encodePrescriptionToUrl(fullPayload, 'http://localhost:3000');
    const hash = url.substring(url.indexOf('#'));

    // Patient viewer extracts hash
    const decoded = decodePrescriptionFromUrlHash(hash);
    expect(decoded).not.toBeNull();
    expect(decoded?.pat.n).toBe('Dewi Lestari');

    // Patient viewer verifies signature
    const isValid = await verifyPrescriptionSignature(decoded!);
    expect(isValid).toBe(true);
  });

  it('detects and flags signature failure on tampered hash payload', async () => {
    const rawPayload: Omit<PrescriptionPayload, 'sig'> = {
      v: 1,
      id: 'RX-PATIENT-002',
      doc: {
        n: DEMO_DOCTOR.name,
        sip: DEMO_DOCTOR.sip,
        pk: DEMO_DOCTOR.publicKey,
        faskes: DEMO_DOCTOR.faskes,
      },
      pat: {
        n: 'Dewi Lestari',
        a: 29,
        g: 'P',
      },
      dt: '2026-10-10',
      rx: [
        {
          n: 'Amoxicillin 500mg',
          q: 15,
          s: '3x1 kaplet sesudah makan',
        },
      ],
    };

    const signature = await signPrescription(rawPayload, DEMO_DOCTOR.privateKey);

    // Tampered object inside hash
    const tamperedPayload: PrescriptionPayload = {
      ...rawPayload,
      rx: [
        {
          n: 'Amoxicillin 500mg',
          q: 99, // tampered qty!
          s: '3x1 kaplet sesudah makan',
        },
      ],
      sig: signature,
    };

    const url = encodePrescriptionToUrl(tamperedPayload, 'http://localhost:3000');
    const hash = url.substring(url.indexOf('#'));
    const decoded = decodePrescriptionFromUrlHash(hash);

    expect(decoded).not.toBeNull();
    const isValid = await verifyPrescriptionSignature(decoded!);
    expect(isValid).toBe(false);
  });

  it('returns null on invalid hash', () => {
    expect(decodePrescriptionFromUrlHash('#d=xyz_corrupted')).toBeNull();
  });
});
