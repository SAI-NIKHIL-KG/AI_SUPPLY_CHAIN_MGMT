import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('manager@bharatsmart.in');
  const [password, setPassword] = useState('manager123');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 text-white p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/10 p-2 rounded-xl">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Supply Chain</h1>
              <p className="text-brand-200 text-sm">BharatSmart Logistics Pvt. Ltd.</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Intelligent Decision Support for Indian Supply Chains
          </h2>
          <p className="text-brand-100 text-lg max-w-md">
            Demand forecasting · Inventory optimization · Supplier risk · Logistics analytics · What-if simulation
          </p>
        </div>
        <div className="space-y-3 text-sm text-brand-200">
          <p>✓ Multi-model AI forecasting (XGBoost, RF, ARIMA)</p>
          <p>✓ India network map · GST-aware · INR analytics</p>
          <p>✓ Role-based access · Production-style stack</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Package className="w-7 h-7 text-brand-600" />
            <span className="text-xl font-bold text-slate-800">AI Supply Chain</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
          <p className="text-slate-500 mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                placeholder="you@company.in"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-brand-600 font-semibold hover:underline">
              Sign up
            </Link>
          </p>

          <div className="mt-8 p-4 bg-slate-100 rounded-lg text-xs text-slate-600">
            <p className="font-semibold mb-1">Demo accounts:</p>
            <p>manager@bharatsmart.in / manager123</p>
            <p>admin@bharatsmart.in / admin123</p>
            <p>inventory@bharatsmart.in / inventory123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
