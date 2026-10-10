# QR Prescription & Pharmacy Inventory System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun aplikasi web lengkap (Next.js 14+ / TypeScript / Tailwind CSS) untuk sistem resep medis desentralisasi berbasis *Self-Contained Smart QR Code* (terkompresi & bertanda tangan digital Ed25519) dengan 3 portal: Generator Resep Dokter & Struk Thermal, Web Viewer Pasien, dan Scanner Apotek dengan Pemotongan Stok Inventaris Otomatis.

**Architecture:** Arsitektur *Stateless / Zero-Backend-Knowledge Prescription*. Data resep dikompresi dan ditandatangani dengan kunci privat dokter, dimuat ke dalam URL Hash Fragment (`#d=...`) sehingga diproses 100% di browser tanpa ketergantungan server database pusat. Portal Apotek mengelola inventaris stok lokal secara independen dan memotong stok fisik saat memvalidasi dan melayani QR resep.

**Tech Stack:** Next.js (App Router, TypeScript), Tailwind CSS, Lucide React, `@noble/ed25519` (digital signature), `lz-string` (URL compression), `qrcode` & `html5-qrcode` (QR generation & scanning), Vitest (Testing).

**Spec:** `D:\Project\QR-Dokter\2026-10-10-qr-prescription-system-design.md`

## Global Constraints

- **Theme Palette:** Clean Clinical Teal / Emerald (`teal-600`, `emerald-500`, neutral slate backgrounds, clean clinical borders).
- **Zero Central Database Dependency for Prescriptions:** Resep tidak disimpan di database server pusat; semua informasi resep berada di dalam QR Code payload dan divalidasi via kriptografi kunci publik.
- **Offline / Local Inventory for Pharmacy:** Inventaris apotek disimpan di browser storage / local database apotek sehingga apotek tetap dapat beroperasi tanpa internet.
- **Client-Side Hash Privacy:** Parameter URL menggunakan `#d=` (bukan `?d=`) agar data resep tidak pernah terkirim ke server hosting melalui HTTP request headers.
- **Language & Copy:** Antarmuka menggunakan Bahasa Indonesia yang ramah medis dan mudah dimengerti.

## Review Focus

1. **Manipulasi Data Resep (Data Tampering):** Jika ada pihak yang mencoba mengubah kuantitas atau nama obat di dalam QR code, verifikasi Ed25519 harus menolak dan menampilkan alert merah.
2. **Kapasitas QR Code (Payload Overflow):** Resep dengan 5–8 jenis obat harus tetap terkompresi ringkas (< 800 karakter) agar QR Code memiliki kepadatan modul yang mudah dibaca kamera ponsel beresolusi rendah.
3. **Penebusan Sebagian (Partial Dispensing):** Apotek yang kekurangan stok fisik harus dapat melayani jumlah parsial tanpa merusak integritas data inventaris.
4. **Resep Rusak / Malformed Hash:** URL dengan format payload cacat atau string acak tidak boleh membuat aplikasi crash, melainkan menampilkan pesan error ramah.
5. **Print Layout Thermal Printer (58mm/80mm):** CSS `@media print` harus terisolasi agar saat dicetak hanya struk kasir/thermal yang keluar tanpa elemen navigasi web.

---

### Task 1: Scaffolding Project & Design System Foundation

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `vitest.config.ts`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Create: `src/lib/types.ts`
- Test: `tests/foundation.test.ts`

**Interfaces:**
- Produces: Type definitions for `PrescriptionPayload`, `DoctorProfile`, `PharmacyItem`, `DispenseLog`.
- Produces: Tailwind theme config with medical clinical teal colors.

- [ ] **Step 1: Write test for type contract and initial environment**
Create `tests/foundation.test.ts` to assert that core type structures and mock configurations are valid.

- [ ] **Step 2: Run test to verify it fails (before setup)**
Run: `npx vitest run tests/foundation.test.ts`
Expected: FAIL (modules not found)

- [ ] **Step 3: Setup Next.js, dependencies, and Tailwind configuration**
Initialize files in `D:\Project\QR-Dokter`, install dependencies (`next`, `react`, `react-dom`, `lucide-react`, `clsx`, `tailwind-merge`, `lz-string`, `@noble/ed25519`, `qrcode`, `vitest`). Configure `globals.css` with clean clinical teal tokens.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/foundation.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
`git init; git add .; git commit -m "chore: scaffold project structure and design tokens"`

---

### Task 2: Cryptographic Engine & QR Codec (`lib/crypto.ts` & `lib/qr-codec.ts`)

