'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  History,
  Check,
  Printer,
  Receipt,
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

  useEffect(() => {
    const items = getInventoryItems();
    setInventoryList(items);

    const history = getDispenseHistory();
    const prev = history.find((h) => h.prescriptionId === prescription.id);
    setPreviousDispense(prev || null);

    const rows: MappingRow[] = prescription.rx.map((rxItem) => {
      const rxLower = rxItem.n.toLowerCase();
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

  const calculateTotal = (): number => {
    return mappingRows.reduce((acc, row) => {
      const inv = inventoryList.find((i) => i.id === row.selectedInventoryId);
      if (!inv) return acc;
      return acc + inv.price * row.qtyToDispense;
    }, 0);
  };

  const handleCompleteTransaction = () => {
    for (const row of mappingRows) {
      const inv = inventoryList.find((i) => i.id === row.selectedInventoryId);
      if (!inv) {
        alert(`Obat belum dipilih untuk ${row.prescribedDrugName}`);
        return;
      }
      if (inv.currentStock < row.qtyToDispense) {
        alert(
          `Stok fisik ${inv.name} tidak mencukupi. Tersedia: ${inv.currentStock}, Diminta: ${row.qtyToDispense}`
        );
        return;
      }
    }

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
  };

  return (
    <div className="space-y-4">
      {/* Previous Dispense Alert Banner */}
      {previousDispense && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 shadow-sm">
          <History className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block text-amber-950">
              Riwayat Penebusan Terdahulu Terdeteksi
            </span>
            <p className="text-amber-800 leading-relaxed">
              Resep ini pernah dilayani di apotek pada{' '}
              <strong className="font-bold font-mono">{new Date(previousDispense.timestamp).toLocaleString('id-ID')}</strong>.
              Total item sebelumnya: {previousDispense.items.map((i) => `${i.inventoryName} (${i.qtyDispensed})`).join(', ')}.
            </p>
          </div>
        </div>
      )}

      {/* Completed Dispense Modal / Success Box */}
      {completedLog ? (
        <div className="rounded-3xl border border-[#ebdccd] bg-white p-7 text-center space-y-5 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#241a14] text-white">
            <Check className="h-6 w-6 text-[#e86a28]" />
          </div>

          <div>
            <h3 className="text-lg font-black text-[#241a14] tracking-tight">
              Transaksi Selesai &bull; Stok Berhasil Dipotong
            </h3>
            <p className="text-xs sm:text-sm text-[#716358] mt-1 max-w-sm mx-auto">
              Stok fisik di sistem inventaris apotek telah diperbarui. Struk kasir di bawah siap dicetak.
            </p>
          </div>

          {/* Struk Rincian Belanja Kasir */}
          <div className="mx-auto max-w-sm rounded-2xl border border-[#ebdccd] bg-[#fbfbf8] p-5 text-left text-xs font-mono text-[#241a14] space-y-3 shadow-inner">
            <div className="border-b border-dashed border-[#d5c3b1] pb-3 text-center space-y-0.5">
              <h4 className="font-bold text-sm">APOTEK MITRA SEHAT</h4>
              <p className="text-[10px] text-[#716358]">BUKTI PELAYANAN RESEP</p>
              <p className="text-[10px] text-[#716358]">TRX: {completedLog.id}</p>
              <p className="text-[10px] text-[#716358]">{new Date(completedLog.timestamp).toLocaleString('id-ID')}</p>
            </div>

            <div className="border-b border-dashed border-[#d5c3b1] pb-2.5 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span className="text-[#716358]">Pasien:</span>
                <span className="font-bold">{completedLog.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#716358]">Dokter:</span>
                <span>{completedLog.doctorName}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-[#d5c3b1] pb-2.5 space-y-1.5">
              {completedLog.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span>
                    {it.inventoryName} &times; {it.qtyDispensed}
                  </span>
                  <span className="font-bold">
                    Rp {it.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-1 flex justify-between font-black text-sm">
              <span>TOTAL PEMBAYARAN:</span>
              <span className="text-[#e86a28]">Rp {completedLog.totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="flex justify-center gap-2.5 pt-1">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-full border border-[#ebdccd] bg-white px-5 py-2.5 text-xs font-semibold text-[#241a14] hover:bg-[#f5ece1] transition"
            >
              <Printer className="h-4 w-4 text-[#e86a28]" />
              <span>Cetak Struk</span>
            </button>
            <button
              onClick={() => setCompletedLog(null)}
              className="rounded-full bg-[#e86a28] hover:bg-[#d95a18] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-[0.99]"
            >
              Layani Resep Baru
            </button>
          </div>
        </div>
      ) : (
        /* Split Screen Workspace */
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
          {/* Left Column: Doctor Verified Prescription (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-[#ebdccd] bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebdccd]/60 pb-3">
              <span className="text-[11px] font-mono uppercase font-bold text-[#716358]">
                1. RESEP ASLI DOKTER
              </span>
              {isValidSignature ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-900 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3 text-emerald-700" /> Sah (Ed25519)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-900 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                  <AlertTriangle className="h-3 w-3 text-red-700" /> Tidak Sah
                </span>
              )}
            </div>

            <div>
              <h4 className="font-bold text-[#241a14] text-base">
                {prescription.doc.n}
              </h4>
              <p className="text-xs text-[#716358] font-mono mt-0.5">
                {prescription.doc.sip} &bull; {prescription.doc.faskes}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#ebdccd] bg-[#fbfbf8] p-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#a39487] block">Pasien</span>
                <span className="font-bold text-[#241a14] mt-0.5 block">
                  {prescription.pat.n}
                </span>
                <span className="text-[11px] text-[#716358] block">
                  {prescription.pat.a} th / {prescription.pat.g}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-[#a39487] block">Tanggal Resep</span>
                <span className="font-mono font-bold text-[#241a14] mt-0.5 block">{prescription.dt}</span>
                <span className="text-[10px] font-mono text-[#a39487] block mt-0.5">{prescription.id}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-mono uppercase font-bold text-[#716358]">
                Preskripsi (R/):
              </div>
              {prescription.rx.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#ebdccd] bg-[#fbfbf8]/70 p-3 text-xs space-y-1"
                >
                  <div className="flex justify-between font-bold text-[#241a14]">
                    <span>{idx + 1}. {item.n}</span>
                    <span className="font-mono bg-white border border-[#ebdccd] rounded-full px-2 py-0.5">No. {item.q}</span>
                  </div>
                  <p className="text-[11px] text-[#716358] italic">
                    S. {item.s}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Inventory Mapping & Cashier Checkout (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-[#ebdccd] bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebdccd]/60 pb-3">
              <span className="text-[11px] font-mono uppercase font-bold text-[#716358]">
                2. PENCOCOKAN STOK RAK &amp; KASIR
              </span>
              <span className="text-[10px] font-mono text-[#a39487]">
                SINKRONISASI STOK LOKAL
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
                    className="rounded-2xl border border-[#ebdccd] bg-[#fbfbf8]/70 p-3.5 space-y-2.5 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-[#241a14]">
                        {idx + 1}. {row.prescribedDrugName} (Permintaan: {row.prescribedQty})
                      </div>

                      {selectedInv && (
                        <span
                          className={`font-mono text-[11px] font-semibold ${
                            isOutOfStock
                              ? 'text-red-700'
                              : 'text-[#716358]'
                          }`}
                        >
                          Sisa Rak: {selectedInv.currentStock} {selectedInv.unit}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      {/* Inventory Dropdown Selector */}
                      <div className="sm:col-span-8">
                        <select
                          value={row.selectedInventoryId}
                          onChange={(e) => handleRowChange(idx, 'selectedInventoryId', e.target.value)}
                          className="w-full rounded-xl border border-[#ebdccd] bg-white px-3 py-2 text-xs text-[#241a14] focus:border-[#e86a28] focus:outline-none transition"
                        >
                          {inventoryList.map((inv) => (
                            <option key={inv.id} value={inv.id}>
                              {inv.name} &bull; Rp {inv.price.toLocaleString('id-ID')}/{inv.unit} (Sisa: {inv.currentStock})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity Input */}
                      <div className="sm:col-span-4 flex items-center gap-1.5">
                        <span className="text-[11px] text-[#716358] font-semibold">Tebus:</span>
                        <input
                          type="number"
                          min="1"
                          max={selectedInv ? selectedInv.currentStock : 999}
                          value={row.qtyToDispense}
                          onChange={(e) => handleRowChange(idx, 'qtyToDispense', Number(e.target.value))}
                          className="w-full rounded-xl border border-[#ebdccd] bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-center text-[#241a14] focus:border-[#e86a28] focus:outline-none transition"
                        />
                      </div>
                    </div>

                    {isOutOfStock && (
                      <p className="text-[11px] text-red-600 font-bold">
                        Stok fisik tidak mencukupi untuk kuantitas ini ({row.qtyToDispense} &gt; {selectedInv?.currentStock}).
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-[#716358] mb-1">
                Catatan Petugas Apoteker (Opsional)
              </label>
              <input
                type="text"
                value={pharmacistNotes}
                onChange={(e) => setPharmacistNotes(e.target.value)}
                placeholder="misal: Penebusan penuh, substitusi disetujui"
                className="w-full rounded-xl border border-[#ebdccd] px-3.5 py-2 text-xs text-[#241a14] placeholder-[#a39487] focus:border-[#e86a28] focus:outline-none transition"
              />
            </div>

            {/* Total Amount & Submit */}
            <div className="rounded-2xl border border-[#241a14] bg-[#241a14] text-white p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#a39487] block">
                  Total Biaya Obat
                </span>
                <span className="text-2xl font-black font-mono tracking-tight text-white">
                  Rp {calculateTotal().toLocaleString('id-ID')}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCompleteTransaction}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-[#e86a28] hover:bg-[#d95a18] px-6 py-3 text-xs font-bold text-white shadow-sm transition active:scale-[0.99]"
              >
                <Receipt className="h-4 w-4" />
                <span>Selesaikan &amp; Potong Stok</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
