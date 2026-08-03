import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

const AdminLogin = () => {
  const navigate  = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password)  { setError('Email and password are required.'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || 'Invalid credentials. Please try again.');
        return;
      }

      // Store token + name in localStorage
      localStorage.setItem('token', data.jwtToken);
      localStorage.setItem('adminName', data.name || data.email || 'Admin');

      navigate('/admin/dashboard');
    } catch {
      setError('Could not reach the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <span className="w-8 h-8 rounded-full bg-teal relative shrink-0">
            <span className="absolute inset-2 rounded-full bg-clay" />
          </span>
          <span className="font-display font-semibold text-xl text-teal-deep">Physio Plus</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-sand-line">
          <h1 className="font-display font-semibold text-2xl text-teal-deep mb-1">Admin sign in</h1>
          <p className="text-sm text-ink/50 mb-7">Enter your credentials to access the admin panel.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-teal-deep block mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@physioplus.com"
                className="w-full border border-sand-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-sm font-semibold text-teal-deep block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-sand-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70 text-xs font-medium transition"
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-clay text-white font-semibold py-3 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition mt-1"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-sand-line"></div>
              <span className="shrink-0 px-3 text-ink/40 text-xs">or</span>
              <div className="flex-grow border-t border-sand-line"></div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={async (e) => {
                e.preventDefault();
                setEmail('admin@physioplus.com');
                setPassword('admin123');
                setLoading(true);
                setError('');
                try {
                  const res = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: 'admin@physioplus.com', password: 'admin123' }),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    setError(data.msg || 'Invalid credentials. Please try again.');
                    return;
                  }
                  localStorage.setItem('token', data.jwtToken);
                  localStorage.setItem('adminName', data.name || data.email || 'Admin');
                  navigate('/admin/dashboard');
                } catch {
                  setError('Could not reach the server. Make sure the backend is running.');
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full bg-teal-deep text-white font-semibold py-3 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition"
            >
              One-Click Demo Login
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ink/30 mt-6">
          Physio Plus Admin Panel · Secure Access
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
