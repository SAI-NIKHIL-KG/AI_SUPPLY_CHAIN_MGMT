import { useEffect, useState } from 'react';
import { costAPI } from '../services/api';

export default function Cost() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    costAPI.overview()
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400">Loading…</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Cost Analytics</h2>
        <p className="text-sm text-slate-500">All figures in Indian Rupees (Rs. Lakh)</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {data.components?.map((c) => (
          <div key={c.name} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">{c.name}</p>
            <p className="text-xl font-bold text-slate-800 mt-1">₹{c.amount_lakh} L</p>
            <p className="text-xs text-slate-400">{c.share_pct}% of total</p>
          </div>
        ))}
        <div className="bg-brand-600 text-white rounded-xl p-4">
          <p className="text-xs text-brand-100">Total</p>
          <p className="text-xl font-bold mt-1">₹{data.total_lakh} L</p>
          <p className="text-xs text-brand-200">Monthly</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-3">Optimization Recommendations</h3>
        <ul className="space-y-2">
          {data.recommendations?.map((r, i) => (
            <li key={i} className="text-sm text-slate-600 flex gap-2">
              <span className="text-brand-600 font-bold">→</span> {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
