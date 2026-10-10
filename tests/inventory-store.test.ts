import { describe, it, expect, beforeEach } from 'vitest';
import {
  getInventoryItems,
  deductItemStock,
  addInventoryItem,
  getDispenseHistory,
  recordDispenseTransaction,
  resetToDemoData,
} from '../apps/apotek/src/lib/inventory-store';
import { DEMO_DOCTOR, DEMO_INVENTORY } from '../apps/pasien-web/src/lib/demo-data';

describe('Pharmacy Inventory Store & Seed Data', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('provides a comprehensive demo doctor profile', () => {
    expect(DEMO_DOCTOR.name).toContain('dr. Andi Wijaya');
    expect(DEMO_DOCTOR.sip).toBeDefined();
    expect(DEMO_DOCTOR.privateKey).toHaveLength(64);
    expect(DEMO_DOCTOR.publicKey).toHaveLength(64);
  });

  it('loads 10+ standard medications in demo inventory', () => {
    const items = getInventoryItems();
    expect(items.length).toBeGreaterThanOrEqual(10);
    const paracetamol = items.find((i) => i.name.toLowerCase().includes('sanmol') || i.name.toLowerCase().includes('paracetamol'));
    expect(paracetamol).toBeDefined();
    expect(paracetamol?.currentStock).toBeGreaterThan(0);
  });

  it('deducts inventory stock accurately', () => {
    const items = getInventoryItems();
    const target = items[0];
    const initialStock = target.currentStock;

    const success = deductItemStock(target.id, 5);
    expect(success).toBe(true);

    const updatedItems = getInventoryItems();
    const updatedTarget = updatedItems.find((i) => i.id === target.id);
    expect(updatedTarget?.currentStock).toBe(initialStock - 5);
  });

  it('fails to deduct more than current stock', () => {
    const items = getInventoryItems();
    const target = items[0];
    const excess = target.currentStock + 100;

    const success = deductItemStock(target.id, excess);
    expect(success).toBe(false);

    // Stock remains untouched
    const updatedTarget = getInventoryItems().find((i) => i.id === target.id);
    expect(updatedTarget?.currentStock).toBe(target.currentStock);
  });

  it('allows adding a new custom pharmacy inventory item', () => {
    const newItem = addInventoryItem({
      name: 'Ibuprofen 400mg Tablet',
      category: 'Anti-inflamasi & Analgesik',
      unit: 'tablet',
      currentStock: 50,
      minStockAlert: 10,
      price: 1500,
      barcode: '8999999999999',
    });

    expect(newItem.id).toBeDefined();
    const items = getInventoryItems();
    expect(items.some((i) => i.id === newItem.id)).toBe(true);
  });

  it('records dispense transaction into history', () => {
    const items = getInventoryItems();
    const target = items[0];

    const log = recordDispenseTransaction({
      prescriptionId: 'RX-TEST-001',
      doctorName: 'dr. Andi Wijaya',
      doctorSip: 'SIP.440/123',
      patientName: 'Budi Santoso',
      items: [
        {
          inventoryId: target.id,
          inventoryName: target.name,
          prescribedDrugName: 'Paracetamol 500mg',
          qtyDispensed: 10,
          unitPrice: target.price,
          subtotal: target.price * 10,
        },
      ],
      totalAmount: target.price * 10,
      pharmacistNotes: 'Selesai dilayani tanpa kendala',
    });

    expect(log.id).toBeDefined();
    expect(log.timestamp).toBeDefined();

    const history = getDispenseHistory();
    expect(history.length).toBeGreaterThanOrEqual(1);
    expect(history[0].prescriptionId).toBe('RX-TEST-001');
  });
});
