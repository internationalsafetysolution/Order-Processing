'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail, AlertCircle, Building2, UserCheck, Receipt, Truck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({ app_name: 'Order Management', app_logo: null });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => {
        if (res.ok) return res.json();
      })
      .then(data => {
        if (data) {
          setSettings({
            app_name: data.app_name || 'Order Management',
            app_logo: data.app_logo || null
          });
        }
      })
      .catch(err => console.error('Failed to fetch login page branding settings:', err));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        if (!res.ok) {
          throw new Error(`Server error (${res.status}). Please try again.`);
        }
      }

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Success -> Redirect to respective dashboard
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/staff');
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const autofill = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decorative Pastel Rings */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-orange-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 bg-white border border-zinc-200 p-8 rounded-2xl shadow-xl relative z-10">
        <div>
          {settings.app_logo ? (
            <div className="mx-auto h-16 w-32 flex items-center justify-center overflow-hidden">
              <img src={settings.app_logo} alt="App Logo" className="max-h-full max-w-full object-contain" />
            </div>
          ) : (
            <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-tr from-brand-orange to-amber-500 flex items-center justify-center shadow-md">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          )}
          <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-950 tracking-tight font-sans">
            {settings.app_name}
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-500">
            Sign in to access your designated workflow
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-zinc-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-zinc-300 bg-white text-zinc-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange sm:text-sm placeholder-zinc-400"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-zinc-300 bg-white text-zinc-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange sm:text-sm placeholder-zinc-400"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Demo Fast Login Shortcuts */}
        <div className="pt-6 border-t border-zinc-200">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 text-center">
            Quick Credentials (for testing)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => autofill('admin@company.com', 'password123')}
              className="flex items-center gap-1.5 p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded transition-colors text-left font-semibold cursor-pointer"
            >
              <Building2 className="h-3.5 w-3.5 text-brand-orange shrink-0" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => autofill('task@company.com', 'password123')}
              className="flex items-center gap-1.5 p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded transition-colors text-left font-semibold cursor-pointer"
            >
              <UserCheck className="h-3.5 w-3.5 text-orange-650 shrink-0" />
              <span>Staff (Task DC)</span>
            </button>
            <button
              onClick={() => autofill('invoice@company.com', 'password123')}
              className="flex items-center gap-1.5 p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded transition-colors text-left font-semibold cursor-pointer"
            >
              <Receipt className="h-3.5 w-3.5 text-brand-green shrink-0" />
              <span>Staff (Invoice)</span>
            </button>
            <button
              onClick={() => autofill('courier@company.com', 'password123')}
              className="flex items-center gap-1.5 p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded transition-colors text-left font-semibold cursor-pointer"
            >
              <Truck className="h-3.5 w-3.5 text-sky-600 shrink-0" />
              <span>Staff (Courier)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
