import { useState } from 'react';
import { simulationAPI } from '../services/api';
import { FlaskConical, Loader2 } from 'lucide-react';

export default function Simulation() {
  const [scenario, setScenario] = useState('demand_increase');
  const [pct, setPct] = useState(20);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data } = await simulationAPI.run({
        scenario_type: scenario,
        percentage: pct,
        horizon_days: 30,
      });
      setResult(data);
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-800">What-If Simulation</h2>
        <p className="text-sm text-slate-500">
          Stress-test the supply chain under demand, delay, and cost shocks
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Scenario Type</label>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="demand_increase">Demand Increase</option>
            <option value="demand_decrease">Demand Decrease</option>
            <option value="supplier_delay">Supplier Delay</option>
            <option value="transport_cost">Transportation Cost Change</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Percentage: {pct}%
          </label>
          <input
            type="range"
            min={5}
            max={50}
            step={5}
            value={pct}
            onChange={(e) => setPct(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-60 transition"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
          Run Simulation
        </button>
      </div>

      {result && !result.error && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">{result.scenario}</h3>
          {result.baseline && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Baseline</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(result.baseline).map(([k, v]) => (
                  <div key={k} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-400">{k.replace(/_/g, ' ')}</p>
                    <p className="font-semibold text-slate-800">
                      {typeof v === 'number' && k.includes('inr')
                        ? `₹${v.toLocaleString('en-IN')}`
                        : String(v)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {result.scenario_result && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Scenario Impact</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {Object.entries(result.scenario_result).map(([k, v]) => {
                  if (Array.isArray(v)) {
                    return (
                      <div key={k} className="sm:col-span-2 bg-brand-50 rounded-lg p-3">
                        <p className="text-xs text-brand-600 font-semibold mb-1">Recommended Actions</p>
                        <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                          {v.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  return (
                    <div key={k} className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-400">{k.replace(/_/g, ' ')}</p>
                      <p className="font-semibold text-slate-800">
                        {typeof v === 'number' && (k.includes('inr') || k.includes('cost'))
                          ? `₹${Number(v).toLocaleString('en-IN')}`
                          : String(v)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
