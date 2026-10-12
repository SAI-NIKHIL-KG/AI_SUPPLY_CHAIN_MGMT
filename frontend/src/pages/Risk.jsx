import { useEffect, useState } from 'react';
import { riskAPI } from '../services/api';

export default function Risk() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    riskAPI.overview()
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400">Loading…</div>;
  if (!data) return null;

  const bandStyle = {
    LOW: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    MEDIUM: 'bg-amber-100 text-amber-800 border-amber-300',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
    CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Supply Chain Risk Center</h2>
        <p className="text-sm text-slate-500">Supplier · Inventory · Demand · Delivery · Logistics risk</p>
      </div>

      <div className={`rounded-xl border-2 p-6 text-center ${bandStyle[data.overall_risk_band]}`}>
        <p className="text-sm font-medium uppercase tracking-wide">Overall Risk Band</p>
        <p className="text-4xl font-bold mt-1">{data.overall_risk_band}</p>
        <p className="text-lg mt-1">Score: {data.overall_risk_score} / 100</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase">Supplier Risk</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{data.supplier_risk?.high_critical_count ?? 0}</p>
          <p className="text-xs text-slate-400">High/Critical suppliers</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase">Inventory Risk</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{data.inventory_risk?.critical_count ?? 0}</p>
          <p className="text-xs text-slate-400">Critical stock SKUs</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase">Delivery Risk</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{data.delivery_risk?.delayed_count ?? 0}</p>
          <p className="text-xs text-slate-400">Delayed shipments</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-3">AI Mitigation Recommendations</h3>
        <ul className="space-y-2">
          {data.mitigation_recommendations?.map((r, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-600">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              {r}
            </li>
          ))}
        </ul>
      </div>

      {data.supplier_risk?.items?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 font-semibold text-slate-800">High-Risk Suppliers</div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">City</th>
                <th className="text-right px-4 py-2">Score</th>
                <th className="text-center px-4 py-2">Band</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.supplier_risk.items.map((s, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 font-medium">{s.name}</td>
                  <td className="px-4 py-2">{s.city}</td>
                  <td className="px-4 py-2 text-right">{s.risk_score}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bandStyle[s.risk_band]?.split(' ').slice(0, 2).join(' ')}`}>
                      {s.risk_band}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
