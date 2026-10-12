export default function MapPage() {
  const cities = [
    { name: 'Bengaluru', role: 'HQ + Warehouse', x: 42, y: 72 },
    { name: 'Mumbai', role: 'Warehouse', x: 28, y: 48 },
    { name: 'Delhi', role: 'Warehouse', x: 38, y: 22 },
    { name: 'Hyderabad', role: 'Warehouse', x: 45, y: 58 },
    { name: 'Chennai', role: 'Warehouse', x: 52, y: 72 },
    { name: 'Pune', role: 'Supplier Hub', x: 32, y: 52 },
    { name: 'Ahmedabad', role: 'Warehouse', x: 30, y: 38 },
    { name: 'Kolkata', role: 'Warehouse', x: 68, y: 42 },
    { name: 'Jaipur', role: 'Distribution', x: 35, y: 30 },
    { name: 'Kochi', role: 'Warehouse', x: 38, y: 82 },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800">India Supply Chain Network Map</h2>
        <p className="text-sm text-slate-500">
          Warehouses · Suppliers · Routes across major Indian logistics hubs
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden" style={{ minHeight: 480 }}>
        {/* Simplified India outline representation */}
        <div className="absolute inset-6 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl border border-slate-200">
          {cities.map((c) => (
            <div
              key={c.name}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
            >
              <div className="w-4 h-4 rounded-full bg-brand-600 border-2 border-white shadow-md group-hover:scale-150 transition" />
              <div className="absolute left-1/2 -translate-x-1/2 top-5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
                <p className="font-semibold">{c.name}</p>
                <p className="text-slate-300">{c.role}</p>
              </div>
              <p className="absolute left-1/2 -translate-x-1/2 top-5 text-[10px] font-medium text-slate-600 whitespace-nowrap pointer-events-none">
                {c.name}
              </p>
            </div>
          ))}
          {/* Sample routes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
            <line x1="42%" y1="72%" x2="28%" y2="48%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4" />
            <line x1="42%" y1="72%" x2="45%" y2="58%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4" />
            <line x1="28%" y1="48%" x2="38%" y2="22%" stroke="#22c55e" strokeWidth="2" />
            <line x1="45%" y1="58%" x2="52%" y2="72%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4" />
            <line x1="38%" y1="22%" x2="68%" y2="42%" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6" />
          </svg>
        </div>
        <div className="absolute bottom-4 left-4 flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500" /> Active route</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500" /> On-time</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-500" /> At-risk</span>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Note: Full Leaflet map integration available in production build. Nodes represent BharatSmart warehouses and major supplier cities.
      </p>
    </div>
  );
}
