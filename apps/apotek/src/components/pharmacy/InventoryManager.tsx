'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  PackageOpen,
} from 'lucide-react';
import type { PharmacyItem, DispenseLog } from '../../lib/types';
import {
  getInventoryItems,
  addInventoryItem,
  updateInventoryItem,
  getDispenseHistory,
  clearInventory,
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

  const handleClearInventory = () => {
    if (confirm('Kosongkan semua daftar obat di katalog etalase? Anda bisa menambahkan obat baru satu per satu.')) {
      clearInventory();
      refreshData();
    }
  };

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rounded-3xl border border-[#ebdccd] bg-white p-5 sm:p-6 shadow-sm space-y-5">
      {/* Tab Switcher & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#ebdccd]/60 pb-4">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              activeTab === 'inventory'
                ? 'bg-[#241a14] text-white shadow-sm'
                : 'text-[#716358] hover:text-[#241a14] hover:bg-[#f5ece1]'
            }`}
          >
            Katalog Stok ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              activeTab === 'history'
                ? 'bg-[#241a14] text-white shadow-sm'
                : 'text-[#716358] hover:text-[#241a14] hover:bg-[#f5ece1]'
            }`}
          >
            Riwayat Transaksi ({history.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'inventory' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 rounded-full border border-[#ebdccd] bg-[#fbfbf8] px-3.5 py-1.5 text-xs font-semibold text-[#241a14] hover:bg-[#f5ece1] transition"
            >
              <Plus className="h-3.5 w-3.5 text-[#e86a28]" />
              <span>Tambah Obat</span>
            </button>
          )}
          {items.length > 0 && activeTab === 'inventory' && (
            <button
              onClick={handleClearInventory}
              className="flex items-center gap-1 rounded-full border border-[#ebdccd] bg-white px-3.5 py-1.5 text-xs text-[#716358] hover:bg-[#f5ece1] hover:text-red-700 transition"
              title="Kosongkan katalog stok"
            >
              <Trash2 className="h-3.5 w-3.5 text-[#a39487]" />
              <span>Kosongkan</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Item Form */}
      {showAddForm && activeTab === 'inventory' && (
        <form
          onSubmit={handleAddItem}
          className="rounded-2xl border border-[#ebdccd] bg-[#faf7f2] p-5 text-xs space-y-4"
        >
          <div className="font-bold text-[#241a14] uppercase tracking-wider text-[11px] font-mono">
            TAMBAH OBAT KE KATALOG ETALASE
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[#716358] font-semibold mb-1">Nama Dagang &amp; Dosis</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="misal: Sanmol 500mg Tablet"
                className="w-full rounded-xl border border-[#ebdccd] bg-white px-3 py-2 text-xs text-[#241a14] focus:border-[#e86a28] focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[#716358] font-semibold mb-1">Satuan</label>
              <input
                type="text"
                required
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                placeholder="tablet / botol"
                className="w-full rounded-xl border border-[#ebdccd] bg-white px-3 py-2 text-xs text-[#241a14] focus:border-[#e86a28] focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[#716358] font-semibold mb-1">Stok Awal</label>
              <input
                type="number"
                required
                min="0"
                value={newItemStock}
                onChange={(e) => setNewItemStock(Number(e.target.value))}
                className="w-full rounded-xl border border-[#ebdccd] bg-white px-3 py-2 text-xs text-[#241a14] font-mono font-bold focus:border-[#e86a28] focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[#716358] font-semibold mb-1">Harga (Rp)</label>
              <input
                type="number"
                required
                min="0"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-[#ebdccd] bg-white px-3 py-2 text-xs text-[#241a14] font-mono font-bold focus:border-[#e86a28] focus:outline-none transition"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-2 border-t border-[#ebdccd]">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-full border border-[#ebdccd] bg-white px-4 py-2 text-xs font-semibold text-[#716358] hover:bg-[#f5ece1] transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#e86a28] hover:bg-[#d95a18] px-5 py-2 text-xs font-bold text-white shadow-sm transition active:scale-[0.99]"
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#a39487]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari obat atau kategori..."
              className="w-full rounded-full border border-[#ebdccd] bg-[#fbfbf8] py-2 pl-9 pr-4 text-xs text-[#241a14] placeholder-[#a39487] focus:border-[#e86a28] focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#ebdccd]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfbf8] text-[#716358] font-mono uppercase text-[10px] border-b border-[#ebdccd]">
                <tr>
                  <th className="px-4 py-3 font-bold">Nama Obat</th>
                  <th className="px-4 py-3 font-bold">Kategori</th>
                  <th className="px-4 py-3 font-bold">Harga Satuan</th>
                  <th className="px-4 py-3 text-center font-bold">Stok Rak</th>
                  <th className="px-4 py-3 text-right font-bold">Penyesuaian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebdccd]/50">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#716358]">
                      <PackageOpen className="h-8 w-8 text-[#a39487] mx-auto mb-2" />
                      <p className="font-bold text-xs text-[#241a14]">
                        {searchTerm ? 'Obat tidak ditemukan' : 'Etalase Obat Masih Kosong'}
                      </p>
                      <p className="text-[11px] text-[#716358] mt-1 max-w-xs mx-auto">
                        {searchTerm
                          ? 'Coba gunakan kata kunci pencarian lain.'
                          : 'Belum ada obat yang didaftarkan. Klik tombol "+ Tambah Obat" di atas untuk memasukkan obat pertama Anda.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isLow = item.currentStock <= item.minStockAlert;
                    const isOut = item.currentStock === 0;

                    return (
                      <tr key={item.id} className="hover:bg-[#fbfbf8]/80 transition">
                        <td className="px-4 py-3">
                          <span className="font-bold text-[#241a14] block">{item.name}</span>
                          <span className="text-[10px] font-mono text-[#a39487]">{item.id}</span>
                        </td>
                        <td className="px-4 py-3 text-[#716358]">
                          {item.category}
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-[#241a14]">
                          Rp {item.price.toLocaleString('id-ID')} / {item.unit}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`font-mono text-xs font-bold px-3 py-1 rounded-full ${
                              isOut
                                ? 'text-red-900 bg-red-50 border border-red-200'
                                : isLow
                                ? 'text-amber-900 bg-amber-50 border border-amber-200'
                                : 'text-[#241a14] bg-[#f5ece1] border border-[#ebdccd]'
                            }`}
                          >
                            {item.currentStock} {item.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleStockAdjust(item.id, -10)}
                              className="rounded-full border border-[#ebdccd] bg-white p-1.5 text-[#716358] hover:bg-[#f5ece1] hover:text-red-700 transition"
                              title="Kurang 10"
                            >
                              <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                            </button>
                            <button
                              onClick={() => handleStockAdjust(item.id, 10)}
                              className="rounded-full border border-[#ebdccd] bg-white p-1.5 text-[#716358] hover:bg-[#f5ece1] hover:text-emerald-700 transition"
                              title="Tambah 10"
                            >
                              <TrendingUp className="h-3.5 w-3.5 text-emerald-700" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History Tab View */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="py-14 text-center text-[#a39487] text-xs font-mono">
              Belum ada riwayat transaksi tercatat.
            </div>
          ) : (
            <div className="divide-y divide-[#ebdccd]/60 rounded-2xl border border-[#ebdccd] overflow-hidden">
              {history.map((log) => (
                <div key={log.id} className="p-4 bg-white text-xs space-y-2 hover:bg-[#fbfbf8] transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-[#241a14] text-sm">
                        {log.patientName}
                      </span>
                      <span className="text-[11px] font-mono text-[#a39487] ml-2">
                        {log.prescriptionId}
                      </span>
                    </div>
                    <span className="font-mono text-[#a39487] text-[11px]">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <p className="text-[#716358] font-mono text-[11px]">
                    Dokter: {log.doctorName} (SIP: {log.doctorSip})
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {log.items.map((it, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-[#fbfbf8] border border-[#ebdccd] px-2.5 py-0.5 text-[11px] font-mono text-[#241a14]"
                      >
                        {it.inventoryName} &times; {it.qtyDispensed} (Rp {it.subtotal.toLocaleString('id-ID')})
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 text-[11px] border-t border-[#ebdccd]/50">
                    <span className="text-[#716358] italic">
                      Catatan: {log.pharmacistNotes || '-'}
                    </span>
                    <span className="font-bold font-mono text-[#241a14] text-xs">
                      Total: <span className="text-[#e86a28]">Rp {log.totalAmount.toLocaleString('id-ID')}</span>
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
