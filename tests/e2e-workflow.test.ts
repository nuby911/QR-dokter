import { describe, it, expect, beforeEach } from 'vitest';
import {
  getInventoryItems,
  deductItemStock,
  recordDispenseTransaction,
  getDispenseHistory,
  resetToDemoData,
} from '../apps/apotek/src/lib/inventory-store';
import { signPrescription, verifyPrescriptionSignature } from '../apps/pasien-web/src/lib/crypto';
import { encodePrescriptionToUrl, decodePrescriptionFromUrlHash } from '../apps/pasien-web/src/lib/qr-codec';
import { DEMO_DOCTOR } from '../apps/pasien-web/src/lib/demo-data';
import type { PrescriptionPayload } from '../apps/pasien-web/src/lib/types';

describe('End-to-End System Lifecycle: Doctor -> Patient -> Pharmacy', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('runs complete lifecycle from doctor generation to pharmacy stock deduction', async () => {
    // Phase 1: Doctor Generates & Signs Prescription
    const prescriptionData: Omit<PrescriptionPayload, 'sig'> = {
      v: 1,
      id: 'RX-E2E-999',
      doc: {
        n: DEMO_DOCTOR.name,
        sip: DEMO_DOCTOR.sip,
        pk: DEMO_DOCTOR.publicKey,
        faskes: DEMO_DOCTOR.faskes,
      },
      pat: {
        n: 'Rizky Pratama',
        a: 30,
        g: 'L',
        phone: '081211112222',
      },
      dt: '2026-10-10',
      rx: [
        {
          n: 'Paracetamol 500mg',
          q: 10,
          s: '3x1 tablet sesudah makan',
        },
        {
          n: 'Cetirizine 10mg',
          q: 5,
          s: '1x1 tablet malam hari',
        },
      ],
    };

    const signature = await signPrescription(prescriptionData, DEMO_DOCTOR.privateKey);
    const completePrescription: PrescriptionPayload = {
      ...prescriptionData,
      sig: signature,
    };

    // Struk prints QR with local network IP for phone testing
    const qrUrl = encodePrescriptionToUrl(completePrescription, 'http://192.168.1.15:3000');
    expect(qrUrl).toContain('http://192.168.1.15:3000/view#d=');

    // Phase 2: Patient scans QR with smartphone
    const hashFragment = qrUrl.substring(qrUrl.indexOf('#'));
    const patientViewData = decodePrescriptionFromUrlHash(hashFragment);
    expect(patientViewData).not.toBeNull();
    expect(patientViewData?.pat.n).toBe('Rizky Pratama');
    expect(patientViewData?.rx).toHaveLength(2);

    const isPatientVerified = await verifyPrescriptionSignature(patientViewData!);
    expect(isPatientVerified).toBe(true);

    // Phase 3: Pharmacy Scans QR and Maps Inventory
    const pharmacyScannedData = decodePrescriptionFromUrlHash(hashFragment);
    expect(pharmacyScannedData).not.toBeNull();
    const isPharmacyVerified = await verifyPrescriptionSignature(pharmacyScannedData!);
    expect(isPharmacyVerified).toBe(true);

    const initialInventory = getInventoryItems();
    const sanmol = initialInventory.find((i) => i.name.toLowerCase().includes('sanmol'))!;
    const cetirizine = initialInventory.find((i) => i.name.toLowerCase().includes('cetirizine'))!;

    const initialSanmolStock = sanmol.currentStock;
    const initialCetirizineStock = cetirizine.currentStock;

    // Dispense: deduct 10 Paracetamol (Sanmol) and 5 Cetirizine
    expect(deductItemStock(sanmol.id, 10)).toBe(true);
    expect(deductItemStock(cetirizine.id, 5)).toBe(true);

    // Verify stock dropped accurately
    const afterInventory = getInventoryItems();
    expect(afterInventory.find((i) => i.id === sanmol.id)?.currentStock).toBe(initialSanmolStock - 10);
    expect(afterInventory.find((i) => i.id === cetirizine.id)?.currentStock).toBe(initialCetirizineStock - 5);

    // Record Dispense Log
    recordDispenseTransaction({
      prescriptionId: completePrescription.id,
      doctorName: completePrescription.doc.n,
      doctorSip: completePrescription.doc.sip,
      patientName: completePrescription.pat.n,
      items: [
        {
          inventoryId: sanmol.id,
          inventoryName: sanmol.name,
          prescribedDrugName: 'Paracetamol 500mg',
          qtyDispensed: 10,
          unitPrice: sanmol.price,
          subtotal: sanmol.price * 10,
        },
        {
          inventoryId: cetirizine.id,
          inventoryName: cetirizine.name,
          prescribedDrugName: 'Cetirizine 10mg',
          qtyDispensed: 5,
          unitPrice: cetirizine.price,
          subtotal: cetirizine.price * 5,
        },
      ],
      totalAmount: sanmol.price * 10 + cetirizine.price * 5,
      pharmacistNotes: 'Selesai dilayani secara lengkap.',
    });

    // Check repeat dispensing history
    const history = getDispenseHistory();
    const existingLog = history.find((h) => h.prescriptionId === 'RX-E2E-999');
    expect(existingLog).toBeDefined();
    expect(existingLog?.items).toHaveLength(2);
  });
});
