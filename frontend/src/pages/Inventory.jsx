import { useEffect, useState } from 'react';
import { inventoryAPI } from '../services/api';

const statusColor = {
  Healthy: 'bg-emerald-100 text-emerald-700',
  'Low Stock': 'bg-amber-100 text-amber-700',
  Critical: 'bg-red-100 text-red-700',
  Overstock: 'bg-blue-100 text-blue-700',
};

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryAPI
      .list(filter ? { status: filter } : {})
      .then((r) => setItems(r.data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Smart Inventory</h2>
          <p className="text-sm text-slate-500">Safety stock · ROP · EOQ · Stockout probability</p>
        </div>
        <div className="flex gap-2">
          {['', 'Critical', 'Low Stock', 'Healthy', 'Overstock'].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                filter === s
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">SKU / Product</th>
                <th className="text-left px-4 py-3">Warehouse</th>
                <th className="text-right px-4 py-3">On Hand</th>
                <th className="text-right px-4 py-3">Safety Stock</th>
                <th className="text-right px-4 py-3">ROP</th>
                <th className="text-right px-4 py-3">EOQ</th>
                <th className="text-right px-4 py-3">Stockout P</th>
                <th className="text-center px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No inventory items
                  </td>
                </tr>
              )}
              {items.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{inv.sku}</p>
                    <p className="text-xs text-slate-400">{inv.product_name}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{inv.warehouse_city}</td>
                  <td className="px-4 py-3 text-right font-medium">{inv.quantity_on_hand}</td>
                  <td className="px-4 py-3 text-right">{inv.safety_stock}</td>
                  <td className="px-4 py-3 text-right">{inv.reorder_point}</td>
                  <td className="px-4 py-3 text-right">{inv.eoq}</td>
                  <td className="px-4 py-3 text-right">
                    {(inv.stockout_probability * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        statusColor[inv.status] || 'bg-slate-100'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
