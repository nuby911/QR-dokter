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
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900">
          <History className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block text-sm text-amber-950">
              Riwayat Penebusan Terdahulu Terdeteksi
            </span>
            <p className="text-amber-800">
              Resep ini pernah ditebus di apotek kita pada{' '}
              <strong className="font-semibold">{new Date(previousDispense.timestamp).toLocaleString('id-ID')}</strong>.
              Item sebelumnya: {previousDispense.items.map((i) => `${i.inventoryName} (${i.qtyDispensed})`).join(', ')}.
            </p>
            <p className="text-[11px] font-medium text-amber-700">
              *Apoteker berwenang menilai kelayakan tebus ulang / iterasi berdasarkan kondisi klinis pasien.
            </p>
          </div>
        </div>
      )}

      {/* Completed Dispense Modal / Success Box */}
      {completedLog ? (
        <div className="rounded-2xl border border-forest-200 bg-white p-6 sm:p-8 shadow-sm text-center space-y-6 animate-in fade-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-900 text-forest-200 shadow-sm">
            <Check className="h-7 w-7" />
          </div>

          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-forest-700 block mb-1">
              STATUS: TRANSAKSI BERHASIL &amp; STOK TERPOTONG
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-ink-950 tracking-tight">
              Penebusan Resep Selesai
            </h3>
            <p className="text-xs text-ink-500 mt-1 max-w-md mx-auto">
              Stok fisik di sistem inventaris apotek telah otomatis dipotong. Struk kasir di bawah dapat langsung dicetak.
            </p>
          </div>

          {/* Struk Rincian Belanja Kasir dengan Gaya Thermal Receipt */}
          <div className="mx-auto max-w-sm rounded-lg border border-ink-300 bg-white p-6 text-left text-xs font-mono shadow-sm receipt-tear-top receipt-tear-bottom relative">
            <div className="border-b border-dashed border-ink-300 pb-3 text-center space-y-1">
              <h4 className="font-bold text-ink-950 tracking-wider">APOTEK MITRA SEHAT</h4>
              <p className="text-[10px] text-ink-500 uppercase tracking-widest">BUKTI PELAYANAN RESEP</p>
              <p className="text-[10px] text-ink-500 font-mono">TRX: {completedLog.id}</p>
              <p className="text-[10px] text-ink-500 font-mono">{new Date(completedLog.timestamp).toLocaleString('id-ID')}</p>
            </div>

            <div className="py-3 border-b border-dashed border-ink-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-ink-500">Pasien:</span>
                <span className="font-semibold text-ink-900">{completedLog.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Resep dr:</span>
                <span className="font-semibold text-ink-900">{completedLog.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">No. SIP:</span>
                <span className="text-ink-700">{completedLog.doctorSip}</span>
              </div>
            </div>

            <div className="py-3 border-b border-dashed border-ink-300 space-y-2">
              {completedLog.items.map((it, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-semibold text-ink-900">
                    <span>{it.inventoryName}</span>
                    <span className="tabular-nums">Rp {it.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-ink-500">
                    <span>{it.qtyDispensed} item @ Rp {it.unitPrice.toLocaleString('id-ID')}</span>
                    <span className="italic">Resep: {it.prescribedDrugName}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 space-y-1">
              <div className="flex justify-between font-bold text-sm text-ink-950">
                <span>TOTAL AKHIR:</span>
                <span className="tabular-nums text-forest-900">Rp {completedLog.totalAmount.toLocaleString('id-ID')}</span>
              </div>
              <p className="text-[10px] text-ink-400 text-center pt-3 italic">
                Terima kasih atas kunjungan Anda. Semoga lekas sembuh.
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl border border-ink-300 bg-white px-5 py-2.5 text-xs font-bold text-ink-800 shadow-xs hover:bg-ink-50 transition"
            >
              <Printer className="h-4 w-4" /> Cetak Struk Belanja
            </button>
            <button
              onClick={() => setCompletedLog(null)}
              className="rounded-xl bg-forest-900 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-forest-800 transition"
            >
              Layani Resep Baru
            </button>
          </div>
        </div>
      ) : (
        /* Split Screen Workspace */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Doctor Verified Prescription (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-ink-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-500">
                1. DOKUMEN RESEP DOKTER
              </span>
              {isValidSignature ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Asli Terverifikasi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> Tanda Tangan Tidak Valid
                </span>
              )}
            </div>

            <div>
              <div className="text-[10px] font-mono text-ink-400 uppercase tracking-wider">DOKTER PENULIS</div>
              <h4 className="font-extrabold text-ink-950 text-base">
                {prescription.doc.n}
              </h4>
              <p className="text-xs text-ink-600 font-mono mt-0.5">
                SIP: {prescription.doc.sip} • {prescription.doc.faskes}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-ink-50 border border-ink-200/60 p-3 text-xs">
              <div>
                <span className="text-[10px] text-ink-400 block font-mono uppercase">Pasien</span>
                <span className="font-bold text-ink-900">
                  {prescription.pat.n}
                </span>
                <span className="text-[11px] text-ink-500 block">
                  {prescription.pat.a} tahun • {prescription.pat.g === 'L' ? 'Laki-laki' : 'Perempuan'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-ink-400 block font-mono uppercase">Tanggal Resep</span>
                <span className="font-semibold text-ink-900 font-mono">{prescription.dt}</span>
                <span className="text-[10px] text-forest-700 block mt-0.5 font-mono">ID: {prescription.id}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-600 block">
                Daftar Obat Resep:
              </span>
              {prescription.rx.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-ink-200 bg-ink-50/50 p-3 text-xs space-y-1"
                >
                  <div className="flex justify-between items-baseline font-bold text-ink-950">
                    <span className="flex items-center gap-1.5">
                      <span className="font-mono text-forest-800 font-black">R/</span>
                      <span>{item.n}</span>
                    </span>
                    <span className="font-mono text-xs bg-white border border-ink-200 rounded px-1.5 py-0.5 text-ink-800">
                      No. {item.q}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-600 italic pl-5">
                    Signa: {item.s}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Inventory Mapping & Cashier Checkout (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-ink-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-500 block">
                  2. PENCOCOKAN STOK APOTEK &amp; KASIR
                </span>
                <p className="text-[11px] text-ink-500 mt-0.5">
                  Cocokkan sediaan dokter dengan batch obat di etalase apotek
                </p>
              </div>
              <span className="rounded bg-forest-50 border border-forest-200 px-2 py-0.5 text-[10px] font-mono font-bold text-forest-800">
                AUTO-MATCHED
              </span>
            </div>

            {/* Mapping Rows */}
            <div className="space-y-3">
              {mappingRows.map((row, idx) => {
                const selectedInv = inventoryList.find((i) => i.id === row.selectedInventoryId);
                const isOutOfStock = selectedInv && selectedInv.currentStock < row.qtyToDispense;
                const isLowStock = selectedInv && selectedInv.currentStock <= selectedInv.minStockAlert;

                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-ink-200 bg-[#fafaf9] p-3.5 space-y-2.5"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest-900 text-white text-[10px] font-bold font-mono">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-ink-950">
                          {row.prescribedDrugName}
                        </span>
                        <span className="text-[11px] text-ink-500 font-mono">
                          (Resep: {row.prescribedQty})
                        </span>
                      </div>

                      {selectedInv && (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isOutOfStock
                                ? 'bg-rose-500'
                                : isLowStock
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span
                            className={`text-[11px] font-mono font-medium ${
                              isOutOfStock
                                ? 'text-rose-700 font-bold'
                                : isLowStock
                                ? 'text-amber-700'
                                : 'text-ink-600'
                            }`}
                          >
                            Stok: {selectedInv.currentStock} {selectedInv.unit}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-12 items-center">
                      {/* Inventory Dropdown Selector */}
                      <div className="sm:col-span-8">
                        <select
                          value={row.selectedInventoryId}
                          onChange={(e) => handleRowChange(idx, 'selectedInventoryId', e.target.value)}
                          className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-xs font-medium text-ink-900 focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
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
                        <span className="text-xs text-ink-500 shrink-0 font-medium">Tebus:</span>
                        <input
                          type="number"
                          min="1"
                          max={selectedInv ? selectedInv.currentStock : 999}
                          value={row.qtyToDispense}
                          onChange={(e) => handleRowChange(idx, 'qtyToDispense', Number(e.target.value))}
                          className="w-full rounded-lg border border-ink-300 bg-white px-2.5 py-1.5 text-xs font-bold text-ink-900 text-center font-mono focus:border-forest-600 focus:outline-none"
                        />
                        {selectedInv && (
                          <span className="text-[11px] text-ink-500 font-mono shrink-0">
                            {selectedInv.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Subtotal row */}
                    {selectedInv && (
                      <div className="flex justify-between items-center pt-1 text-[11px] text-ink-500 border-t border-ink-200/60">
                        <span>
                          Subtotal ({row.qtyToDispense} x Rp {selectedInv.price.toLocaleString('id-ID')})
                        </span>
                        <span className="font-mono font-bold text-ink-900">
                          Rp {(selectedInv.price * row.qtyToDispense).toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}

                    {isOutOfStock && (
                      <p className="text-[11px] text-rose-700 font-semibold bg-rose-50 border border-rose-200 rounded px-2.5 py-1">
                        ⚠️ Kuantitas yang diminta ({row.qtyToDispense}) melebihi stok tersedia ({selectedInv?.currentStock})!
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">
                Catatan Pelayanan Apoteker (Opsional)
              </label>
              <input
                type="text"
                value={pharmacistNotes}
                onChange={(e) => setPharmacistNotes(e.target.value)}
                placeholder="misal: Pasien tebus penuh, substitusi obat disetujui dokter"
                className="w-full rounded-lg border border-ink-300 px-3 py-2 text-xs text-ink-900 placeholder-ink-400 focus:border-forest-600 focus:outline-none"
              />
            </div>

            {/* Total Amount & Submit */}
            <div className="rounded-xl bg-forest-950 text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-forest-300 block">
                  TOTAL BIAYA RESEP
                </span>
                <span className="text-2xl font-black font-mono tracking-tight text-white">
                  Rp {calculateTotal().toLocaleString('id-ID')}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCompleteTransaction}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-bold text-forest-950 shadow-sm hover:bg-emerald-400 active:scale-95 transition"
              >
                <Receipt className="h-4 w-4" />
                <span>Selesaikan Transaksi &amp; Potong Stok</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
