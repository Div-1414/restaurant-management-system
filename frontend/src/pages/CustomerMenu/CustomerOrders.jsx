// FILE: CustomerOrders.jsx
// All backend API endpoints preserved exactly from original.
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CustomerMenu.css';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

const CustomerOrders = () => {
  const { restaurantId, tableId } = useParams();
  const navigate = useNavigate();

  const [customer,       setCustomer]       = useState(null);
  const [session,        setSession]        = useState(null);
  const [bill,           setBill]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [generatingBill,       setGeneratingBill]       = useState(false);
  const [error,                setError]                = useState(null);
  const [specialInstructions,  setSpecialInstructions]  = useState('');
  const [showInstructions,     setShowInstructions]     = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // ── FIX 5: sessionStorage ──
        const stored = sessionStorage.getItem(`customer_${restaurantId}_${tableId}`);
        if (stored) {
          setCustomer(JSON.parse(stored));
          await fetchSessionData();
        } else {
          navigate(`/login/${restaurantId}/${tableId}`);
        }
      } catch (err) {
        console.error('Init error:', err);
        setError('Failed to initialise. Please scan QR again.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [restaurantId, tableId, navigate]);

  // Poll every 10 s
  useEffect(() => {
    if (!customer) return;
    const interval = setInterval(fetchSessionData, 10000);
    return () => clearInterval(interval);
  }, [restaurantId, tableId, customer]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);

      let activeSession = null;

      // try active first (original logic preserved)
      try {
        const res = await api.get(
          `/order-sessions/?restaurant=${restaurantId}&table=${tableId}&status=active`
        );
        if (res.data?.length > 0) activeSession = res.data[0];
      } catch { console.log('No active session'); }

      // fallback to bill_generated
      if (!activeSession) {
        try {
          const res = await api.get(
            `/order-sessions/?restaurant=${restaurantId}&table=${tableId}&status=bill_generated`
          );
          if (res.data?.length > 0) activeSession = res.data[0];
        } catch { console.log('No bill_generated session'); }
      }

      if (activeSession) {
        setSession(activeSession);
        if (activeSession.bill) setBill(activeSession.bill);
      } else {
        setSession(null);
        setBill(null);
      }
    } catch (err) {
      console.error('Fetch session error:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBill = async () => {
    if (!session) return;
    setGeneratingBill(true);
    try {
      const response = await api.post('/customer/generate-bill/', {
        session_id: session.id,
        tax_rate: 0,
      });
      setBill(response.data);
      await fetchSessionData();
    } catch (err) {
      console.error('Bill error:', err);
      alert(err.response?.data?.error || 'Failed to generate bill');
    } finally {
      setGeneratingBill(false);
    }
  };

  const statusLabel = (s) => ({
    pending:   'Pending',
    preparing: 'Preparing',
    ready:     'Ready',
    completed: 'Completed',
  }[s] || s);

  const subtotal = session?.orders?.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0) || 0;

  /* ── states ── */
  if (loading) return (
    <div className="cm-loading">
      <div className="cm-spinner" />
      <p>Loading your orders…</p>
    </div>
  );

  if (error) return (
    <div className="cm-error-screen">
      <h2>⚠️ Error</h2><p>{error}</p>
      <button className="cm-retry-btn" onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );

  if (!customer) return (
    <div className="cm-error-screen">
      <h2>Session Expired</h2><p>Please scan the QR code again</p>
    </div>
  );

  const isEmpty = !session || !session.orders || session.orders.length === 0;

  return (
    <div className="cm-orders-body">

      {isEmpty ? (
        <div className="cm-orders-empty">
          <div className="cm-orders-empty-icon">🍽️</div>
          <h3>No Orders Yet</h3>
          <p>Your orders will appear here once placed.</p>
          <button
            className="cm-order-browse-btn"
            onClick={() => navigate(`/menu/${restaurantId}/${tableId}`)}
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <>
          {/* Orders list */}
          {session.orders.map(order => (
            <div className="cm-order-card" key={order.id}>
              <div className="cm-order-head">
                <span className="cm-order-num">Order #{String(order.id).slice(-4)}</span>
                <span className={`cm-status-pill ${order.status}`}>
                  {statusLabel(order.status)}
                </span>
              </div>

              {order.special_instructions && (
                <div style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--surface-muted)' }}>
                  Note: {order.special_instructions}
                </div>
              )}

              <div className="cm-order-items-list">
                {order.items?.map((item, idx) => (
                  <div className="cm-order-item-row" key={idx}>
                    <span className="cm-order-item-name">
                      {item.quantity}× {item.menu_item?.name || item.menu_item_name}
                      {item.is_half ? ' (½)' : ''}
                    </span>
                    <span className="cm-order-item-price">₹{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="cm-order-subtotal">
                <span>Order Total:</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          ))}

          {/* Bill section */}
          <div className="cm-bill-section">
            {!bill ? (
              <div className="cm-bill-prompt">
                <h3>Ready to Pay?</h3>
                <p>Generate your bill and show it to the cashier</p>
                <button
                  className="cm-gen-bill-btn"
                  onClick={handleGenerateBill}
                  disabled={generatingBill}
                >
                  {generatingBill ? 'Generating…' : 'Generate Bill'}
                </button>
              </div>
            ) : (
              <div className="cm-bill-card">
                <div className="cm-bill-head">
                  <h3>🧾 Bill Summary</h3>
                  <span className={`cm-bill-status${bill.payment_status === 'paid' ? ' paid' : ''}`}>
                    {bill.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                  </span>
                </div>

                <div className="cm-bill-rows">
                  <div className="cm-bill-row">
                    <span>Subtotal</span><span>₹{bill.subtotal}</span>
                  </div>
                  <div className="cm-bill-row total">
                    <span>Total Amount</span><span>₹{bill.total}</span>
                  </div>
                </div>

                {bill.payment_status !== 'paid' ? (
                  <div className="cm-pay-pending">
                    <p>Please show this screen to the cashier to complete payment</p>
                    <div className="cm-pay-modes">
                      <span title="Cash">💵</span>
                      <span title="UPI">📱</span>
                      <span title="Card">💳</span>
                    </div>
                  </div>
                ) : (
                  <div className="cm-paid-section">
                    <p>Thank you for dining with us! 🎉</p>
                    {bill.payment_mode && (
                      <p style={{ marginTop: 4, fontSize: 13, opacity: .8 }}>
                        Paid via {bill.payment_mode.toUpperCase()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerOrders;