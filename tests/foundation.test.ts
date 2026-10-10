import { describe, it, expect } from 'vitest';
import { CLINICAL_THEME, type PrescriptionPayload, type PharmacyItem } from '../src/lib/types';

describe('Foundation & System Types', () => {
  it('defines the Clinical Teal theme tokens properly', () => {
    expect(CLINICAL_THEME.primary).toBe('#0d9488'); // teal-600
    expect(CLINICAL_THEME.accent).toBe('#10b981');  // emerald-500
  });

  it('validates a standard prescription payload contract', () => {
    const mockPrescription: PrescriptionPayload = {
      v: 1,
      id: 'RX-20261010-001',
      doc: {
        n: 'dr. Andi Wijaya',
        sip: 'SIP.440/123/DISKES/2026',
        pk: 'mock-public-key-hex',
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
      sig: 'mock-signature-hex',
    };

    expect(mockPrescription.v).toBe(1);
    expect(mockPrescription.rx).toHaveLength(1);
    expect(mockPrescription.doc.n).toContain('dr. Andi');
  });

  it('validates a standard pharmacy inventory item contract', () => {
    const mockItem: PharmacyItem = {
      id: 'item-1',
      barcode: '8991234567890',
      name: 'Sanmol 500mg Strip',
      category: 'Analgesik & Antipiretik',
      unit: 'strip',
      currentStock: 150,
      minStockAlert: 15,
      price: 12000,
    };

    expect(mockItem.currentStock).toBe(150);
    expect(mockItem.unit).toBe('strip');
  });
});
