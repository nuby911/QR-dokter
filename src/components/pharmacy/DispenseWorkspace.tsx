'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertTriangle,
  Pill,
  User,
  Calendar,
  Building2,
  Check,
  Receipt,
  Printer,
  History,
} from 'lucide-react';
import type { PrescriptionPayload, PharmacyItem, DispenseLog } from '../../lib/types';
import {
  getInventoryItems,
  deductItemStock,
  recordDispenseTransaction,
  getDispenseHistory,
} from '../../lib/inventory-store';

interface DispenseWorkspaceProps {
  prescription: PrescriptionPayload;
  isValidSignature: boolean;
  onDispenseSuccess: () => void;
}

interface MappingRow {
  prescribedDrugName: string;
  prescribedQty: number;
  prescribedSig: string;
  selectedInventoryId: string;
  qtyToDispense: number;
}

export default function DispenseWorkspace({
  prescription,
  isValidSignature,
  onDispenseSuccess,
}: DispenseWorkspaceProps) {
  const [inventoryList, setInventoryList] = useState<PharmacyItem[]>([]);
  const [mappingRows, setMappingRows] = useState<MappingRow[]>([]);
  const [pharmacistNotes, setPharmacistNotes] = useState<string>('');
  const [previousDispense, setPreviousDispense] = useState<DispenseLog | null>(null);
  const [completedLog, setCompletedLog] = useState<DispenseLog | null>(null);

  // Load inventory and find best matches for each prescribed drug
  useEffect(() => {
    const items = getInventoryItems();
    setInventoryList(items);

    // Check if this prescription was previously dispensed
    const history = getDispenseHistory();
    const prev = history.find((h) => h.prescriptionId === prescription.id);
    setPreviousDispense(prev || null);

    // Map each prescribed drug to best match in local inventory
    const rows: MappingRow[] = prescription.rx.map((rxItem) => {
      const rxLower = rxItem.n.toLowerCase();
      // Match by drug name or active ingredient
      const match = items.find((inv) => {
        const invLower = inv.name.toLowerCase();
        return (
          invLower.includes(rxLower) ||
          (rxLower.includes('paracetamol') && invLower.includes('paracetamol')) ||
          (rxLower.includes('paracetamol') && invLower.includes('sanmol')) ||
          (rxLower.includes('amoxicillin') && invLower.includes('amoxicillin')) ||
          (rxLower.includes('cetirizine') && invLower.includes('cetirizine')) ||
          (rxLower.includes('antasida') && invLower.includes('antasida'))
        );
      });

      return {
        prescribedDrugName: rxItem.n,
        prescribedQty: rxItem.q,
        prescribedSig: rxItem.s,
        selectedInventoryId: match ? match.id : items[0]?.id || '',
        qtyToDispense: rxItem.q,
      };
    });

    setMappingRows(rows);
    setCompletedLog(null);
  }, [prescription]);

  const handleRowChange = (index: number, field: keyof MappingRow, value: any) => {
    setMappingRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Calculate live billing total
  const calculateTotal = (): number => {
    return mappingRows.reduce((acc, row) => {
      const inv = inventoryList.find((i) => i.id === row.selectedInventoryId);
      if (!inv) return acc;
      return acc + inv.price * row.qtyToDispense;
    }, 0);
  };

  const handleCompleteTransaction = () => {
    // 1. Validate stocks
    for (const row of mappingRows) {
      const inv = inventoryList.find((i) => i.id === row.selectedInventoryId);
      if (!inv) {
        alert(`Obat belum dipilih untuk ${row.prescribedDrugName}`);
        return;
      }
      if (inv.currentStock < row.qtyToDispense) {
        alert(
          `Stok fisik ${inv.name} tidak mencukupi! Tersedia: ${inv.currentStock}, Diminta: ${row.qtyToDispense}`
        );
        return;
      }
    }

    // 2. Deduct inventory stocks
    const dispenseItems = mappingRows.map((row) => {
      const inv = inventoryList.find((i) => i.id === row.selectedInventoryId)!;
      deductItemStock(inv.id, row.qtyToDispense);

      return {
        inventoryId: inv.id,
        inventoryName: inv.name,
        prescribedDrugName: row.prescribedDrugName,
        qtyDispensed: row.qtyToDispense,
        unitPrice: inv.price,
        subtotal: inv.price * row.qtyToDispense,
      };
    });

    // 3. Record dispense log
    const log = recordDispenseTransaction({
      prescriptionId: prescription.id,
      doctorName: prescription.doc.n,
      doctorSip: prescription.doc.sip,
      patientName: prescription.pat.n,
      items: dispenseItems,
      totalAmount: calculateTotal(),
      pharmacistNotes: pharmacistNotes.trim() || 'Penebusan selesai.',
    });

    setCompletedLog(log);
    onDispenseSuccess();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#10b981', '#38bdf8'],
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Previous Dispense Alert Banner (Re-use / Refill detection) */}
      {previousDispense && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900">
          <History className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm">
              ℹ️ Riwayat Penebusan Terdahulu Terdeteksi
            </span>
            <p className="mt-0.5">
              Resep ini pernah ditebus di apotek kita pada{' '}
              <strong>{new Date(previousDispense.timestamp).toLocaleString('id-ID')}</strong>.
              Total item sebelumnya: {previousDispense.items.map((i) => `${i.inventoryName} (${i.qtyDispensed})`).join(', ')}.
            </p>
            <p className="mt-1 font-medium text-amber-800">
              Apoteker berwenang menilai kelayakan tebus ulang berdasarkan kondisi pasien.
            </p>
          </div>
        </div>
      )}

      {/* Completed Dispense Modal / Success Box */}
      {completedLog ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <Check className="h-7 w-7" />
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-emerald-950">
              Transaksi Selesai &amp; Stok Berhasil Dipotong!
            </h3>
            <p className="text-xs text-emerald-800 mt-1">
              Stok fisik di database apotek telah otomatis dikurangi sesuai rincian di bawah.
            </p>
          </div>

          {/* Struk Rincian Belanja Kasir */}
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-left text-xs font-mono shadow-xs">
            <div className="border-b border-dashed border-slate-300 pb-3 text-center">
              <h4 className="font-bold text-slate-900">STRUK APOTEK MITRA</h4>
              <p className="text-[10px] text-slate-500">ID: {completedLog.id}</p>
              <p className="text-[10px] text-slate-500">{new Date(completedLog.timestamp).toLocaleString('id-ID')}</p>
            </div>

            <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
              <div className="text-[11px]">
                <span className="text-slate-500">Pasien:</span> {completedLog.patientName}
              </div>
              <div className="text-[11px]">
                <span className="text-slate-500">Resep dr:</span> {completedLog.doctorName}
              </div>
            </div>

            <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
              {completedLog.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {it.inventoryName} x {it.qtyDispensed}
                  </span>
                  <span className="font-semibold">
                    Rp {it.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 flex justify-between font-bold text-sm text-slate-900">
              <span>TOTAL PEMBAYARAN:</span>
              <span>Rp {completedLog.totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              <Printer className="h-4 w-4" /> Cetak Struk Belanja
            </button>
            <button
              onClick={() => setCompletedLog(null)}
              className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700"
            >
              Layani Resep Baru
            </button>
          </div>
        </div>
      ) : (
        /* Split Screen Workspace */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Doctor Verified Prescription (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Resep Asli dari Dokter
              </span>
              {isValidSignature ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Asli Terverifikasi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="h-3.5 w-3.5" /> Tidak Valid
                </span>
              )}
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-base">
                {prescription.doc.n}
              </h4>
              <p className="text-xs text-slate-500">
                {prescription.doc.sip} • {prescription.doc.faskes}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Pasien</span>
                <span className="font-semibold text-slate-800">
                  {prescription.pat.n} ({prescription.pat.a} th)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Tanggal Resep</span>
                <span className="font-semibold text-slate-800">{prescription.dt}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-700 block">
                Daftar Obat Resep:
              </span>
              {prescription.rx.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-teal-100 bg-teal-50/40 p-3 text-xs"
                >
                  <div className="flex justify-between font-bold text-teal-950">
                    <span>{idx + 1}. {item.n}</span>
                    <span className="text-teal-700">x {item.q}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600 italic">
                    S. {item.s}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Inventory Mapping & Cashier Checkout (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Pemetaan Stok Apotek &amp; Kasir
              </span>
              <span className="text-xs text-slate-500">
                Cocokkan dengan obat di rak
              </span>
            </div>

            {/* Mapping Rows */}
            <div className="space-y-3">
              {mappingRows.map((row, idx) => {
                const selectedInv = inventoryList.find((i) => i.id === row.selectedInventoryId);
                const isOutOfStock = selectedInv && selectedInv.currentStock < row.qtyToDispense;

                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-2.5"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900">
                        Item {idx + 1}: {row.prescribedDrugName} (Resep: {row.prescribedQty})
                      </span>
                      {selectedInv && (
                        <span
                          className={`text-[11px] font-semibold ${
                            selectedInv.currentStock < 15
                              ? 'text-amber-600'
                              : 'text-slate-600'
                          }`}
                        >
                          Stok di Rak: {selectedInv.currentStock} {selectedInv.unit}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-12 items-center">
                      {/* Inventory Dropdown Selector */}
                      <div className="sm:col-span-8">
                        <select
                          value={row.selectedInventoryId}
                          onChange={(e) => handleRowChange(idx, 'selectedInventoryId', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        >
                          {inventoryList.map((inv) => (
                            <option key={inv.id} value={inv.id}>
                              {inv.name} — Rp {inv.price.toLocaleString('id-ID')}/{inv.unit} (Sisa: {inv.currentStock})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity Input */}
                      <div className="sm:col-span-4 flex items-center gap-2">
                        <span className="text-xs text-slate-500">Tebus:</span>
                        <input
                          type="number"
                          min="1"
                          max={selectedInv ? selectedInv.currentStock : 999}
                          value={row.qtyToDispense}
                          onChange={(e) => handleRowChange(idx, 'qtyToDispense', Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 text-center focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {isOutOfStock && (
                      <p className="text-[11px] text-rose-600 font-semibold">
                        ⚠️ Stok tidak cukup untuk kuantitas ini!
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Catatan Apoteker (Opsional)
              </label>
              <input
                type="text"
                value={pharmacistNotes}
                onChange={(e) => setPharmacistNotes(e.target.value)}
                placeholder="misal: Pasien minta tebus sebagian, atau resep diulang"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            </div>

            {/* Total Amount & Submit */}
            <div className="rounded-2xl bg-teal-50/70 border border-teal-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-teal-700 block">Total Tagihan Obat</span>
                <span className="text-xl font-extrabold text-teal-950">
                  Rp {calculateTotal().toLocaleString('id-ID')}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCompleteTransaction}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-teal-700 active:scale-95 transition"
              >
                <Receipt className="h-4 w-4" />
                Selesaikan Transaksi &amp; Potong Stok
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
