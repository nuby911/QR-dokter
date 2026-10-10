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
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      {/* Tab Switcher & Top Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'inventory'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Package className="h-4 w-4" />
            Katalog Stok Obat ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'history'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <History className="h-4 w-4" />
            Riwayat Penebusan ({history.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'inventory' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Obat
            </button>
          )}
          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 transition"
            title="Kembalikan ke data demo awal"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Demo
          </button>
        </div>
      </div>

      {/* Add Item Drawer */}
      {showAddForm && activeTab === 'inventory' && (
        <form
          onSubmit={handleAddItem}
          className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4 text-xs space-y-3"
        >
          <h4 className="font-bold text-teal-900">Tambah Obat Baru ke Rak Apotek</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            <div className="sm:col-span-2">
              <label className="block text-slate-600 mb-1">Nama Dagang Obat</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="misal: Sanmol 500mg Tablet"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Satuan</label>
              <input
                type="text"
                required
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                placeholder="tablet / strip / botol"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Stok Awal</label>
              <input
                type="number"
                required
                min="0"
                value={newItemStock}
                onChange={(e) => setNewItemStock(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Harga Satuan (Rp)</label>
              <input
                type="number"
                required
                min="0"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg px-3 py-1 text-slate-600 hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-teal-600 px-4 py-1 text-white font-semibold hover:bg-teal-700"
            >
              Simpan Obat
            </button>
          </div>
        </form>
      )}

      {/* Inventory Tab View */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Search Box */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama obat atau kategori..."
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Nama Obat</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Harga</th>
                  <th className="px-4 py-3 text-center">Stok Fisik</th>
                  <th className="px-4 py-3 text-right">Kelola Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const isLow = item.currentStock <= item.minStockAlert;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {item.category}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        Rp {item.price.toLocaleString('id-ID')}/{item.unit}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            isLow
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isLow && <AlertCircle className="h-3 w-3" />}
                          {item.currentStock} {item.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleStockAdjust(item.id, -10)}
                            className="rounded-md border border-slate-200 p-1 text-slate-500 hover:bg-slate-100"
                            title="Kurang 10"
                          >
                            <TrendingDown className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleStockAdjust(item.id, 10)}
                            className="rounded-md border border-slate-200 p-1 text-teal-600 hover:bg-teal-50"
                            title="Tambah 10"
                          >
                            <TrendingUp className="h-3 w-3" />
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
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada riwayat transaksi penebusan resep.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
              {history.map((log) => (
                <div key={log.id} className="p-4 bg-white hover:bg-slate-50/60 transition text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">
                      {log.patientName} • No. Resep: {log.prescriptionId}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-slate-500">
                    Dokter: {log.doctorName} ({log.doctorSip})
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {log.items.map((it, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-teal-50 text-teal-800 px-2 py-0.5 text-[11px] font-medium"
                      >
                        {it.inventoryName} x {it.qtyDispensed}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2 text-[11px]">
                    <span className="text-slate-400 italic">
                      Catatan: {log.pharmacistNotes || '-'}
                    </span>
                    <span className="font-bold text-teal-700">
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
