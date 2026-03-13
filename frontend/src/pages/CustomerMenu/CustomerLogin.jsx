// FILE: CustomerLogin.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CustomerMenu.css';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

const CustomerLogin = () => {
  const { restaurantId, tableId } = useParams();
  const navigate = useNavigate();

  const [restaurantName, setRestaurantName] = useState('');
  const [tableInfo,      setTableInfo]      = useState('');
  const [name,  setName]    = useState('');
  const [phone, setPhone]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error,    setError]    = useState('');

  // ✅ NEW: restaurant closed state
  const [restaurantClosed, setRestaurantClosed] = useState(false);

  // Fetch restaurant info + detect closed status
  useEffect(() => {
    const fetchName = async () => {
      try {
        const res = await api.get(`/customer/menu/${restaurantId}/${tableId}/`);

        // ✅ Check is_open from restaurant data
        const isOpen = res.data?.restaurant?.is_open;
        if (isOpen === false) {
          setRestaurantName(res.data?.restaurant?.name || 'Our Restaurant');
          setRestaurantClosed(true);
          setFetching(false);
          return;
        }

        setRestaurantName(res.data?.restaurant?.name || 'Our Restaurant');

        const table    = res.data?.table;
        const tableNum = table?.table_number;
        const hallName = table?.hall_name || '';

        if (tableNum && hallName && hallName.toLowerCase() !== 'general') {
          setTableInfo(`${hallName} · Table ${tableNum}`);
        } else if (tableNum) {
          setTableInfo(`Table ${tableNum}`);
        } else {
          setTableInfo('');
        }
      } catch (err) {
        // ✅ Also catch backend-level closed/inactive errors
        const data = err?.response?.data;
        if (
          data?.is_open === false ||
          data?.detail?.toLowerCase?.().includes('closed') ||
          data?.detail?.toLowerCase?.().includes('inactive')
        ) {
          setRestaurantClosed(true);
        } else {
          setRestaurantName('Our Restaurant');
          setTableInfo('');
        }
      } finally {
        setFetching(false);
      }
    };
    fetchName();
  }, [restaurantId, tableId]);

  // ✅ Phone: only digits, max 10
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) setPhone(val);
  };

  const isPhoneValid = phone.length === 10;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimName = name.trim();

    if (!trimName) {
      setError('Please enter your name.');
      return;
    }

    // ✅ Strict 10-digit validation
    if (!isPhoneValid) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);

    const customerData = {
      name:      trimName,
      phone:     phone,
      restaurantId,
      tableId,
      loginTime: new Date().toISOString(),
    };

    sessionStorage.setItem(
      `customer_${restaurantId}_${tableId}`,
      JSON.stringify(customerData)
    );

    navigate(`/menu/${restaurantId}/${tableId}`, {
      state: { isNewLogin: true, customerName: trimName },
    });
  };

  /* ── Loading spinner ── */
  if (fetching) {
    return (
      <div className="cm-login-page">
        <div className="cm-loading" style={{ background: 'transparent' }}>
          <div className="cm-spinner" style={{ borderTopColor: '#fff' }} />
        </div>
      </div>
    );
  }

  /* ── ✅ Restaurant Closed Screen ── */
  if (restaurantClosed) {
    return (
      <div className="cm-login-page">
        <div className="cm-login-card" style={{ textAlign: 'center' }}>

          {/* Lock icon */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(239,68,68,0.1)',
            border: '2px solid rgba(239,68,68,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 20px',
          }}>
            🔒
          </div>

          {/* Restaurant name */}
          <div className="cm-login-badge" style={{ marginBottom: 12 }}>
            {restaurantName}
          </div>

          <h1 className="cm-login-title" style={{ fontSize: '1.4rem' }}>
            We're Closed
          </h1>

          <p className="cm-login-sub" style={{ marginBottom: 20 }}>
            Sorry, this restaurant is not accepting orders right now.
          </p>

          {/* Closed badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '10px 20px',
            color: '#ef4444', fontWeight: 700, fontSize: '0.95rem',
            marginBottom: 24,
          }}>
            <span style={{ fontSize: '1rem' }}>⛔</span>
            Restaurant is Currently Closed
          </div>

          <p style={{
            color: 'var(--text-muted)', fontSize: '0.85rem',
            lineHeight: 1.6,
          }}>
            Please come back later or contact the restaurant directly.
          </p>

        </div>
      </div>
    );
  }

  /* ── Normal Login Form ── */
  return (
    <div className="cm-login-page">
      <div className="cm-login-card">

        {/* Restaurant badge */}
        <div className="cm-login-badge">{restaurantName}</div>

        <h1 className="cm-login-title">Welcome!</h1>
        <p className="cm-login-sub">Enter your details to start ordering</p>

        {error && <div className="cm-login-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="cm-form-group">
            <label className="cm-label" htmlFor="cm-name">Your Name</label>
            <input
              id="cm-name"
              type="text"
              className="cm-input"
              placeholder="Enter Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              autoFocus
              maxLength={60}
            />
          </div>

          <div className="cm-form-group">
            <label className="cm-label" htmlFor="cm-phone">Phone Number</label>

            {/* ✅ Phone input with live counter */}
            <div style={{ position: 'relative' }}>
              <input
                id="cm-phone"
                type="tel"
                className="cm-input"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={handlePhoneChange}
                autoComplete="tel"
                inputMode="numeric"
                style={{
                  paddingRight: 52,
                  borderColor: phone.length > 0
                    ? isPhoneValid ? '#16a34a' : '#ef4444'
                    : undefined,
                }}
              />
              {/* Digit counter */}
              <span style={{
                position: 'absolute', right: 12, top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.75rem', fontWeight: 600, pointerEvents: 'none',
                color: isPhoneValid
                  ? '#16a34a'
                  : phone.length > 0 ? '#ef4444' : '#9ca3af',
              }}>
                {phone.length}/10
              </span>
            </div>

            {/* Inline validation hint */}
            {phone.length > 0 && !isPhoneValid && (
              <p style={{
                margin: '4px 0 0', fontSize: '0.78rem',
                color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                ⚠ Enter a valid 10-digit number
              </p>
            )}
          </div>

          {tableInfo && (
            <p className="cm-login-table-hint">📍 {tableInfo}</p>
          )}

          <button
            type="submit"
            className="cm-login-btn"
            disabled={loading || !name.trim() || !isPhoneValid}
          >
            {loading ? 'Please wait…' : 'Start Ordering →'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default CustomerLogin;