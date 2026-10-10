import { describe, it, expect, beforeEach } from 'vitest';
import {
  getInventoryItems,
  deductItemStock,
  recordDispenseTransaction,
  getDispenseHistory,
  resetToDemoData,
} from '../src/lib/inventory-store';
import { signPrescription, verifyPrescriptionSignature } from '../src/lib/crypto';
import { encodePrescriptionToUrl, decodePrescriptionFromUrlHash } from '../src/lib/qr-codec';
import { DEMO_DOCTOR } from '../src/lib/demo-data';
import type { PrescriptionPayload } from '../src/lib/types';

describe('Pharmacy Portal Dispense & Stock Deduction Workflow', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('scans prescription, matches with local inventory, and deducts stock automatically', async () => {
    const rawPayload: Omit<PrescriptionPayload, 'sig'> = {
      v: 1,
      id: 'RX-PHARM-001',
      doc: {
        n: DEMO_DOCTOR.name,
        sip: DEMO_DOCTOR.sip,
        pk: DEMO_DOCTOR.publicKey,
        faskes: DEMO_DOCTOR.faskes,
      },
      pat: {
        n: 'Hendro Wijoyo',
        a: 42,
        g: 'L',
      },
      dt: '2026-10-10',
      rx: [
        {
          n: 'Paracetamol 500mg',
          q: 10,
          s: '3x1 tablet sesudah makan',
        },
      ],
    };

    const sig = await signPrescription(rawPayload, DEMO_DOCTOR.privateKey);
    const fullPayload = { ...rawPayload, sig };

    // 1. Apoteker scan QR URL
    const qrUrl = encodePrescriptionToUrl(fullPayload, 'http://localhost:3000');
    const hash = qrUrl.substring(qrUrl.indexOf('#'));
    const scanned = decodePrescriptionFromUrlHash(hash);

    expect(scanned).not.toBeNull();
    expect(await verifyPrescriptionSignature(scanned!)).toBe(true);

    // 2. Apoteker matches drug to Sanmol in pharmacy inventory
    const inventory = getInventoryItems();
    const sanmol = inventory.find((i) => i.name.toLowerCase().includes('sanmol'));
    expect(sanmol).toBeDefined();
    const initialSanmolStock = sanmol!.currentStock;

    // 3. Apoteker clicks Selesaikan & Potong Stok (qty: 10)
    const success = deductItemStock(sanmol!.id, 10);
    expect(success).toBe(true);

    // 4. Verify stock decreased
    const updatedInventory = getInventoryItems();
    const updatedSanmol = updatedInventory.find((i) => i.id === sanmol!.id);
    expect(updatedSanmol?.currentStock).toBe(initialSanmolStock - 10);

    // 5. Transaction recorded
    recordDispenseTransaction({
      prescriptionId: scanned!.id,
      doctorName: scanned!.doc.n,
      doctorSip: scanned!.doc.sip,
      patientName: scanned!.pat.n,
      items: [
        {
          inventoryId: sanmol!.id,
          inventoryName: sanmol!.name,
          prescribedDrugName: scanned!.rx[0].n,
          qtyDispensed: 10,
          unitPrice: sanmol!.price,
          subtotal: sanmol!.price * 10,
        },
      ],
      totalAmount: sanmol!.price * 10,
      pharmacistNotes: 'Tebus pertama kali',
    });

    const logs = getDispenseHistory();
    const existingLog = logs.find((l) => l.prescriptionId === 'RX-PHARM-001');
    expect(existingLog).toBeDefined();
    expect(existingLog?.items[0].qtyDispensed).toBe(10);
  });
});
