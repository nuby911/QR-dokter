import { describe, it, expect } from 'vitest';
import QRCode from 'qrcode';
import { signPrescription, verifyPrescriptionSignature } from '../src/lib/crypto';
import { encodePrescriptionToUrl, decodePrescriptionFromUrlHash } from '../src/lib/qr-codec';
import { DEMO_DOCTOR } from '../src/lib/demo-data';
import type { PrescriptionPayload } from '../src/lib/types';

describe('Doctor Portal Logic & Struk Generation', () => {
  it('generates a cryptographically signed prescription and verifies cleanly', async () => {
    const rawPayload: Omit<PrescriptionPayload, 'sig'> = {
      v: 1,
      id: `RX-${Date.now()}`,
      doc: {
        n: DEMO_DOCTOR.name,
        sip: DEMO_DOCTOR.sip,
        pk: DEMO_DOCTOR.publicKey,
        faskes: DEMO_DOCTOR.faskes,
      },
      pat: {
        n: 'Agus Salim',
        a: 35,
        g: 'L',
        phone: '08123456789',
      },
      dt: '2026-10-10',
      rx: [
        {
          n: 'Amoxicillin 500mg',
          q: 15,
          s: '3x1 kaplet sesudah makan (habiskan)',
        },
        {
          n: 'Paracetamol 500mg',
          q: 10,
          s: '3x1 tablet bila demam',
        },
      ],
    };

    const signature = await signPrescription(rawPayload, DEMO_DOCTOR.privateKey);
    const fullPayload: PrescriptionPayload = {
      ...rawPayload,
      sig: signature,
    };

    expect(await verifyPrescriptionSignature(fullPayload)).toBe(true);

    // Test QR URL generation with local Wi-Fi IP for phone testing
    const localNetworkBaseUrl = 'http://192.168.1.100:3000';
    const targetUrl = encodePrescriptionToUrl(fullPayload, localNetworkBaseUrl);
    expect(targetUrl).toContain('http://192.168.1.100:3000/view#d=');

    // Test QR generation to Data URL
    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      scale: 6,
    });
    expect(qrDataUrl).toContain('data:image/png;base64,');

    // Decode back from generated URL
    const hashPart = targetUrl.substring(targetUrl.indexOf('#'));
    const decoded = decodePrescriptionFromUrlHash(hashPart);
    expect(decoded?.pat.n).toBe('Agus Salim');
    expect(decoded?.rx).toHaveLength(2);
  });
});
