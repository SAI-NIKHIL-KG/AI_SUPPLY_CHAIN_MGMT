import { useEffect, useState } from 'react';
import { logisticsAPI } from '../services/api';

export default function Logistics() {
  const [shipments, setShipments] = useState([]);
  const [delayed, setDelayed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([logisticsAPI.shipments(), logisticsAPI.delayed()])
      .then(([s, d]) => {
        setShipments(s.data.shipments || []);
        setDelayed(d.data.delayed || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Logistics Management</h2>
        <p className="text-sm text-slate-500">Shipments · Routes · Delay prediction · On-time metrics</p>
      </div>

      {delayed.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 mb-2">Delayed Shipments ({delayed.length})</h3>
          <div className="space-y-1">
            {delayed.slice(0, 5).map((s) => (
              <p key={s.shipment_number} className="text-sm text-red-700">
                {s.shipment_number}: {s.origin} → {s.destination} ({s.actual_days}d vs planned {s.planned_days}d)
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="text-left px-4 py-3">Shipment</th>
                <th className="text-left px-4 py-3">Route</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Days</th>
                <th className="text-right px-4 py-3">Cost (₹)</th>
                <th className="text-left px-4 py-3">Vehicle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading…</td></tr>
              )}
              {shipments.slice(0, 40).map((s) => (
                <tr key={s.id} className={`hover:bg-slate-50 ${s.delay_flag ? 'bg-red-50/50' : ''}`}>
                  <td className="px-4 py-3 font-medium">{s.shipment_number}</td>
                  <td className="px-4 py-3">{s.origin} → {s.destination}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      s.delay_flag ? 'bg-red-100 text-red-700' :
                      s.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{s.actual_days ?? s.planned_days}</td>
                  <td className="px-4 py-3 text-right">{s.cost?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-slate-500">{s.vehicle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
