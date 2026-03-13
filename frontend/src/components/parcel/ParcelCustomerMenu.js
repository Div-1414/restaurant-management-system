import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'sonner';
import './ParcelMenu.css';

const ParcelCustomerMenu = () => {
  const { restaurantId } = useParams();

  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ NEW: track restaurant open/closed status
  const [restaurantClosed, setRestaurantClosed] = useState(false);
  const [restaurantName, setRestaurantName] = useState('Our Restaurant');

  // CUSTOMER DETAILS
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // CART / SUMMARY
  const [showSummary, setShowSummary] = useState(false);

  /* ================= LOAD MENU ================= */

  useEffect(() => {
    loadMenu();
  }, [restaurantId]);

  const loadMenu = async () => {
    try {
      const res = await api.get(`/parcel/menu/${restaurantId}/`);
      setMenu(res.data);

      // Grab restaurant name from first category
      if (res.data.length > 0) {
        setRestaurantName(res.data[0]?.restaurant_name || 'Our Restaurant');
      }
    } catch (err) {
      // ✅ If backend returns 403/400 with is_open=false, show closed screen
      const data = err?.response?.data;
      if (data?.is_open === false || data?.detail?.toLowerCase?.().includes('closed')) {
        setRestaurantClosed(true);
      } else {
        toast.error('Restaurant is not available');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= CART HELPERS ================= */

  const updateCart = (itemId, updates) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], ...updates },
    }));
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
  };

  const addItem = (item) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: {
        id: item.id,
        quantity: item.allow_half ? 0.5 : 1,
        options: [],
      },
    }));
  };

  const cartItems = Object.values(cart);

  /* ================= PRICE CALC ================= */

  const calculateItemTotal = (item, cartItem) => {
    const fullPrice = Number(item.price || 0);
    const halfPrice = Number(item.half_price || 0);
    const qty = cartItem.quantity;

    const fullCount = Math.floor(qty);
    const hasHalf = qty % 1 !== 0;

    let total = fullCount * fullPrice;
    if (hasHalf) total += halfPrice;

    const optionsTotal = (cartItem.options || []).reduce((sum, optId) => {
      const opt = item.options.find((o) => o.id === optId);
      return sum + (opt ? Number(opt.extra_price) : 0);
    }, 0);

    return total + optionsTotal * qty;
  };

  const cartTotal = cartItems.reduce((sum, ci) => {
    const item = menu.flatMap((c) => c.items).find((i) => i.id === ci.id);
    return item ? sum + calculateItemTotal(item, ci) : sum;
  }, 0);

  /* ================= PHONE VALIDATION ================= */

  // ✅ Only allow digits, max 10
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); // strip non-digits
    if (val.length <= 10) {
      setCustomerPhone(val);
    }
  };

  const isPhoneValid = customerPhone.trim().length === 10;

  /* ================= CONFIRM ORDER ================= */

  const canConfirm =
    customerName.trim() &&
    isPhoneValid &&
    cartItems.length > 0;

  const confirmOrder = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    // ✅ Validate phone before submitting
    if (!isPhoneValid) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      await api.post(`/parcel/create/${restaurantId}/`, {
        customer_name: customerName,
        customer_phone: customerPhone,
        items: cartItems.map((i) => ({
          menu_item: i.id,
          quantity: i.quantity,
          is_half: i.is_half,
          options: i.options,
        })),
      });

      toast.success('✅ Order placed successfully');
      setCart({});
      setShowSummary(false);
      setCustomerName('');
      setCustomerPhone('');
    } catch {
      toast.error('Failed to place order');
    }
  };

  /* ================= LOADING ================= */

  if (loading) return (
    <div className="pm-root">
      <div className="pm-loading">
        <div className="pm-loading-spinner" />
        <p className="pm-loading-text">Loading menu…</p>
      </div>
    </div>
  );

  /* ================= RESTAURANT CLOSED SCREEN ================= */

  if (restaurantClosed) return (
    <div className="pm-root">
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1a0e 100%)',
      }}>
        {/* Closed icon */}
        <div style={{
          width: 90, height: 90, borderRadius: '50%',
          background: 'rgba(239,68,68,0.15)',
          border: '3px solid rgba(239,68,68,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', marginBottom: 24,
        }}>
          🔒
        </div>

        <h1 style={{
          color: '#fff', fontSize: '1.8rem', fontWeight: 800,
          margin: '0 0 12px', letterSpacing: '-0.02em',
        }}>
          {restaurantName}
        </h1>

        <div style={{
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: 12, padding: '14px 28px',
          marginBottom: 20,
        }}>
          <p style={{
            color: '#f87171', fontWeight: 700,
            fontSize: '1.1rem', margin: 0,
          }}>
            Restaurant is Currently Closed
          </p>
        </div>

        <p style={{
          color: '#9ca3af', fontSize: '0.95rem',
          maxWidth: 300, lineHeight: 1.6, margin: 0,
        }}>
          We're not accepting orders right now. Please come back later or contact the restaurant directly.
        </p>

        {/* Decorative dots */}
        <div style={{ marginTop: 40, display: 'flex', gap: 8 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i === 1 ? '#f97316' : 'rgba(249,115,22,0.3)',
            }} />
          ))}
        </div>
      </div>
    </div>
  );

  /* ================= MAIN MENU ================= */

  return (
    <div className="pm-root">
      {/* HERO HEADER */}
      <div className="pm-hero">
        <div className="pm-hero-tag">
          <span className="pm-hero-tag-dot" />
          Parcel Order
        </div>
        <h1 className="pm-restaurant-name">{restaurantName}</h1>
        <p className="pm-welcome-msg">Welcome! Browse our menu and place your order below.</p>
        <div className="pm-hero-divider" />
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 120px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* MENU */}
        {!showSummary &&
          menu.map((category) => (
            <div key={category.id} className="pm-category" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              <div className="pm-category-header">
                <span className="pm-category-label">{category.name}</span>
                <div className="pm-category-line" />
                <span className="pm-category-count">{category.items.length}</span>
              </div>

              {category.items.map((item) => {
                const cartItem = cart[item.id];

                return (
                  <div key={item.id} className={`pm-item-card${cartItem ? ' in-cart' : ''}`}>
                    <div className="pm-item-top">
                      <div className="pm-item-info">
                        <div className="pm-item-name">{item.name}</div>
                        <div className="pm-item-price">
                          {item.allow_half ? (
                            <>Full <strong>₹{item.price}</strong> · Half <strong>₹{item.half_price}</strong></>
                          ) : (
                            <><strong>₹{item.price}</strong></>
                          )}
                        </div>
                      </div>

                      {!cartItem ? (
                        <button className="pm-btn-add" onClick={() => addItem(item)}>
                          + Add
                        </button>
                      ) : (
                        <button className="pm-btn-remove" onClick={() => removeFromCart(item.id)}>
                          Remove
                        </button>
                      )}
                    </div>

                    {cartItem && (
                      <div className="pm-cart-controls">
                        <div className="pm-qty-row">
                          <span className="pm-qty-label">Qty:</span>
                          <select
                            className="pm-qty-select"
                            value={cartItem.quantity}
                            onChange={(e) => updateCart(item.id, { quantity: Number(e.target.value) })}
                          >
                            {(item.allow_half
                              ? Array.from({ length: 40 }, (_, i) => (i + 1) * 0.5)
                              : Array.from({ length: 20 }, (_, i) => i + 1)
                            ).map((q) => (
                              <option key={q} value={q}>{q}</option>
                            ))}
                          </select>
                        </div>

                        {item.options.map((opt) => (
                          <label key={opt.id} className="pm-option-label">
                            <input
                              type="checkbox"
                              checked={cartItem.options.includes(opt.id)}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...cartItem.options, opt.id]
                                  : cartItem.options.filter((id) => id !== opt.id);
                                updateCart(item.id, { options: next });
                              }}
                            />
                            {opt.name}
                            <span className="pm-option-extra">+₹{opt.extra_price}</span>
                          </label>
                        ))}

                        <div className="pm-item-total">
                          ₹{calculateItemTotal(item, cartItem).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

        {/* ORDER SUMMARY */}
        {showSummary && (
          <div className="pm-summary">
            <div className="pm-section-title">
              <svg className="pm-section-title-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Order Summary
            </div>

            {cartItems.map((ci) => {
              const item = menu.flatMap((c) => c.items).find((i) => i.id === ci.id);
              if (!item) return null;
              return (
                <div key={ci.id} className="pm-summary-item">
                  <span className="pm-summary-item-name">{item.name} × {ci.quantity}</span>
                  <span className="pm-summary-item-price">₹{calculateItemTotal(item, ci).toFixed(2)}</span>
                </div>
              );
            })}

            <div className="pm-summary-total-row">
              <span className="pm-summary-total-label">Grand Total</span>
              <span className="pm-summary-total-amount">₹{cartTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* CUSTOMER DETAILS */}
        <div className="pm-details-section">
          <div className="pm-section-title">
            <svg className="pm-section-title-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Your Details
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name *"
              className="pm-input"
            />

            {/* ✅ Phone input with validation indicator */}
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                value={customerPhone}
                onChange={handlePhoneChange}
                placeholder="10-digit phone number *"
                className="pm-input"
                maxLength={10}
                style={{
                  borderColor: customerPhone.length > 0
                    ? isPhoneValid ? '#16a34a' : '#ef4444'
                    : undefined,
                  paddingRight: 40,
                }}
              />
              {/* Live digit counter */}
              <span style={{
                position: 'absolute', right: 12, top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.75rem', fontWeight: 600,
                color: isPhoneValid ? '#16a34a' : customerPhone.length > 0 ? '#ef4444' : '#9ca3af',
                pointerEvents: 'none',
              }}>
                {customerPhone.length}/10
              </span>
            </div>

            {/* ✅ Inline validation message */}
            {customerPhone.length > 0 && !isPhoneValid && (
              <p style={{
                margin: '-6px 0 0', fontSize: '0.8rem',
                color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                ⚠ Please enter a valid 10-digit phone number
              </p>
            )}
          </div>
        </div>

        {cartItems.length === 0 && !showSummary && (
          <p className="pm-empty-hint">Add items from the menu above to get started 🍽️</p>
        )}

      </div>

      {/* BOTTOM BAR */}
      <div className="pm-bottom-bar">
        {!showSummary ? (
          <button
            disabled={cartItems.length === 0}
            onClick={() => setShowSummary(true)}
            className="pm-btn-cart"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            View Cart
            {cartItems.length > 0 && (
              <span className="pm-btn-cart-badge">{cartItems.length}</span>
            )}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="pm-btn-back" onClick={() => setShowSummary(false)}>
              ← Edit Order
            </button>
            <button
              disabled={!canConfirm}
              onClick={confirmOrder}
              className="pm-btn-confirm"
            >
              Confirm Order ✓
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParcelCustomerMenu;