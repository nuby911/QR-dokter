export const CLINICAL_THEME = {
  primary: '#0d9488', // teal-600
  accent: '#10b981',  // emerald-500
  secondary: '#0f766e', // teal-700
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
};

export interface PrescriptionItem {
  n: string; // drug name
  q: number; // quantity
  s: string; // signatura / instruction (e.g. "3x1 tab sesudah makan")
  note?: string;
}

export interface DoctorInfo {
  n: string;       // Doctor name
  sip: string;     // Practice license number
  pk: string;      // Ed25519 Public Key (hex string)
  faskes: string;  // Clinic / Practice facility name
}

export interface PatientInfo {
  n: string;       // Patient name
  a: number;       // Patient age
  g: 'L' | 'P';    // Gender (Laki-laki / Perempuan)
  phone?: string;
}

export interface PrescriptionPayload {
  v: number;       // Version (1)
  id: string;      // Unique prescription ID (e.g. RX-20261010-001)
  doc: DoctorInfo;
  pat: PatientInfo;
  dt: string;      // Date string (YYYY-MM-DD)
  rx: PrescriptionItem[];
  sig: string;     // Ed25519 signature over canonical payload
}

export interface DoctorProfile {
  name: string;
  sip: string;
  faskes: string;
  privateKey: string; // Hex string
  publicKey: string;  // Hex string
}

export interface PharmacyItem {
  id: string;
  barcode?: string;
  name: string;
  category: string;
  unit: string;       // tablet, strip, botol, tube, dll
  currentStock: number;
  minStockAlert: number;
  price: number;      // Rupiah
}

export interface DispenseItem {
  inventoryId: string;
  inventoryName: string;
  prescribedDrugName: string;
  qtyDispensed: number;
  unitPrice: number;
  subtotal: number;
}

export interface DispenseLog {
  id: string;
  prescriptionId: string;
  doctorName: string;
  doctorSip: string;
  patientName: string;
  timestamp: string;
  items: DispenseItem[];
  totalAmount: number;
  pharmacistNotes?: string;
}
