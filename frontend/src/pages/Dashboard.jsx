import { useEffect, useState } from 'react';
import { dashboardAPI, inventoryAPI, riskAPI } from '../services/api';
import {
  Package, Truck, AlertTriangle, TrendingUp, IndianRupee, Warehouse,
  ShoppingCart, CheckCircle
} from 'lucide-react';

function KPI({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardAPI.summary(),
      inventoryAPI.alerts(),
      riskAPI.overview(),
    ])
      .then(([s, a, r]) => {
        setSummary(s.data);
        setAlerts(a.data.alerts || []);
        setRisk(r.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const fmt = (n) =>
    n != null
      ? `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
      : '—';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Executive Dashboard</h2>
        <p className="text-sm text-slate-500">
          {summary?.company || 'BharatSmart Logistics'} · Live operational overview
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          label="Total Inventory Value"
          value={fmt(summary?.total_inventory_value)}
          icon={Package}
          color="bg-brand-600"
        />
        <KPI
          label="Pending Orders"
          value={summary?.pending_orders ?? '—'}
          icon={ShoppingCart}
          color="bg-amber-500"
          sub={`${summary?.total_orders ?? 0} total orders`}
        />
        <KPI
          label="On-Time Delivery"
          value={`${summary?.on_time_delivery_pct ?? '—'}%`}
          icon={CheckCircle}
          color="bg-emerald-600"
        />
        <KPI
          label="Stockout Risk Items"
          value={summary?.stockout_risk_count ?? '—'}
          icon={AlertTriangle}
          color="bg-red-500"
          sub={`${summary?.critical_stock_count ?? 0} critical`}
        />
        <KPI
          label="High-Risk Suppliers"
          value={summary?.supplier_risk_count ?? '—'}
          icon={Truck}
          color="bg-orange-500"
        />
        <KPI
          label="Transport Cost (MTD)"
          value={fmt(summary?.transportation_cost)}
          icon={IndianRupee}
          color="bg-violet-600"
        />
        <KPI
          label="Forecast MAPE"
          value={`${summary?.forecast_accuracy_mape ?? '—'}%`}
          icon={TrendingUp}
          color="bg-cyan-600"
          sub="XGBoost default"
        />
        <KPI
          label="Warehouse Utilization"
          value={`${summary?.warehouse_utilization_pct ?? '—'}%`}
          icon={Warehouse}
          color="bg-slate-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Critical & Low Stock Alerts</h3>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto space-y-2">
            {alerts.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No active alerts</p>
            )}
            {alerts.slice(0, 10).map((a) => (
              <div
                key={a.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  a.status === 'Critical'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {a.sku} · {a.product_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {a.warehouse} · Qty {a.quantity} · ROP {a.reorder_point}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    a.status === 'Critical'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk overview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Supply Chain Risk</h3>
            {risk && (
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  risk.overall_risk_band === 'LOW'
                    ? 'bg-emerald-100 text-emerald-700'
                    : risk.overall_risk_band === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-700'
                    : risk.overall_risk_band === 'HIGH'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {risk.overall_risk_band} ({risk.overall_risk_score})
              </span>
            )}
          </div>
          <div className="p-5 space-y-4">
            {risk?.mitigation_recommendations?.map((r, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-600">{r}</p>
              </div>
            ))}
            {risk?.supplier_risk?.items?.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-2">High-risk suppliers</p>
                {risk.supplier_risk.items.slice(0, 4).map((s, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span className="text-slate-700">{s.name}</span>
                    <span className="text-red-600 font-medium">{s.risk_band}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
