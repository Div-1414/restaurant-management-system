import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import './ManagerLogin.css';

const ROLE_REDIRECT = {
  super_admin:   { url: '/login',          label: 'Super Admin Login'   },
  owner:         { url: '/owner-login',    label: 'Owner Login'         },
  kitchen_staff: { url: '/kitchen-login',  label: 'Kitchen Staff Login' },
};

const ManagerLogin = () => {
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [wrongRole, setWrongRole]       = useState(null);
  const { login }                       = useAuth();
  const navigate                        = useNavigate();

  const clearAlerts = () => { setError(''); setWrongRole(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearAlerts();

    const result = await login({ username, password });

    if (result.success) {
      const role = result.user.role;
      if (role === 'restaurant_manager') {
        toast.success('Welcome to Restro');
        navigate('/manager');
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setWrongRole(ROLE_REDIRECT[role] || { url: '/login', label: 'the correct login page' });
      }
    } else {
      setError(result.error || 'Invalid username or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="mgr-root">
      <div className="mgr-stripe-overlay" />

      {/* ── Top bar — company name, NOT restaurant name ── */}
      <div className="mgr-top-bar">
        <div className="mgr-top-bar-inner">
          <div className="mgr-top-brand">
            {/* Logo */}
            <img src="/logo.png" alt="Restro" className="mgr-top-logo" />
            <div className="mgr-top-brand-text">
              <span className="mgr-brand-name">Restro</span>
              <span className="mgr-brand-tagline">Restaurant Management Company</span>
            </div>
            <span className="mgr-brand-sep" />
            <span className="mgr-brand-page">Manager Login</span>
          </div>
          <div className="mgr-access-badge">
            <span className="mgr-badge-dot" />
            MANAGEMENT ACCESS
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mgr-body">
        <div className="mgr-card">
          <div className="mgr-card-sidebar" />

          <div className="mgr-card-content">
            <div className="mgr-card-header">
              <div className="mgr-header-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#F27830" strokeWidth="1.8"/>
                  <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="#F27830" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M18 3l1.5 1.5L22 2" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="mgr-title">Manager Login</h1>
              <p className="mgr-subtitle">Please login to manage operations.</p>
            </div>

            <div className="mgr-divider" />

            {/* Wrong-role warning */}
            {wrongRole && (
              <div className="mgr-wrong-role-box">
                <div className="mgr-wrong-role-header">
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" style={{flexShrink:0}}>
                    <path d="M10 2L2 17h16L10 2Z" stroke="#B45309" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M10 8v4" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="10" cy="14.5" r="0.75" fill="#B45309"/>
                  </svg>
                  <div>
                    <p className="mgr-wrong-role-title">Wrong login page</p>
                    <p className="mgr-wrong-role-desc">
                      Your account doesn't have Manager access. Use the correct page for your role.
                    </p>
                  </div>
                </div>
                <a href={wrongRole.url} className="mgr-wrong-role-link">
                  <span>Go to {wrongRole.label}</span>
                  <span className="mgr-wrong-role-link-right">
                    <span className="mgr-wrong-role-url">localhost:3000{wrongRole.url}</span>
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
              <div className="mgr-error-box">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="mgr-error-icon">
                  <circle cx="8" cy="8" r="7" stroke="#B91C1C" strokeWidth="1.5"/>
                  <path d="M8 4.5V8.5" stroke="#B91C1C" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="8" cy="11" r="0.75" fill="#B91C1C"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mgr-form">

              <div className="mgr-field">
                <label className="mgr-label">Username or Email</label>
                <div className="mgr-input-wrap">
                  <span className="mgr-input-prefix">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M2.5 13.5C2.5 11.015 5.015 9 8 9s5.5 2.015 5.5 4.5"
                        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <input type="text" value={username}
                    onChange={(e) => { setUsername(e.target.value); clearAlerts(); }}
                    placeholder="e.g., manager@restro.com"
                    className="mgr-input" required autoComplete="username"/>
                </div>
              </div>

              <div className="mgr-field">
                <label className="mgr-label">Password</label>
                <div className="mgr-input-wrap">
                  <span className="mgr-input-prefix">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      <circle cx="8" cy="10.5" r="0.9" fill="currentColor"/>
                    </svg>
                  </span>
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => { setPassword(e.target.value); clearAlerts(); }}
                    placeholder="Enter your password"
                    className="mgr-input mgr-input-pw" required autoComplete="current-password"/>
                  <button type="button"
                    className={`mgr-eye-btn ${showPassword ? 'active' : ''}`}
                    onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? (
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8Z" stroke="currentColor" strokeWidth="1.4"/>
                        <circle cx="8" cy="8" r="1.75" stroke="currentColor" strokeWidth="1.4"/>
                        <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8Z" stroke="currentColor" strokeWidth="1.4"/>
                        <circle cx="8" cy="8" r="1.75" stroke="currentColor" strokeWidth="1.4"/>
                      </svg>
                    )}
                  </button>
                </div>
                <div className="mgr-forgot-row">
                  
                </div>
              </div>

              <button type="submit" disabled={loading}
                className={`mgr-btn ${loading ? 'mgr-btn-loading' : ''}`}>
                {loading ? (
                  <span className="mgr-loader">
                    <span className="mgr-loader-outer-ring" />
                    <span className="mgr-loader-inner-ring" />
                    <span className="mgr-loader-center-dot" />
                  </span>
                ) : (
                  <span className="mgr-btn-text">LOGIN</span>
                )}
              </button>

            </form>

            <div className="mgr-stats-row">
              <div className="mgr-stat"><span className="mgr-stat-dot mgr-stat-dot-green" /><span className="mgr-stat-label">Operations</span></div>
              <div className="mgr-stat-sep" />
              <div className="mgr-stat"><span className="mgr-stat-dot mgr-stat-dot-orange" /><span className="mgr-stat-label">Tables</span></div>
              <div className="mgr-stat-sep" />
              <div className="mgr-stat"><span className="mgr-stat-dot mgr-stat-dot-purple" /><span className="mgr-stat-label">Orders</span></div>
            </div>
          </div>
        </div>

        <p className="mgr-footer">
          Restro — Restaurant Management Company &nbsp;·&nbsp; Manager Portal
        </p>
      </div>
    </div>
  );
};

export default ManagerLogin;