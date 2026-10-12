import { useEffect, useState } from 'react';
import { forecastAPI } from '../services/api';

export default function Forecast() {
  const [forecasts, setForecasts] = useState([]);
  const [accuracy, setAccuracy] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([forecastAPI.products(30), forecastAPI.accuracy()])
      .then(([f, a]) => {
        setForecasts(f.data.forecasts || []);
        setAccuracy(a.data.models || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Demand Forecasting</h2>
        <p className="text-sm text-slate-500">
          Multi-model AI · Linear Regression · Random Forest · XGBoost · ARIMA · 7/30/90-day horizons
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Model Accuracy (30-day horizon)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="text-left px-4 py-3">Model</th>
                <th className="text-right px-4 py-3">MAE</th>
                <th className="text-right px-4 py-3">RMSE</th>
                <th className="text-right px-4 py-3">MAPE (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accuracy.map((m) => (
                <tr key={m.model} className={m.model === 'XGBoost' ? 'bg-brand-50' : ''}>
                  <td className="px-4 py-3 font-medium">
                    {m.model}
                    {m.model === 'XGBoost' && (
                      <span className="ml-2 text-xs bg-brand-600 text-white px-1.5 py-0.5 rounded">Default</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">{m.mae}</td>
                  <td className="px-4 py-3 text-right">{m.rmse}</td>
                  <td className="px-4 py-3 text-right font-semibold">{m.mape}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Product Forecasts (XGBoost · 30-day)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="text-left px-4 py-3">SKU</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-right px-4 py-3">Total Predicted</th>
                <th className="text-right px-4 py-3">MAPE</th>
                <th className="text-right px-4 py-3">MAE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">Loading…</td>
                </tr>
              )}
              {forecasts.slice(0, 20).map((f) => (
                <tr key={f.product_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{f.sku}</td>
                  <td className="px-4 py-3 text-slate-600">{f.name}</td>
                  <td className="px-4 py-3 text-right">{f.total_predicted_demand?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{f.mape}%</td>
                  <td className="px-4 py-3 text-right">{f.mae}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