**Files:**
- Create: `src/lib/crypto.ts`
- Create: `src/lib/qr-codec.ts`
- Test: `tests/crypto-codec.test.ts`

**Interfaces:**
- Produces in `src/lib/crypto.ts`:
  - `generateDoctorKeyPair(): Promise<{ privateKey: string; publicKey: string }>`
  - `signPrescription(payloadWithoutSig: Omit<PrescriptionPayload, 'sig'>, privateKeyHex: string): Promise<string>`
  - `verifyPrescriptionSignature(payload: PrescriptionPayload): Promise<boolean>`
- Produces in `src/lib/qr-codec.ts`:
  - `encodePrescriptionToUrl(payload: PrescriptionPayload, baseUrl?: string): string`
  - `decodePrescriptionFromUrlHash(hashString: string): PrescriptionPayload | null`

- [ ] **Step 1: Write tests for signing, verification, tampering detection, and codec roundtrip**
In `tests/crypto-codec.test.ts`:
  1. Test generates doctor keypair.
  2. Test signs valid prescription, verification returns `true`.
  3. Test alters drug quantity from 10 to 100, verification returns `false`.
  4. Test encodes to URL hash and decodes back cleanly.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/crypto-codec.test.ts`
Expected: FAIL (`generateDoctorKeyPair` not defined)

- [ ] **Step 3: Implement `crypto.ts` and `qr-codec.ts`**
Implement Ed25519 asymmetric signing via `@noble/ed25519` and URL-safe compression via `lz-string`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/crypto-codec.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
`git add src/lib/ tests/crypto-codec.test.ts; git commit -m "feat: implement Ed25519 prescription cryptography and QR codec"`

---

### Task 3: Pharmacy Local Inventory Store & Seed Data (`lib/inventory-store.ts`)

**Files:**
- Create: `src/lib/demo-data.ts`
- Create: `src/lib/inventory-store.ts`
- Test: `tests/inventory-store.test.ts`

**Interfaces:**
- Consumes: `PharmacyItem`, `DispenseLog` from `src/lib/types.ts`.
- Produces in `src/lib/inventory-store.ts`:
  - `getInventoryItems(): PharmacyItem[]`
  - `deductItemStock(id: string, qty: number): boolean`
  - `addInventoryItem(item: Omit<PharmacyItem, 'id'>): PharmacyItem`
  - `getDispenseHistory(): DispenseLog[]`
  - `recordDispenseTransaction(log: Omit<DispenseLog, 'id' | 'timestamp'>): DispenseLog`
  - `resetToDemoData(): void`

- [ ] **Step 1: Write tests for inventory deduction, edge cases, and demo seed**
In `tests/inventory-store.test.ts`:
  1. Test verifies seed data loads 10+ standard medications (Paracetamol, Amoxicillin, dll).
  2. Test verifies stock decreases accurately on dispense.
  3. Test verifies stock cannot drop below zero unless explicitly handled.
  4. Test verifies dispense log records prescription and pharmacist notes.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/inventory-store.test.ts`
Expected: FAIL (modules not found)

- [ ] **Step 3: Implement `demo-data.ts` and `inventory-store.ts`**
Implement storage with browser `localStorage` fallback (or in-memory for SSR/testing) and provide realistic Indonesian pharmacy items.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/inventory-store.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
`git add src/lib/ tests/inventory-store.test.ts; git commit -m "feat: implement pharmacy inventory store and seed data"`

---

### Task 4: Doctor Portal (`/doctor`) - Generator & Thermal Struk Printer

**Files:**
- Create: `src/app/doctor/page.tsx`
- Create: `src/components/doctor/PrescriptionForm.tsx`
- Create: `src/components/doctor/ThermalReceiptPreview.tsx`
- Modify: `src/app/globals.css` (add print thermal styles)
- Test: `tests/doctor-portal.test.ts`

**Interfaces:**
- Consumes: `generateDoctorKeyPair`, `signPrescription` from `src/lib/crypto.ts`.
- Consumes: `encodePrescriptionToUrl` from `src/lib/qr-codec.ts`.
- Produces: Reactive prescription creation UI, real-time QR code rendering with `qrcode`, and 58mm/80mm thermal receipt print layout.

- [ ] **Step 1: Write test for Doctor prescription payload generation logic**
Verify form creates valid signed payload with doctor info, patient info, and medications.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/doctor-portal.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement Doctor Portal and Thermal Receipt Preview**
Build intuitive doctor interface:
  - Doctor profile badge (pre-filled with dr. Andi Wijaya, Sp.PD with option to edit).
  - Quick prescription template buttons (e.g. "Flu/Demam", "Antibiotik Rutin").
  - Dynamic drug items row (name, quantity, instructions).
  - Thermal receipt simulator box with high-contrast QR code and clear typed text.
  - Print button configured for receipt printers.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/doctor-portal.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
