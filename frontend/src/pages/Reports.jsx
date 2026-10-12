import { useState } from 'react';
import { reportsAPI } from '../services/api';
import { Download, FileText, Loader2 } from 'lucide-react';

const REPORTS = [
  { key: 'inventory', name: 'Inventory Report', desc: 'On-hand, safety stock, stockout risk by warehouse' },
  { key: 'forecast', name: 'Demand Forecast Report', desc: '7/30/90-day forecasts with accuracy metrics (see Forecast page)' },
  { key: 'suppliers', name: 'Supplier Performance Report', desc: 'Scorecards, risk bands, recommendations' },
  { key: 'logistics', name: 'Logistics Report', desc: 'Shipments, delays, on-time delivery, cost' },
  { key: 'risk', name: 'Risk Report', desc: 'Overall risk, mitigation actions' },
  { key: 'cost', name: 'Cost Report', desc: 'Procurement, transport, holding, warehouse (INR)' },
  { key: 'executive', name: 'Executive Summary', desc: 'KPI snapshot for leadership review' },
];

export default function Reports() {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const downloadCsv = async (key) => {
    if (key === 'forecast') {
      // Forecast is interactive on its own page; no bulk CSV table
      window.location.href = '/forecast';
      return;
    }
    setBusy(key);
    setError('');
    try {
      const res = await reportsAPI.download(key);
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${key}_report.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Download failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Reports & Export</h2>
        <p className="text-sm text-slate-500">CSV exports grounded in live dashboard data (INR)</p>
      </div>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORTS.map((r) => (
          <div
            key={r.key}
            className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
              </div>
            </div>
            <button
              onClick={() => downloadCsv(r.key)}
              disabled={busy === r.key}
              className="text-xs px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 flex items-center gap-1.5 disabled:opacity-60"
            >
              {busy === r.key ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
