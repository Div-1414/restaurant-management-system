import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ROLE_REDIRECT = {
  owner:              { url: '/owner-login',   label: 'Owner Portal',         icon: '🏪' },
  restaurant_manager: { url: '/manager-login', label: 'Manager Portal',       icon: '📋' },
  kitchen_staff:      { url: '/kitchen-login', label: 'Kitchen Staff Portal', icon: '🍳' },
};

const Login = () => {
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [wrongRole, setWrongRole] = useState(null);
  const { login }                 = useAuth();
  const navigate                  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setWrongRole(null);

    const result = await login({ username, password });

    if (result.success) {
      const role = result.user.role;
      if (role === 'super_admin') {
        toast.success('Welcome, Super Admin');
        navigate('/super-admin');
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const mapped = ROLE_REDIRECT[role];
        setWrongRole(mapped || { url: '/login', label: 'the correct login page' });
      }
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#F3EBDD] px-4 py-10">

      {/* Watermark */}
      <img src="/logo.png" alt=""
        className="absolute inset-0 m-auto w-[380px] opacity-[0.04] pointer-events-none select-none" />

      <div className="relative z-10 w-full max-w-md">

        {/* ── Logo + company name above card ── */}
        <div className="flex flex-col items-center mb-7">
          <img src="/logo.png" alt="Restro Logo" className="h-16 mb-3 drop-shadow-sm" />
          <p className="text-[13px] text-[#8A6A3F] font-medium tracking-wide text-center">
            Restro — Restaurant Management Company
          </p>
        </div>

        {/* ── Login card ── */}
        <div className="bg-[#FFFBF5] rounded-2xl shadow-lg border border-[#E2CFAE] px-8 py-8">

          {/* Title + badge */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-[#1F2937] mb-2">Super Admin Login</h1>
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold
              tracking-widest uppercase bg-[#1F2937] text-white px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F27830] inline-block animate-pulse"></span>
              Super Admin Access
            </span>
          </div>

          {/* Wrong-role warning */}
          {wrongRole && (
            <div className="mb-5 rounded-xl overflow-hidden border border-amber-200">
              <div className="bg-amber-50 px-4 py-3 flex items-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 mt-0.5">
                  <path d="M10 2L2 17h16L10 2Z" stroke="#B45309" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M10 8v4" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="10" cy="14.5" r="0.75" fill="#B45309"/>
                </svg>
                <div>
                  <p className="text-[13px] font-bold text-amber-800">Wrong login page</p>
                  <p className="text-[11.5px] text-amber-700 mt-0.5 leading-relaxed">
                    This page is for Super Admins only. Your account belongs to a different portal.
                  </p>
                </div>
              </div>
              <a href={wrongRole.url}
                className="flex items-center justify-between bg-white px-4 py-2.5
                  border-t border-amber-100 hover:bg-amber-50 transition-colors group">
                <span className="text-[12.5px] font-semibold text-amber-900">
                  Go to {wrongRole.label}
                </span>
                <span className="flex items-center gap-1.5 text-amber-600">
                  <code className="text-[10.5px] bg-amber-50 px-1.5 py-0.5 rounded font-mono">
                    localhost:3000{wrongRole.url}
                  </code>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </a>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5">
                <circle cx="8" cy="8" r="7" stroke="#B91C1C" strokeWidth="1.5"/>
                <path d="M8 4.5V8.5" stroke="#B91C1C" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="11" r="0.75" fill="#B91C1C"/>
              </svg>
              <span className="text-xs text-red-700 font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setWrongRole(null); setError(''); }}
                placeholder="Username"
                className="w-full px-4 py-3 rounded-lg border border-[#D6C2A3] bg-[#FFFDF9]
                  focus:outline-none focus:ring-2 focus:ring-[#C9A24D] focus:border-transparent
                  text-sm text-[#1F2937] placeholder-[#C4A87A] transition"
                required
              />
            </div>

            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setWrongRole(null); setError(''); }}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg border border-[#D6C2A3] bg-[#FFFDF9]
                  focus:outline-none focus:ring-2 focus:ring-[#C9A24D] focus:border-transparent
                  text-sm text-[#1F2937] placeholder-[#C4A87A] transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#C9A24D] hover:bg-[#B8933E]
                active:bg-[#A6832F] text-white font-semibold tracking-wide
                transition-all disabled:opacity-50 text-sm shadow-sm hover:shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Signing in...
                </span>
              ) : 'Login'}
            </button>
          </form>

          {/* ── Other portals — redesigned as a clean 3-column grid ── */}
          <div className="mt-7 pt-6 border-t border-[#E8D9BF]">
            <p className="text-[11px] font-semibold text-[#A08050] uppercase tracking-widest text-center mb-4">
              Other Portals
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {Object.entries(ROLE_REDIRECT).map(([role, info]) => (
                <a
                  key={role}
                  href={info.url}
                  className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl
                    bg-[#FDF6EC] border border-[#E8D9BF] hover:border-[#C9A24D]
                    hover:bg-[#FFF8EE] hover:shadow-sm transition-all group text-center"
                >
                  <span className="text-lg leading-none">{info.icon}</span>
                  <span className="text-[10.5px] font-semibold text-[#6B4E2A] leading-tight group-hover:text-[#C9A24D] transition-colors">
                    {info.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-[#A08050] mt-5 tracking-wide">
          Restro POS &nbsp;·&nbsp; Super Admin Console &nbsp;·&nbsp; v2.0
        </p>

      </div>
    </div>
  );
};

export default Login;