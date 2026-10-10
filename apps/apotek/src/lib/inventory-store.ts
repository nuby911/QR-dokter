import type { PharmacyItem, DispenseLog, PharmacyProfile } from './types';
import { DEMO_INVENTORY } from './demo-data';

const PHARMACY_PROFILE_KEY = 'mediqr_pharmacy_profile_v1';
const INVENTORY_STORAGE_KEY = 'mediqr_pharmacy_inventory_v1';
const DISPENSE_STORAGE_KEY = 'mediqr_dispense_history_v1';

// In-memory fallback for SSR and testing environments
let memoryPharmacyProfile: PharmacyProfile | null = null;
let memoryInventory: PharmacyItem[] = [];
let memoryDispenseLogs: DispenseLog[] = [];

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getPharmacyProfile(): PharmacyProfile | null {
  if (!isBrowser()) return memoryPharmacyProfile;
  try {
    const raw = window.localStorage.getItem(PHARMACY_PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return memoryPharmacyProfile;
  }
}

export function savePharmacyProfile(profile: PharmacyProfile): void {
  if (!isBrowser()) {
    memoryPharmacyProfile = profile;
    return;
  }
  try {
    window.localStorage.setItem(PHARMACY_PROFILE_KEY, JSON.stringify(profile));
    memoryPharmacyProfile = profile;
  } catch (err) {
    console.error('Failed to save pharmacy profile:', err);
  }
}

export function clearPharmacyProfile(): void {
  memoryPharmacyProfile = null;
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(PHARMACY_PROFILE_KEY);
    } catch {
      // ignore
    }
  }
}

function loadInventoryFromStorage(): PharmacyItem[] {
  if (!isBrowser()) return memoryInventory;
  try {
    const raw = window.localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) {
      // Clean default empty inventory
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return memoryInventory;
  }
}

function saveInventoryToStorage(items: PharmacyItem[]): void {
  if (!isBrowser()) {
    memoryInventory = items;
    return;
  }
  try {
    window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
  } catch {
    memoryInventory = items;
  }
}

function loadDispenseLogsFromStorage(): DispenseLog[] {
  if (!isBrowser()) return memoryDispenseLogs;
  try {
    const raw = window.localStorage.getItem(DISPENSE_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return memoryDispenseLogs;
  }
}

function saveDispenseLogsToStorage(logs: DispenseLog[]): void {
  if (!isBrowser()) {
    memoryDispenseLogs = logs;
    return;
  }
  try {
    window.localStorage.setItem(DISPENSE_STORAGE_KEY, JSON.stringify(logs));
  } catch {
    memoryDispenseLogs = logs;
  }
}

/**
 * Retrieves all items currently in the pharmacy inventory.
 */
export function getInventoryItems(): PharmacyItem[] {
  return loadInventoryFromStorage();
}

/**
 * Deducts specified quantity from an inventory item stock.
 * Returns true if successful, false if insufficient stock or item not found.
 */
export function deductItemStock(id: string, qty: number): boolean {
  if (qty <= 0) return false;
  const items = loadInventoryFromStorage();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return false;

  const current = items[index];
  if (current.currentStock < qty) {
    return false; // Insufficient stock
  }

  items[index] = {
    ...current,
    currentStock: current.currentStock - qty,
  };

  saveInventoryToStorage(items);
  return true;
}

/**
 * Adds a new item to pharmacy inventory.
 */
export function addInventoryItem(
  item: Omit<PharmacyItem, 'id'>
): PharmacyItem {
  const items = loadInventoryFromStorage();
  const newItem: PharmacyItem = {
    ...item,
    id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  };

  items.unshift(newItem);
  saveInventoryToStorage(items);
  return newItem;
}

/**
 * Updates an existing item in the inventory.
 */
export function updateInventoryItem(
  id: string,
  partial: Partial<PharmacyItem>
): boolean {
  const items = loadInventoryFromStorage();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return false;

  items[index] = {
    ...items[index],
    ...partial,
  };

  saveInventoryToStorage(items);
  return true;
}

/**
 * Retrieves all past dispense transaction logs.
 */
export function getDispenseHistory(): DispenseLog[] {
  return loadDispenseLogsFromStorage();
}

/**
 * Records a new dispense transaction log.
 */
export function recordDispenseTransaction(
  log: Omit<DispenseLog, 'id' | 'timestamp'>
): DispenseLog {
  const logs = loadDispenseLogsFromStorage();
  const newLog: DispenseLog = {
    ...log,
    id: `dispense-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };

  logs.unshift(newLog);
  saveDispenseLogsToStorage(logs);
  return newLog;
}

/**
 * Resets inventory and dispense history back to initial demo state.
 */
export function resetToDemoData(): void {
  const fresh = JSON.parse(JSON.stringify(DEMO_INVENTORY));
  memoryInventory = fresh;
  memoryDispenseLogs = [];
  if (isBrowser()) {
    try {
      window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(fresh));
      window.localStorage.removeItem(DISPENSE_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

/**
 * Seeds inventory with demo catalog items.
 */
export function seedDemoInventory(): void {
  const fresh = JSON.parse(JSON.stringify(DEMO_INVENTORY));
  memoryInventory = fresh;
  saveInventoryToStorage(fresh);
}

/**
 * Clears all items in inventory and dispense history.
 */
export function clearInventory(): void {
  memoryInventory = [];
  memoryDispenseLogs = [];
  if (isBrowser()) {
    try {
      window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify([]));
      window.localStorage.removeItem(DISPENSE_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}
