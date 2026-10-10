import { describe, it, expect } from 'vitest';
import { canonicalStringify, signPrescription, verifyPrescriptionSignature } from '../apps/pasien-web/src/lib/crypto';
import { encodePrescriptionToUrl, decodePrescriptionFromUrlHash } from '../apps/pasien-web/src/lib/qr-codec';
import { DEMO_DOCTOR } from '../apps/pasien-web/src/lib/demo-data';
import type { PrescriptionPayload } from '../apps/pasien-web/src/lib/types';

describe('Edge Cases and Defensive Hardening Audit Tests', () => {
  it('canonicalStringify correctly excludes undefined fields', () => {
    const withUndefined = {
      id: 'RX-001',
      note: undefined,
      phone: undefined,
      nested: {
        a: 1,
        b: undefined,
      },
    };

    const canonical = canonicalStringify(withUndefined);
    expect(canonical).not.toContain('undefined');
    expect(canonical).toBe('{"id":"RX-001","nested":{"a":1}}');
  });

  it('signature verification succeeds even if optional fields are omitted or undefined', async () => {
    const rawPayload: Omit<PrescriptionPayload, 'sig'> = {
      v: 1,
      id: 'RX-OPT-001',
      doc: {
        n: DEMO_DOCTOR.name,
        sip: DEMO_DOCTOR.sip,
        pk: DEMO_DOCTOR.publicKey,
        faskes: DEMO_DOCTOR.faskes,
      },
      pat: {
        n: 'Pasien Test',
        a: 40,
        g: 'L',
        phone: undefined, // optional field
      },
      dt: '2026-10-10',
      rx: [
        {
          n: 'Amoxicillin 500mg',
          q: 10,
          s: '3x1 sesudah makan',
          note: undefined, // optional field
        },
      ],
    };

    const sig = await signPrescription(rawPayload, DEMO_DOCTOR.privateKey);
    const fullPayload: PrescriptionPayload = { ...rawPayload, sig };

    const url = encodePrescriptionToUrl(fullPayload, 'http://localhost:3000');
    const hash = url.substring(url.indexOf('#'));
    const decoded = decodePrescriptionFromUrlHash(hash);

    expect(decoded).not.toBeNull();
    const isValid = await verifyPrescriptionSignature(decoded!);
    expect(isValid).toBe(true);
  });

  it('decodePrescriptionFromUrlHash handles URL query strings with space normalized to +', async () => {
    const samplePayload: PrescriptionPayload = {
      v: 1,
      id: 'RX-SPACE-001',
      doc: {
        n: DEMO_DOCTOR.name,
        sip: DEMO_DOCTOR.sip,
        pk: DEMO_DOCTOR.publicKey,
        faskes: DEMO_DOCTOR.faskes,
      },
      pat: {
        n: 'Siti Rahma',
        a: 28,
        g: 'P',
      },
      dt: '2026-10-10',
      rx: [
        {
          n: 'Paracetamol 500mg',
          q: 10,
          s: '3x1 tablet sesudah makan',
        },
      ],
      sig: 'dummy_sig_1234567890abcdef',
    };

    const url = encodePrescriptionToUrl(samplePayload, 'http://localhost:3000');
    const hash = url.substring(url.indexOf('#'));

    // Simulate browser query string where '+' characters were converted to spaces ' '
    const modifiedWithSpaces = hash.replace(/\+/g, ' ');
    const decoded = decodePrescriptionFromUrlHash(modifiedWithSpaces);

    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe('RX-SPACE-001');
    expect(decoded?.pat.n).toBe('Siti Rahma');
  });

  it('decodePrescriptionFromUrlHash strips trailing query parameters gracefully', async () => {
    const samplePayload: PrescriptionPayload = {
      v: 1,
      id: 'RX-QUERY-001',
      doc: {
        n: DEMO_DOCTOR.name,
        sip: DEMO_DOCTOR.sip,
        pk: DEMO_DOCTOR.publicKey,
        faskes: DEMO_DOCTOR.faskes,
      },
      pat: {
        n: 'Ahmad Dahlan',
        a: 45,
        g: 'L',
      },
      dt: '2026-10-10',
      rx: [
        {
          n: 'Vitamin C 500mg',
          q: 30,
          s: '1x1 sesudah makan',
        },
      ],
      sig: 'dummy_sig_1234567890abcdef',
    };

    const url = encodePrescriptionToUrl(samplePayload, 'http://localhost:3000');
    const urlWithExtraParam = `${url}&utm_source=scanner&session=12345`;

    const decoded = decodePrescriptionFromUrlHash(urlWithExtraParam);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe('RX-QUERY-001');
  });

  it('rejects oversized input strings to prevent decompression denial-of-service', () => {
    const massiveGarbage = 'a'.repeat(9000);
    expect(decodePrescriptionFromUrlHash(massiveGarbage)).toBeNull();
  });

  it('rejects malformed payloads with missing or invalid medication item types', () => {
    // Missing required items or empty rx array
    const malformed = {
      v: 1,
      id: 'RX-BAD',
      doc: { n: 'dr. Test', pk: '123' },
      pat: { n: 'Pasien' },
      rx: [], // Empty medication list
      sig: 'sig',
    };

    const json = JSON.stringify(malformed);
    const decoded = decodePrescriptionFromUrlHash(json);
    expect(decoded).toBeNull();
  });
});
