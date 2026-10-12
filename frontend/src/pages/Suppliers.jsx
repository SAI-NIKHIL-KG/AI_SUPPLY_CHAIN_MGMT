import { useEffect, useState } from 'react';
import { suppliersAPI } from '../services/api';

const bandColor = {
  LOW: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    suppliersAPI
      .list()
      .then((r) => setSuppliers(r.data.suppliers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Supplier Intelligence</h2>
        <p className="text-sm text-slate-500">
          Multi-criteria scoring · Delivery 30% · Quality 25% · Cost 20% · Reliability 15% · Lead time 10%
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Supplier</th>
                <th className="text-left px-4 py-3">City</th>
                <th className="text-right px-4 py-3">Delivery</th>
                <th className="text-right px-4 py-3">Quality</th>
                <th className="text-right px-4 py-3">Cost Idx</th>
                <th className="text-right px-4 py-3">Composite</th>
                <th className="text-right px-4 py-3">Risk Score</th>
                <th className="text-center px-4 py-3">Band</th>
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
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.gstin}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.city}</td>
                  <td className="px-4 py-3 text-right">{(s.delivery_reliability * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3 text-right">{(s.quality_score * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3 text-right">{(s.cost_index * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3 text-right font-semibold">{s.composite_score}</td>
                  <td className="px-4 py-3 text-right">{s.risk_score}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        bandColor[s.risk_band] || 'bg-slate-100'
                      }`}
                    >
                      {s.risk_band}
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
