import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import './OwnerLogin.css';

const ROLE_REDIRECT = {
  super_admin:        { url: '/login',          label: 'Super Admin Login'   },
  restaurant_manager: { url: '/manager-login',  label: 'Manager Login'       },
  kitchen_staff:      { url: '/kitchen-login',  label: 'Kitchen Staff Login' },
};

const OwnerLogin = () => {
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
      if (role === 'owner') {
        toast.success('Welcome to Restro');
        navigate('/owner');
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
    <div className="owner-login-root">
      <div className="owner-grid-overlay" />
      <div className="owner-orb owner-orb-1" />
      <div className="owner-orb owner-orb-2" />

      <div className="owner-login-wrapper">

        {/* ── Logo + company name above card ── */}
        <div className="owner-top-brand">
          <img src="/logo.png" alt="Restro Logo" className="owner-logo" />
          <p className="owner-company-name">Restro — Restaurant Management Company</p>
        </div>

        {/* Card */}
        <div className="owner-card">
          <div className="owner-card-accent" />

          <div className="owner-card-header">
            <h1 className="owner-card-title">Owner Login</h1>
            <p className="owner-card-subtitle">Welcome back! Please login to your account.</p>
          </div>

          {/* Wrong-role warning */}
          {wrongRole && (
            <div className="owner-wrong-role-box">
              <div className="owner-wrong-role-header">
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none" style={{flexShrink:0}}>
                  <path d="M10 2L2 17h16L10 2Z" stroke="#B45309" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M10 8v4" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="10" cy="14.5" r="0.75" fill="#B45309"/>
                </svg>
                <div>
                  <p className="owner-wrong-role-title">Wrong login page</p>
                  <p className="owner-wrong-role-desc">
                    Your account doesn't have Owner access. Please use the correct page for your role.
                  </p>
                </div>
              </div>
              <a href={wrongRole.url} className="owner-wrong-role-link">
                <span>Go to {wrongRole.label}</span>
                <span className="owner-wrong-role-link-right">
                  <span className="owner-wrong-role-url">localhost:3000{wrongRole.url}</span>
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
            <div className="owner-error-box">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="owner-error-icon">
                <circle cx="8" cy="8" r="7" stroke="#B91C1C" strokeWidth="1.5"/>
                <path d="M8 4.5V8.5" stroke="#B91C1C" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="11" r="0.75" fill="#B91C1C"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="owner-form">

            <div className="owner-field">
              <label className="owner-label">Username or Email</label>
              <div className="owner-input-wrap">
                <svg className="owner-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2.5 13.5C2.5 11.015 5.015 9 8 9s5.5 2.015 5.5 4.5"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); clearAlerts(); }}
                  placeholder="e.g., owner@yourrestaurant.com"
                  className="owner-input"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="owner-field">
              <label className="owner-label">Password</label>
              <div className="owner-input-wrap">
                <svg className="owner-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="8" cy="10.5" r="1" fill="currentColor"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearAlerts(); }}
                  placeholder="Enter your password"
                  className="owner-input owner-input-password"
                  required
                  autoComplete="current-password"
                />
                <button type="button"
                  className={`owner-eye-btn ${showPassword ? 'active' : ''}`}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}>
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8Z" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="8" cy="8" r="1.75" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8Z" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="8" cy="8" r="1.75" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  )}
                </button>
              </div>
              <div className="owner-forgot-row">
               
              </div>
            </div>

            <button type="submit" disabled={loading}
              className={`owner-btn ${loading ? 'owner-btn-loading' : ''}`}>
              {loading ? (
                <span className="owner-loader">
                  <span className="owner-loader-ring" />
                  <svg className="owner-loader-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M6 2v4c0 1.1.9 2 2 2v14" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M6 2v3M8 2v3M10 2v3" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M18 2c0 0-4 2-4 7v2h4V2Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 11v11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </span>
              ) : (
                <>
                  <span>Login</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="owner-btn-arrow">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>

          </form>

          <p className="owner-card-footer">
            Owner Dashboard &nbsp;·&nbsp; Restro POS System
          </p>
        </div>

        <p className="owner-version">v2.0 &nbsp;·&nbsp; Secured Login</p>
      </div>
    </div>
  );
};

export default OwnerLogin;