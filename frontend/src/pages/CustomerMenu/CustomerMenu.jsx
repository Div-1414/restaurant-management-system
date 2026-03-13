// FILE: CustomerMenu.jsx
// Shell component: auth guard, tab navigation, session reset after bill paid.
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomerDashboard from './CustomerDashboard';
import CustomerOrders    from './CustomerOrders';
import './CustomerMenu.css';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

const CustomerMenu = () => {
  const { restaurantId, tableId } = useParams();
  const navigate = useNavigate();

  const [customer,     setCustomer]     = useState(null);
  const [menuData,     setMenuData]     = useState(null);
  const [currentView,  setCurrentView]  = useState('menu');
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [session,      setSession]      = useState(null);
  // ── FIX 5: track if bill is paid so we can reset session ──
  const [billPaid,     setBillPaid]     = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // ── FIX 5: sessionStorage instead of localStorage ──
        // sessionStorage is per-tab/browser-session so a new customer scanning the
        // QR code (new tab) naturally gets a fresh session.
        // Additionally we check server-side whether the current table session is
        // paid/closed, and if so we redirect to login.
        const stored = sessionStorage.getItem(`customer_${restaurantId}_${tableId}`);

        if (!stored) {
          navigate(`/login/${restaurantId}/${tableId}`);
          return;
        }

        const parsed = JSON.parse(stored);
        setCustomer(parsed);

        // ── FIX 5: check if table session is already billed/paid ──
        // If the owner generated a bill or marked it paid, send the new customer
        // back to login so they start fresh.
        const sessionReset = await checkTableSessionReset();
        if (sessionReset) {
          sessionStorage.removeItem(`customer_${restaurantId}_${tableId}`);
          navigate(`/login/${restaurantId}/${tableId}`);
          return;
        }

        await fetchMenu();
        await fetchActiveSession();
      } catch (err) {
        console.error('Init error:', err);
        setError('Failed to initialise. Please scan QR again.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [restaurantId, tableId, navigate]);

  // Poll for session status every 15 s so bill-paid reset works automatically
  useEffect(() => {
    if (!customer) return;
    const interval = setInterval(async () => {
      const reset = await checkTableSessionReset();
      if (reset) {
        sessionStorage.removeItem(`customer_${restaurantId}_${tableId}`);
        navigate(`/login/${restaurantId}/${tableId}`);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [customer, restaurantId, tableId, navigate]);

  /* ── FIX 5: session reset checker ────────────────
   * Returns true if the active table session was paid/closed by the owner,
   * meaning we must redirect to login for the next customer.
   */
  const checkTableSessionReset = async () => {
    try {
      // Check for paid sessions on this table
      const paidRes = await api.get(
        `/order-sessions/?restaurant=${restaurantId}&table=${tableId}&status=paid`
      );
      if (paidRes.data && paidRes.data.length > 0) {
        // There's a recently paid session — check if customer logged in BEFORE it was paid
        const stored = sessionStorage.getItem(`customer_${restaurantId}_${tableId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          const loginTime  = new Date(parsed.loginTime).getTime();
          const paidSession = paidRes.data[0];
          const paidTime   = paidSession.updated_at
            ? new Date(paidSession.updated_at).getTime()
            : 0;
          // If bill was paid after this customer logged in → reset
          if (paidTime > loginTime) return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await api.get(`/customer/menu/${restaurantId}/${tableId}/`);
      console.log('API Response:', response.data);
      const safeData = {
        restaurant: response.data.restaurant || {},
        table:      response.data.table      || {},
        menu:       Array.isArray(response.data.menu) ? response.data.menu : [],
      };
      setMenuData(safeData);
    } catch (err) {
      console.error('Menu fetch error:', err);
      setError('Failed to load menu. Restaurant may be closed or inactive.');
    }
  };

  const fetchActiveSession = async () => {
    try {
      const res = await api.get(
        `/order-sessions/?restaurant=${restaurantId}&table=${tableId}&status=active`
      );
      if (res.data && res.data.length > 0) setSession(res.data[0]);
    } catch (err) {
      console.error('Session fetch error:', err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(`customer_${restaurantId}_${tableId}`);
    navigate(`/login/${restaurantId}/${tableId}`);
  };

  /* ── render states ─────────────────────────────── */
  if (loading) return (
    <div className="cm-loading">
      <div className="cm-spinner" />
      <p>Loading menu…</p>
    </div>
  );

  if (error) return (
    <div className="cm-error-screen">
      <h2>⚠️ Error</h2>
      <p>{error}</p>
      <button className="cm-retry-btn" onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );

  if (!customer) return (
    <div className="cm-error-screen">
      <h2>Session Expired</h2>
      <p>Please scan the QR code again</p>
    </div>
  );

  if (!menuData || !Array.isArray(menuData.menu) || menuData.menu.length === 0) return (
    <div className="cm-error-screen">
      <h2>🍽️ No Menu Available</h2>
      <p>The menu appears to be empty.</p>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
        Restaurant: {menuData?.restaurant?.name || 'Unknown'} · Categories: {menuData?.menu?.length || 0}
      </p>
      <button className="cm-retry-btn" onClick={fetchMenu}>Reload Menu</button>
    </div>
  );

  return (
    <div className="cm-page">

      {/* Header */}
      <header className="cm-header">
        <div className="cm-header-left">
          <span className="cm-restaurant-name">
            {menuData.restaurant?.name || 'Restaurant'}
          </span>
          <span className="cm-table-badge">
            Table #{menuData.table?.table_number || tableId}
          </span>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="cm-nav-tab-bar">
        <button
          className={`cm-nav-tab${currentView === 'menu' ? ' active' : ''}`}
          onClick={() => setCurrentView('menu')}
        >
          🍽️ Menu
        </button>
        <button
          className={`cm-nav-tab${currentView === 'orders' ? ' active' : ''}`}
          onClick={() => setCurrentView('orders')}
        >
          📋 My Orders{session?.orders?.length > 0 ? ` (${session.orders.length})` : ''}
        </button>
      </div>

      {/* Main view */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {currentView === 'menu' ? (
          <CustomerDashboard
            menuData={menuData}
            customer={customer}
            restaurantId={restaurantId}
            tableId={tableId}
          />
        ) : (
          <CustomerOrders
            restaurantId={restaurantId}
            tableId={tableId}
            customer={customer}
            session={session}
            onSessionUpdate={setSession}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="cm-footer">
        <span>👤 {customer.name}</span>
        <button className="cm-logout-btn" onClick={handleLogout}>Change</button>
      </footer>
    </div>
  );
};

export default CustomerMenu;