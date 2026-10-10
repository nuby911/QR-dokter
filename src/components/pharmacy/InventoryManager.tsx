'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  RotateCcw,
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
    if (confirm('Kembalikan data stok obat dan riwayat transaksi ke data demo awal?')) {
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
    <div className="rounded-lg border border-neutral-200 bg-white p-4 sm:p-5 space-y-4">
      {/* Tab Switcher & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'inventory'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Katalog Stok ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'history'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Riwayat Transaksi ({history.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'inventory' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 rounded border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-100 transition"
            >
              <Plus className="h-3 w-3" />
              <span>Tambah Obat</span>
            </button>
          )}
          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1 rounded border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50 transition"
            title="Reset data demo"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddForm && activeTab === 'inventory' && (
        <form
          onSubmit={handleAddItem}
          className="rounded border border-neutral-200 bg-neutral-50 p-4 text-xs space-y-3"
        >
          <div className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px] font-mono">
            TAMBAH OBAT KE KATALOG ETALASE
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-neutral-600 font-medium mb-1">Nama Dagang &amp; Dosis</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="misal: Sanmol 500mg Tablet"
                className="w-full rounded border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-neutral-600 font-medium mb-1">Satuan</label>
              <input
                type="text"
                required
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                placeholder="tablet / botol"
                className="w-full rounded border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-neutral-600 font-medium mb-1">Stok Awal</label>
              <input
                type="number"
                required
                min="0"
                value={newItemStock}
                onChange={(e) => setNewItemStock(Number(e.target.value))}
                className="w-full rounded border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900 font-mono focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-neutral-600 font-medium mb-1">Harga (Rp)</label>
              <input
                type="number"
                required
                min="0"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
                className="w-full rounded border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900 font-mono focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded bg-neutral-900 px-4 py-1 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              Simpan Obat
            </button>
          </div>
        </form>
      )}

      {/* Inventory Tab View */}
      {activeTab === 'inventory' && (
        <div className="space-y-3">
          {/* Search Box */}
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari obat atau kategori..."
              className="w-full rounded border border-neutral-200 bg-neutral-50/50 py-1.5 pl-8 pr-3 text-xs text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded border border-neutral-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-50 text-neutral-500 font-mono uppercase text-[10px] border-b border-neutral-200">
                <tr>
                  <th className="px-3.5 py-2.5 font-bold">Nama Obat</th>
                  <th className="px-3.5 py-2.5 font-bold">Kategori</th>
                  <th className="px-3.5 py-2.5 font-bold">Harga Satuan</th>
                  <th className="px-3.5 py-2.5 text-center font-bold">Stok Rak</th>
                  <th className="px-3.5 py-2.5 text-right font-bold">Penyesuaian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredItems.map((item) => {
                  const isLow = item.currentStock <= item.minStockAlert;
                  const isOut = item.currentStock === 0;

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/70 transition">
                      <td className="px-3.5 py-2.5">
                        <span className="font-semibold text-neutral-900 block">{item.name}</span>
                        <span className="text-[10px] font-mono text-neutral-400">{item.id}</span>
                      </td>
                      <td className="px-3.5 py-2.5 text-neutral-600">
                        {item.category}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-neutral-800">
                        Rp {item.price.toLocaleString('id-ID')} / {item.unit}
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <span
                          className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                            isOut
                              ? 'text-red-700 bg-red-50 border border-red-200'
                              : isLow
                              ? 'text-amber-700 bg-amber-50 border border-amber-200'
                              : 'text-neutral-800 bg-neutral-100'
                          }`}
                        >
                          {item.currentStock} {item.unit}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleStockAdjust(item.id, -10)}
                            className="rounded border border-neutral-200 bg-white p-1 text-neutral-600 hover:bg-neutral-100 transition"
                            title="Kurang 10"
                          >
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          </button>
                          <button
                            onClick={() => handleStockAdjust(item.id, 10)}
                            className="rounded border border-neutral-200 bg-white p-1 text-neutral-600 hover:bg-neutral-100 transition"
                            title="Tambah 10"
                          >
                            <TrendingUp className="h-3 w-3 text-emerald-700" />
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
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-xs font-mono">
              Belum ada riwayat transaksi tercatat.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 rounded border border-neutral-200 overflow-hidden">
              {history.map((log) => (
                <div key={log.id} className="p-3.5 bg-white text-xs space-y-1.5 hover:bg-neutral-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-neutral-900">
                        {log.patientName}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400 ml-2">
                        {log.prescriptionId}
                      </span>
                    </div>
                    <span className="font-mono text-neutral-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <p className="text-neutral-500 font-mono text-[11px]">
                    Dokter: {log.doctorName} (SIP: {log.doctorSip})
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {log.items.map((it, idx) => (
                      <span
                        key={idx}
                        className="rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-mono text-neutral-700"
                      >
                        {it.inventoryName} &times; {it.qtyDispensed} (Rp {it.subtotal.toLocaleString('id-ID')})
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 text-[11px] border-t border-neutral-100">
                    <span className="text-neutral-500 italic">
                      Catatan: {log.pharmacistNotes || '-'}
                    </span>
                    <span className="font-bold font-mono text-neutral-900 text-xs">
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
