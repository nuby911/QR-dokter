'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  RotateCcw,
  History,
  AlertCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { PharmacyItem, DispenseLog } from '../../lib/types';
import {
  getInventoryItems,
  addInventoryItem,
  updateInventoryItem,
  getDispenseHistory,
  resetToDemoData,
} from '../../lib/inventory-store';

export default function InventoryManager() {
  const [items, setItems] = useState<PharmacyItem[]>([]);
  const [history, setHistory] = useState<DispenseLog[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');

  // Add Item Form State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<string>('Analgesik');
  const [newItemUnit, setNewItemUnit] = useState<string>('tablet');
  const [newItemStock, setNewItemStock] = useState<number>(100);
  const [newItemPrice, setNewItemPrice] = useState<number>(1500);

  const refreshData = () => {
    setItems(getInventoryItems());
    setHistory(getDispenseHistory());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleStockAdjust = (id: string, delta: number) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const newStock = Math.max(0, target.currentStock + delta);
    updateInventoryItem(id, { currentStock: newStock });
    refreshData();
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addInventoryItem({
      name: newItemName.trim(),
      category: newItemCategory,
      unit: newItemUnit,
      currentStock: Number(newItemStock) || 0,
      minStockAlert: 15,
      price: Number(newItemPrice) || 0,
    });

    setNewItemName('');
    setShowAddForm(false);
    refreshData();
  };

  const handleResetDemo = () => {
    if (confirm('Reset inventaris dan riwayat transaksi kembali ke data demo awal?')) {
      resetToDemoData();
      refreshData();
    }
  };

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
      {/* Tab Switcher & Top Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-ink-200/80 pb-4">
        <div className="flex items-center gap-1.5 p-1 bg-ink-100/80 rounded-xl border border-ink-200/60 w-fit">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === 'inventory'
                ? 'bg-forest-900 text-white shadow-xs'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            <Package className="h-3.5 w-3.5" />
            <span>Katalog Stok ({items.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === 'history'
                ? 'bg-forest-900 text-white shadow-xs'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Riwayat Penebusan ({history.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'inventory' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 rounded-lg border border-forest-300 bg-forest-50 px-3 py-1.5 text-xs font-bold text-forest-800 hover:bg-forest-100 transition shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Obat</span>
            </button>
          )}
          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-100 transition shadow-xs"
            title="Kembalikan ke data demo awal"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Add Item Drawer */}
      {showAddForm && activeTab === 'inventory' && (
        <form
          onSubmit={handleAddItem}
          className="rounded-xl border border-forest-200 bg-forest-50/50 p-4 text-xs space-y-3 animate-in fade-in"
        >
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-forest-950 uppercase tracking-wide text-[11px] font-mono">
              TAMBAH OBAT KE KATALOG APOTEK
            </h4>
            <span className="text-[10px] text-forest-700 font-mono">FORM INPUT MASTER DATA</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            <div className="sm:col-span-2">
              <label className="block text-ink-700 font-semibold mb-1">Nama Dagang Obat</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="misal: Sanmol 500mg Tablet"
                className="w-full rounded-lg border border-ink-300 bg-white px-3 py-1.5 text-xs text-ink-900 focus:border-forest-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-ink-700 font-semibold mb-1">Satuan</label>
              <input
                type="text"
                required
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                placeholder="tablet / strip / botol"
                className="w-full rounded-lg border border-ink-300 bg-white px-3 py-1.5 text-xs text-ink-900 focus:border-forest-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-ink-700 font-semibold mb-1">Stok Awal</label>
              <input
                type="number"
                required
                min="0"
                value={newItemStock}
                onChange={(e) => setNewItemStock(Number(e.target.value))}
                className="w-full rounded-lg border border-ink-300 bg-white px-3 py-1.5 text-xs text-ink-900 font-mono focus:border-forest-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-ink-700 font-semibold mb-1">Harga Satuan (Rp)</label>
              <input
                type="number"
                required
                min="0"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
                className="w-full rounded-lg border border-ink-300 bg-white px-3 py-1.5 text-xs text-ink-900 font-mono focus:border-forest-600 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1 border-t border-forest-200/60">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg px-3 py-1.5 text-xs text-ink-600 hover:bg-forest-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-forest-900 px-4 py-1.5 text-xs text-white font-bold hover:bg-forest-800 shadow-xs"
            >
              Simpan ke Rak
            </button>
          </div>
        </form>
      )}

      {/* Inventory Tab View */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Search Box */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama obat, kandungan, atau kategori..."
              className="w-full rounded-xl border border-ink-200 bg-ink-50/50 py-2 pl-9 pr-3 text-xs text-ink-900 placeholder-ink-400 focus:border-forest-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-ink-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fafaf9] text-ink-500 uppercase tracking-wider font-mono text-[10px] border-b border-ink-200">
                <tr>
                  <th className="px-4 py-3 font-bold">Nama Obat</th>
                  <th className="px-4 py-3 font-bold">Kategori</th>
                  <th className="px-4 py-3 font-bold">Harga Eceran</th>
                  <th className="px-4 py-3 text-center font-bold">Status Stok Fisik</th>
                  <th className="px-4 py-3 text-right font-bold">Penyesuaian Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filteredItems.map((item) => {
                  const isLow = item.currentStock <= item.minStockAlert;
                  const isOut = item.currentStock === 0;

                  return (
                    <tr key={item.id} className="hover:bg-[#fafaf9]/80 transition">
                      <td className="px-4 py-3">
                        <span className="font-bold text-ink-950 block">{item.name}</span>
                        <span className="text-[10px] font-mono text-ink-400">ID: {item.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-ink-100 border border-ink-200/80 px-2 py-0.5 text-[10px] font-mono font-medium text-ink-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-ink-800 tabular-nums">
                        Rp {item.price.toLocaleString('id-ID')} / {item.unit}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-mono font-semibold ${
                            isOut
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : isLow
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          />
                          <span>
                            {item.currentStock} {item.unit}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleStockAdjust(item.id, -10)}
                            className="rounded-md border border-ink-200 bg-white p-1 text-ink-600 hover:bg-ink-100 transition shadow-xs"
                            title="Kurang 10 stok"
                          >
                            <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
                          </button>
                          <button
                            onClick={() => handleStockAdjust(item.id, 10)}
                            className="rounded-md border border-ink-200 bg-white p-1 text-ink-600 hover:bg-ink-100 transition shadow-xs"
                            title="Tambah 10 stok"
                          >
                            <TrendingUp className="h-3.5 w-3.5 text-forest-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History Tab View */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="py-12 text-center text-ink-400 text-xs font-mono">
              Belum ada riwayat transaksi penebusan resep tercatat.
            </div>
          ) : (
            <div className="divide-y divide-ink-200/80 rounded-xl border border-ink-200 overflow-hidden">
              {history.map((log) => (
                <div key={log.id} className="p-4 bg-white hover:bg-[#fafaf9] transition text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-ink-950 text-sm">
                        {log.patientName}
                      </span>
                      <span className="text-[11px] text-ink-500 font-mono ml-2">
                        • No. Resep: {log.prescriptionId}
                      </span>
                    </div>
                    <span className="font-mono text-ink-400 text-[11px] bg-ink-50 px-2 py-0.5 rounded border border-ink-200/60">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <p className="text-ink-600 font-mono text-[11px]">
                    Dokter: {log.doctorName} (SIP: {log.doctorSip})
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {log.items.map((it, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-forest-50 border border-forest-200/70 text-forest-900 px-2 py-0.5 text-[11px] font-mono font-medium"
                      >
                        {it.inventoryName} x {it.qtyDispensed} (Rp {it.subtotal.toLocaleString('id-ID')})
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 text-[11px] border-t border-ink-100">
                    <span className="text-ink-500 italic">
                      Catatan: {log.pharmacistNotes || '-'}
                    </span>
                    <span className="font-bold font-mono text-forest-900 text-xs">
                      Total: Rp {log.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
