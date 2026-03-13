import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import './KitchenLogin.css';

const ROLE_REDIRECT = {
  super_admin:        { url: '/login',          label: 'Super Admin Login' },
  owner:              { url: '/owner-login',    label: 'Owner Login'       },
  restaurant_manager: { url: '/manager-login',  label: 'Manager Login'     },
};

const KitchenLogin = () => {
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
      if (role === 'kitchen_staff') {
        toast.success('Welcome to Restro');
        navigate('/kitchen');
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setWrongRole(ROLE_REDIRECT[role] || { url: '/login', label: 'the correct login page' });
      }
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="kit-root">
      <div className="kit-vignette" />
      <div className="kit-watermark-grid" />

      <div className="kit-page-wrapper">

        {/* ── Logo + company name above card ── */}
        <div className="kit-top-brand">
          <img src="/logo.png" alt="Restro Logo" className="kit-logo" />
          <div className="kit-top-brand-text">
            <span className="kit-top-brand-name">Restro</span>
            <span className="kit-top-brand-sub">Restaurant Management Company</span>
          </div>
        </div>

        {/* Card */}
        <div className="kit-card">
          <div className="kit-card-top-rule" />

          <div className="kit-card-header">
            <h1 className="kit-title">Kitchen Staff Login</h1>
            <p className="kit-subtitle">Welcome! Please enter your kitchen staff credentials.</p>
          </div>

          <div className="kit-role-chip">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 1l1.2 2.4L10 3.8 8 5.8l.5 2.9L6 7.4 3.5 8.7 4 5.8 2 3.8l2.8-.4z"
                fill="#C5A059" stroke="#C5A059" strokeWidth="0.5" strokeLinejoin="round"/>
            </svg>
            KITCHEN STAFF
          </div>

          {/* Wrong-role warning */}
          {wrongRole && (
            <div className="kit-wrong-role-box">
              <div className="kit-wrong-role-header">
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none" style={{flexShrink:0}}>
                  <path d="M10 2L2 17h16L10 2Z" stroke="#B45309" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M10 8v4" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="10" cy="14.5" r="0.75" fill="#B45309"/>
                </svg>
                <div>
                  <p className="kit-wrong-role-title">Wrong login page</p>
                  <p className="kit-wrong-role-desc">
                    Your account doesn't have Kitchen Staff access. Use the correct page for your role.
                  </p>
                </div>
              </div>
              <a href={wrongRole.url} className="kit-wrong-role-link">
                <span>Go to {wrongRole.label}</span>
                <span className="kit-wrong-role-link-right">
                  <span className="kit-wrong-role-url">localhost:3000{wrongRole.url}</span>
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
            <div className="kit-error-box">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="kit-error-icon">
                <circle cx="8" cy="8" r="7" stroke="#B91C1C" strokeWidth="1.5"/>
                <path d="M8 4.5V8.5" stroke="#B91C1C" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="11" r="0.75" fill="#B91C1C"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="kit-form">

            <div className="kit-field">
              <label className="kit-label">Username or Email</label>
              <div className="kit-input-wrap">
                <svg className="kit-input-icon" width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M2.5 13.5C2.5 11.015 5.015 9 8 9s5.5 2.015 5.5 4.5"
                    stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <input type="text" value={username}
                  onChange={(e) => { setUsername(e.target.value); clearAlerts(); }}
                  placeholder="e.g., k.staff.smith"
                  className="kit-input" required autoComplete="username"/>
              </div>
            </div>

            <div className="kit-field">
              <label className="kit-label">Password</label>
              <div className="kit-input-wrap">
                <svg className="kit-input-icon" width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  <circle cx="8" cy="10.5" r="0.9" fill="currentColor"/>
                </svg>
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => { setPassword(e.target.value); clearAlerts(); }}
                  placeholder="Enter your password"
                  className="kit-input kit-input-pw" required autoComplete="current-password"/>
                <button type="button"
                  className={`kit-eye-btn ${showPassword ? 'active' : ''}`}
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
              <div className="kit-forgot-row">
               
              </div>
            </div>

            <button type="submit" disabled={loading}
              className={`kit-btn ${loading ? 'kit-btn-loading' : ''}`}>
              {loading ? (
                <span className="kit-loader">
                  <span className="kit-loader-orbit-track" />
                  <span className="kit-loader-fork kit-loader-utensil">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path d="M5 1v3c0 .7.5 1.3 1.2 1.3V13" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                      <path d="M4 1v2M5.5 1v2M7 1v2" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <span className="kit-loader-knife kit-loader-utensil">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path d="M9 1c0 0-3 1.5-3 4.5V7h3V1Z" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 7v6" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <span className="kit-loader-center" />
                </span>
              ) : (
                <span className="kit-btn-text">LOGIN</span>
              )}
            </button>

          </form>

          <div className="kit-card-footer">
            <div className="kit-footer-rule" />
            <p className="kit-footer-text">
              Restro — Restaurant Management Company &nbsp;·&nbsp; Kitchen Portal
            </p>
          </div>
        </div>

        <p className="kit-version">Secured &nbsp;·&nbsp; Kitchen Module v2.0</p>
      </div>
    </div>
  );
};

export default KitchenLogin;