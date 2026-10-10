import type { DoctorProfile, PharmacyItem, PrescriptionItem } from './types';

export const DEMO_DOCTOR: DoctorProfile = {
  name: 'dr. Andi Wijaya, Sp.PD',
  sip: 'SIP.440/123/DISKES/2026',
  faskes: 'Klinik Pratama Sehat Sentosa',
  privateKey: 'e04d49a0e6e76cf02377eb9b4e3e3b793ecff60e20d20d75c5fd4c688849b291',
  publicKey: '801cd65aa2fa0bfab0758add43eed85f319e4f9d8e6817b75189bcf8b9d2c648',
};

export const DEMO_INVENTORY: PharmacyItem[] = [
  {
    id: 'inv-1',
    barcode: '8991001001',
    name: 'Sanmol 500mg Tablet (Paracetamol)',
    category: 'Analgesik & Antipiretik',
    unit: 'tablet',
    currentStock: 150,
    minStockAlert: 20,
    price: 1000,
  },
  {
    id: 'inv-2',
    barcode: '8991001002',
    name: 'Panadol Regular 500mg Kaplet',
    category: 'Analgesik & Antipiretik',
    unit: 'kaplet',
    currentStock: 120,
    minStockAlert: 15,
    price: 1500,
  },
  {
    id: 'inv-3',
    barcode: '8991001003',
    name: 'Paracetamol Generik 500mg Kimia Farma',
    category: 'Analgesik & Antipiretik',
    unit: 'tablet',
    currentStock: 200,
    minStockAlert: 30,
    price: 600,
  },
  {
    id: 'inv-4',
    barcode: '8991001004',
    name: 'Amoxicillin 500mg KF Kaplet',
    category: 'Antibiotik',
    unit: 'kaplet',
    currentStock: 90,
    minStockAlert: 20,
    price: 1200,
  },
  {
    id: 'inv-5',
    barcode: '8991001005',
    name: 'Amoxan 500mg Kapsul',
    category: 'Antibiotik Paten',
    unit: 'kapsul',
    currentStock: 75,
    minStockAlert: 15,
    price: 4500,
  },
  {
    id: 'inv-6',
    barcode: '8991001006',
    name: 'Cetirizine 10mg Tablet',
    category: 'Antihistamin & Alergi',
    unit: 'tablet',
    currentStock: 110,
    minStockAlert: 20,
    price: 1000,
  },
  {
    id: 'inv-7',
    barcode: '8991001007',
    name: 'Antasida DOEN Tablet Kunyah',
    category: 'Antasida & Saluran Cerna',
    unit: 'tablet',
    currentStock: 160,
    minStockAlert: 25,
    price: 500,
  },
  {
    id: 'inv-8',
    barcode: '8991001008',
    name: 'Promag Tablet Kunyah',
    category: 'Antasida & Saluran Cerna',
    unit: 'tablet',
    currentStock: 95,
    minStockAlert: 15,
    price: 1200,
  },
  {
    id: 'inv-9',
    barcode: '8991001009',
    name: 'Dexamethasone 0.5mg Tablet',
    category: 'Kortikosteroid',
    unit: 'tablet',
    currentStock: 140,
    minStockAlert: 20,
    price: 400,
  },
  {
    id: 'inv-10',
    barcode: '8991001010',
    name: 'Cefixime 100mg Kapsul',
    category: 'Antibiotik Sefalosporin',
    unit: 'kapsul',
    currentStock: 60,
    minStockAlert: 10,
    price: 3500,
  },
  {
    id: 'inv-11',
    barcode: '8991001011',
    name: 'OBH Combi Batuk Berdahak 100ml',
    category: 'Obat Batuk & Pilek',
    unit: 'botol',
    currentStock: 40,
    minStockAlert: 10,
    price: 22000,
  },
  {
    id: 'inv-12',
    barcode: '8991001012',
    name: 'Betadine Antiseptic Ointment 10g',
    category: 'Antiseptik Luar',
    unit: 'tube',
    currentStock: 35,
    minStockAlert: 8,
    price: 28000,
  },
];

export interface PrescriptionTemplate {
  title: string;
  description: string;
  items: PrescriptionItem[];
}

export const DEMO_PRESCRIPTION_TEMPLATES: PrescriptionTemplate[] = [
  {
    title: 'Demam & Flu Biasa',
    description: 'Paracetamol pereda demam dan Cetirizine untuk gejala pilek/alergi',
    items: [
      {
        n: 'Paracetamol 500mg',
        q: 10,
        s: '3x1 tablet sesudah makan (bila demam)',
      },
      {
        n: 'Cetirizine 10mg',
        q: 5,
        s: '1x1 tablet malam hari',
      },
    ],
  },
  {
    title: 'Infeksi Bakteri ISPA Ringan',
    description: 'Antibiotik Amoxicillin dengan aturan dihabiskan dan antipiretik',
    items: [
      {
        n: 'Amoxicillin 500mg',
        q: 15,
        s: '3x1 kaplet sesudah makan (HABISKAN)',
      },
      {
        n: 'Paracetamol 500mg',
        q: 10,
        s: '3x1 tablet sesudah makan',
      },
    ],
  },
  {
    title: 'Keluhan Lambung & Maag',
    description: 'Antasida untuk menetralkan asam lambung berlebih',
    items: [
      {
        n: 'Antasida DOEN',
        q: 12,
        s: '3x1 tablet kunyah 1 jam sebelum makan',
      },
    ],
  },
];