`git add src/app/doctor src/components/doctor tests/doctor-portal.test.ts; git commit -m "feat: implement doctor prescription generator and thermal receipt preview"`

---

### Task 5: Patient Universal Web Viewer (`/view`)

**Files:**
- Create: `src/app/view/page.tsx`
- Create: `src/components/patient/PrescriptionCard.tsx`
- Create: `src/components/patient/QrModal.tsx`
- Test: `tests/patient-view.test.ts`

**Interfaces:**
- Consumes: `decodePrescriptionFromUrlHash` from `src/lib/qr-codec.ts`.
- Consumes: `verifyPrescriptionSignature` from `src/lib/crypto.ts`.
- Produces: Patient-facing digital prescription card with schedule badges, verification banner, and enlarged QR code modal.

- [ ] **Step 1: Write test for Patient hash decoding and signature verification states**
Test valid hash gives verified status; tampered hash gives invalid signature warning; empty hash gives friendly prompt.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/patient-view.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement Patient Web Viewer (`/view`)**
Client-side component reading `window.location.hash`:
  - Verified Green Banner (✅ Resep Asli Terverifikasi dari dr. [Nama Dokter]).
  - List of medications with friendly dose icons (pagi, siang, malam).
  - "Perbesar QR untuk Apoteker" modal button for easy counter scanning.
  - No login required; 100% offline responsive PWA friendly.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/patient-view.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
`git add src/app/view src/components/patient tests/patient-view.test.ts; git commit -m "feat: implement patient universal prescription web viewer"`

---

### Task 6: Pharmacy Portal (`/pharmacy`) - Scanner, Drug Matching & Stock Dispense

**Files:**
- Create: `src/app/pharmacy/page.tsx`
- Create: `src/components/pharmacy/QrScannerInput.tsx`
- Create: `src/components/pharmacy/DispenseWorkspace.tsx`
- Create: `src/components/pharmacy/InventoryManager.tsx`
- Test: `tests/pharmacy-portal.test.ts`

**Interfaces:**
- Consumes: `decodePrescriptionFromUrlHash`, `verifyPrescriptionSignature`.
- Consumes: `inventory-store.ts` (`getInventoryItems`, `deductItemStock`, `recordDispenseTransaction`).
- Produces: Integrated pharmacy cash register & stock dispensation workstation.

- [ ] **Step 1: Write test for drug mapping and stock deduction workflow**
Test maps prescribed Paracetamol to pharmacy's Sanmol inventory, deducts quantity, logs transaction, and updates remaining stock.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/pharmacy-portal.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement Pharmacy Portal with Split-Screen Workspace**
Build:
  - Scanner Input: Supports USB Barcode Gun, manual paste, or demo 1-click scan button.
  - Left panel: Original verified prescription data with previous dispense history notification.
  - Right panel: Inventory item search dropdown for each prescribed medicine, auto-calculated totals, and "Selesaikan & Potong Stok" action.
  - Secondary tab: Simple inventory management (view current stock, adjust stock, add new drug).

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/pharmacy-portal.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
`git add src/app/pharmacy src/components/pharmacy tests/pharmacy-portal.test.ts; git commit -m "feat: implement pharmacy scanner, stock matching, and inventory management"`

---

### Task 7: Landing Page, Navigation, & End-to-End Polish

**Files:**
- Create: `src/components/common/Navbar.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/e2e-workflow.test.ts`

**Interfaces:**
- Connects all 3 portals with a unified medical hero dashboard, quick role switch, and live interactive demo walkthrough.

- [ ] **Step 1: Write integration test for the full lifecycle**
Doctor creates prescription -> Generates QR URL -> Patient opens -> Pharmacy scans & dispenses -> Stock drops from 150 to 140.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/e2e-workflow.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement Landing Page & Navigation Shell**
Build welcoming medical landing page explaining the system with 1-click test drive buttons:
  - "Buka Portal Dokter" -> create prescription.
  - "Lihat Viewer Pasien" -> open sample prescription.
  - "Buka Kasir Apotek" -> scan & check inventory.
Add clean header navigation, footer, and responsive layout.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/e2e-workflow.test.ts`
Expected: PASS

- [ ] **Step 5: Build verification & final commit**
Run: `npm run build; npx vitest run`
Verify build succeeds with zero errors. Commit all final polish.
