// FILE: CustomerDashboard.jsx
// Handles menu display, cart, and order placement.
// All backend API calls preserved exactly.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CustomerMenu.css';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

/* ── helpers ──────────────────────────────────────── */
const fmt = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? '0.00' : n.toFixed(2);
};

// Display qty: 0.5→½, 1.5→1½, 2→2
const fmtQty = (q) => {
  const w = Math.floor(q);
  const h = q % 1 !== 0;
  if (w === 0 && h) return '½';
  if (h) return `${w}½`;
  return `${w}`;
};

// Subtle cart-add sound (tiny silent wav — replace URL with your own asset)
const playCartSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.18);
  } catch {}
};

/* ── Toast hook ───────────────────────────────────── */
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, show };
};

/* ═══════════════════════════════════════════════════
   MENU ITEM CARD
   ═══════════════════════════════════════════════════ */
const MenuItemCard = ({ item, cartItems, onAddToCart, onRemoveFromCart, isRestaurantOpen }) => {
  const [expanded,      setExpanded]      = useState(false);
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [qty,           setQty]           = useState(null); // initialised below

  // ── FIX 2: half-plate step logic ──────────────────
  const allowHalf = Boolean(item.allow_half || item.allow_half_plate);
  const STEP      = allowHalf ? 0.5 : 1;
  const MIN_QTY   = allowHalf ? 0.5 : 1;

  // lazy-init qty
  const initQty = allowHalf ? 0.5 : 1;
  const currentQty = qty === null ? initQty : qty;

  // ── FIX 1: NaN-safe price calc ────────────────────
  const basePrice  = parseFloat(item.price) || 0;
  // Support both `extra_price` (existing backend) and `price` on addon object
  const addonPrice = selectedAddon
    ? (parseFloat(selectedAddon.extra_price) || parseFloat(selectedAddon.price) || 0)
    : 0;
  const unitPrice  = basePrice + addonPrice;
  const totalPrice = parseFloat((unitPrice * currentQty).toFixed(2));

  // find all cart lines for this item
  const cartLines   = cartItems.filter(c => c.menu_item_id === item.id);
  const inCartQty   = cartLines.reduce((s, i) => s + i.quantity, 0);
  const inCartTotal = cartLines.reduce((s, i) => s + i.total_price, 0);

  const options = Array.isArray(item.options) ? item.options : [];

  const handleAdd = () => {
    // Backend Decimal * float crashes → always send integer quantity.
    // Half plate communicated via is_half flag.
    const isHalf     = currentQty % 1 !== 0;
    const intQty     = Math.max(1, Math.ceil(currentQty));
    const finalTotal = parseFloat((unitPrice * currentQty).toFixed(2));
    onAddToCart({
      menu_item_id:     item.id,
      name:             item.name || 'Item',
      quantity:         intQty,
      is_half:          isHalf,
      selected_options: selectedAddon ? [selectedAddon.id].filter(Boolean) : [],
      addon_label:      selectedAddon ? selectedAddon.name : null,
      unit_price:       unitPrice,
      total_price:      finalTotal,
    });
    playCartSound();
    // reset
    setExpanded(false);
    setQty(null);
    setSelectedAddon(null);
  };

  const decQty = () => setQty(q => Math.max(MIN_QTY, +((q ?? initQty) - STEP).toFixed(1)));
  const incQty = () => setQty(q => +((q ?? initQty) + STEP).toFixed(1));

  const isUnavailable = item.available === false;

  return (
    <div className={`cm-item-card${expanded ? ' expanded' : ''}`}>

      {/* ── collapsed header ── */}
      <div
        className="cm-item-header"
        onClick={() => !isUnavailable && setExpanded(v => !v)}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && !isUnavailable && setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <div className="cm-item-info">
          <div className="cm-item-name">{item.name}</div>
          {!expanded && <div className="cm-item-desc">{item.description}</div>}
          {!expanded && (
            <div className="cm-item-price">Price: ₹{fmt(item.price)}</div>
          )}
        </div>

        {item.image
          ? <img src={item.image} alt={item.name} className="cm-item-image" />
          : <div className="cm-item-placeholder">🍽️</div>
        }

        <span className="cm-item-chevron">▾</span>
      </div>

      {/* in-cart quick row (collapsed, item already added) */}
      {!expanded && inCartQty > 0 && (
        <div className="cm-item-cart-row">
          <div className="cm-qty-sel" onClick={e => e.stopPropagation()}>
            <button className="cm-qty-btn" onClick={() => onRemoveFromCart(item.id)}>−</button>
            <span className="cm-qty-val">{fmtQty(inCartQty)}</span>
            <button className="cm-qty-btn" onClick={() => setExpanded(true)}>+</button>
          </div>
          <span className="cm-item-cart-total">₹{fmt(inCartTotal)}</span>
        </div>
      )}

      {/* ── expanded panel ── */}
      {expanded && (
        <div className="cm-item-expanded">
          <div className="cm-exp-grid">

            {/* left: name + desc + base price */}
            <div>
              <div className="cm-col-title">{item.name}</div>
              <div className="cm-col-desc">{item.description}</div>
              <div className="cm-item-price" style={{ marginTop: 8 }}>
                Price: ₹{fmt(item.price)}
              </div>
            </div>

            {/* right: plate label + dynamic price + qty */}
            <div>
              <div className="cm-col-title">
                {allowHalf ? 'Half / Full Plate' : 'Full Plate'}
              </div>
              <div className="cm-dynamic-label">Dynamic price ·</div>
              <div className="cm-dynamic-price">₹{fmt(totalPrice)}</div>

              {/* ── FIX 2: half-step qty ── */}
              <div className="cm-qty-row">
                <div className="cm-qty-label">Quantity</div>
                <div className="cm-qty-sel">
                  <button className="cm-qty-btn" onClick={decQty} disabled={currentQty <= MIN_QTY}>−</button>
                  <span className="cm-qty-val">{fmtQty(currentQty)}</span>
                  <button className="cm-qty-btn" onClick={incQty}>+</button>
                </div>
              </div>
            </div>
          </div>

          {/* ── FIX 1: add-ons with NaN-safe price ── */}
          {options.length > 0 && (
            <div className="cm-extras">
              <div className="cm-extras-title">Extras</div>
              {options.map(opt => {
                const optPrice = parseFloat(opt.extra_price) || parseFloat(opt.price) || 0;
                const isSel = selectedAddon?.id === opt.id;
                return (
                  <div
                    key={opt.id}
                    className="cm-extra-opt"
                    onClick={() => setSelectedAddon(isSel ? null : opt)}
                    role="radio" aria-checked={isSel} tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setSelectedAddon(isSel ? null : opt)}
                  >
                    <div className={`cm-extra-radio${isSel ? ' sel' : ''}`} />
                    <span className="cm-extra-name">{opt.name}</span>
                    <span className="cm-extra-price">
                      {optPrice === 0 ? '₹0.00' : `+₹${fmt(optPrice)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="cm-add-row">
            <button className="cm-btn-customize" onClick={() => setExpanded(false)}>
              Cancel
            </button>
            <button
              className="cm-btn-add"
              onClick={handleAdd}
              disabled={isUnavailable}
            >
              {isUnavailable ? 'Unavailable' : `ADD TO ORDER  ₹${fmt(totalPrice)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   CART PANEL
   ═══════════════════════════════════════════════════ */
const CartPanel = ({ cartItems, onClose, onRemove, onChangeQty, onPlaceOrder, isSubmitting, specialInstructions, onSpecialInstructionsChange }) => {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 280);
  };

  // cartItems is a flat array - use directly
  const subtotal = cartItems.reduce((s, i) => s + i.total_price, 0);
  const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <div className={`cm-cart-overlay${closing ? ' closing' : ''}`} onClick={handleClose} />
      <div className={`cm-cart-panel${closing ? ' closing' : ''}`}>

        <div className="cm-cart-head">
          <span className="cm-cart-title">Your Cart ({totalQty} items)</span>
          <button className="cm-cart-close" onClick={handleClose} aria-label="Close cart">✕</button>
        </div>

        <div className="cm-cart-items">
          {cartItems.length === 0 ? (
            <div className="cm-cart-empty">
              <div className="cm-cart-empty-icon">🛒</div>
              <div className="cm-cart-empty-txt">Your cart is empty</div>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div className="cm-cart-item" key={idx}>
                <span className="cm-ci-prefix">{fmtQty(item.quantity)} x</span>
                <div className="cm-ci-info">
                  <div className="cm-ci-name">{item.name}{item.is_half ? ' (½)' : ''}</div>
                  {item.addon_label && (
                    <div className="cm-ci-unit">+ {item.addon_label}</div>
                  )}
                  <div className="cm-ci-unit">@ ₹{fmt(item.unit_price)}</div>
                </div>
                <span className="cm-ci-line-total">(₹{fmt(item.total_price)})</span>
                <div className="cm-ci-controls">
                  <button className="cm-ci-qty-btn" onClick={() => onChangeQty(idx, -0.5)}>−</button>
                  <span className="cm-ci-qty-val">{fmtQty(item.quantity)}</span>
                  <button className="cm-ci-qty-btn" onClick={() => onChangeQty(idx, +0.5)}>+</button>
                  <button className="cm-ci-remove" onClick={() => onRemove(idx)}>REMOVE</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cm-cart-foot">
          <div className="cm-total-row grand"><span>ORDER TOTAL:</span><span>₹{fmt(subtotal)}</span></div>

          {/* Special instructions */}
          <div style={{marginBottom:12}}>
            <label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text-sec)',marginBottom:5}}>
              Special Instructions (optional)
            </label>
            <textarea
              value={specialInstructions}
              onChange={e => onSpecialInstructionsChange(e.target.value)}
              placeholder="e.g. No onions, extra spicy, allergies…"
              rows={2}
              style={{
                width:'100%',padding:'8px 10px',
                border:'1.5px solid #e0d8d0',borderRadius:'var(--r-md)',
                fontFamily:'var(--fb)',fontSize:13,color:'var(--text-pri)',
                background:'var(--surface-card)',outline:'none',resize:'none',
                transition:'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor='var(--plum)'}
              onBlur={e  => e.target.style.borderColor='#e0d8d0'}
            />
          </div>

          <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:10,textAlign:'center'}}>
            You can place multiple orders. Generate bill when done.
          </p>
          <button
            className="cm-checkout-btn"
            onClick={onPlaceOrder}
            disabled={isSubmitting || cartItems.length === 0}
          >
            {isSubmitting ? 'Placing Order…' : 'PLACE ORDER'}
          </button>
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════
   CUSTOMER DASHBOARD (main export)
   ═══════════════════════════════════════════════════ */
const CustomerDashboard = () => {
  const { restaurantId, tableId } = useParams();
  const navigate = useNavigate();
  const { toasts, show: showToast } = useToast();

  const [customer,         setCustomer]         = useState(null);
  const [menuData,         setMenuData]          = useState(null);
  const [loading,          setLoading]           = useState(true);
  const [error,            setError]             = useState(null);
  const [cart,             setCart]              = useState([]);  // flat: [{menu_item_id, name, quantity, is_half, selected_options, unit_price, total_price, addon_label}]
  const [selectedCategory, setSelectedCategory]  = useState(null);
  const [isSubmitting,     setIsSubmitting]       = useState(false);
  const [showCart,         setShowCart]           = useState(false);
  const [showWelcome,          setShowWelcome]          = useState(false);
  const [specialInstructions,  setSpecialInstructions]  = useState('');

  /* ── init ─────────────────────────────────────── */
  useEffect(() => {
    const init = async () => {
      try {
        // ── FIX 5: read from sessionStorage ──
        const stored = sessionStorage.getItem(`customer_${restaurantId}_${tableId}`);
        if (!stored) {
          navigate(`/login/${restaurantId}/${tableId}`);
          return;
        }
        const parsed = JSON.parse(stored);
        setCustomer(parsed);
        await fetchMenu();

        // show welcome if navigated here fresh from login
        if (window.history.state?.usr?.isNewLogin) {
          setShowWelcome(true);
          setTimeout(() => setShowWelcome(false), 5000);
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

  const fetchMenu = async () => {
    try {
      // preserved original endpoint
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

  /* ── FIX 3: restaurant closed ─────────────────── */
  const isOpen = menuData?.restaurant?.is_open !== false; // default open if field absent

  /* ── cart helpers (flat array) ─────────────────── */
  const addToCart = useCallback((itemData) => {
    // Each call pushes one flat line item — matches original backend payload shape
    setCart(prev => [...prev, itemData]);
    showToast(`${itemData.name} added to cart!`, 'success');
  }, [showToast]);

  const removeFromCart = useCallback((menuItemIdOrIndex) => {
    setCart(prev => {
      // If called with a number index (from CartPanel), remove by index
      if (typeof menuItemIdOrIndex === 'number' && menuItemIdOrIndex < prev.length && prev[menuItemIdOrIndex]?.menu_item_id === undefined) {
        return prev.filter((_, i) => i !== menuItemIdOrIndex);
      }
      // If called with a number that is a valid index, remove by index
      if (typeof menuItemIdOrIndex === 'number') {
        return prev.filter((_, i) => i !== menuItemIdOrIndex);
      }
      // If called with menu_item_id (from quick row), remove the last added line for that item
      const lastIdx = [...prev].map((e, i) => e.menu_item_id === menuItemIdOrIndex ? i : -1).filter(i => i !== -1).pop();
      if (lastIdx === undefined) return prev;
      return prev.filter((_, i) => i !== lastIdx);
    });
  }, []);

  const changeCartQty = useCallback((cartIndex, delta) => {
    setCart(prev => prev.map((item, i) => {
      if (i !== cartIndex) return item;
      const newQty = parseFloat((item.quantity + delta).toFixed(1));
      if (newQty <= 0) return null;
      return {
        ...item,
        quantity:    newQty,
        total_price: parseFloat((item.unit_price * newQty).toFixed(2)),
      };
    }).filter(Boolean));
  }, []);

  /* ── place order ──────────────────────────────── */
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        table_id:       tableId,
        customer_name:  customer.name,
        customer_phone: customer.phone,
        items: cart.map(item => ({
          menu_item_id: item.menu_item_id,
          // Backend Decimal cannot multiply with float — send integer qty.
          // Half plate is communicated via is_half flag, not fractional quantity.
          quantity:     Math.max(1, Math.round(item.quantity)),
          is_half:      item.is_half,
          option_ids:   item.selected_options || [],
        })),
        special_instructions: specialInstructions,
      };
      await api.post('/customer/order/', payload);
      setCart([]);
      setSpecialInstructions('');
      setShowCart(false);
      // ── Stay on menu so customer can keep ordering ──
      showToast('Order placed! You can keep ordering.', 'success');
    } catch (err) {
      console.error('Order error:', err);
      alert(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(`customer_${restaurantId}_${tableId}`);
    navigate(`/login/${restaurantId}/${tableId}`);
  };

  /* ── derived data ─────────────────────────────── */
  const menuArray = useMemo(() => {
    if (!menuData || !Array.isArray(menuData.menu)) return [];
    return menuData.menu;
  }, [menuData]);

  const categories = useMemo(() =>
    menuArray.filter(c => c?.id && c?.name).map(c => ({ id: c.id, name: c.name, image: c.image })),
    [menuArray]
  );

  const allItems = useMemo(() => {
    const items = [];
    menuArray.forEach(cat => {
      if (!Array.isArray(cat?.items)) return;
      cat.items.forEach(item => {
        if (item?.id) items.push({ ...item, category_id: cat.id, category_name: cat.name });
      });
    });
    return items;
  }, [menuArray]);

  const filteredItems = useMemo(() =>
    selectedCategory ? allItems.filter(i => i.category_id === selectedCategory) : allItems,
    [allItems, selectedCategory]
  );

  const cartTotalQty = useMemo(() =>
    cart.reduce((s, i) => s + i.quantity, 0),
    [cart]
  );

  /* ── states ───────────────────────────────────── */
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
      <button className="cm-retry-btn" onClick={fetchMenu}>Reload Menu</button>
    </div>
  );

  const tableNum = menuData.table?.table_number || tableId;

  return (
    <div className="cm-page">

      {/* ── Header ── */}
      <header className="cm-header">
        <div className="cm-header-left">
          <span className="cm-restaurant-name">
            {menuData.restaurant?.name || 'Restaurant'}
          </span>
          <span className="cm-table-badge">Table #{tableNum}</span>
        </div>
        <div className="cm-header-right">
          <button
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', fontSize: 13, cursor: 'pointer' }}
            onClick={() => navigate(`/menu/${restaurantId}/${tableId}/orders`)}
          >
            📋 Orders
          </button>
        </div>
      </header>

      {/* ── Welcome banner ── */}
      {showWelcome && (
        <div className="cm-welcome-banner">
          👋 Welcome, <strong>{customer.name}</strong>! Start ordering your favourite dishes.
        </div>
      )}

      {/* ── Status banner ── */}
      <div className="cm-status-banner">
        {/* ── FIX 3: show closed state ── */}
        <div className="cm-status-open-text">
          {isOpen ? 'WE ARE OPEN' : 'WE ARE CLOSED'}
        </div>
        <div className={`cm-status-row ${isOpen ? 'open' : 'closed'}`}>
          <span className={`cm-status-dot ${isOpen ? 'open' : 'closed'}`} />
          {isOpen ? 'Currently accepting orders' : 'Not accepting orders right now'}
        </div>
        <div className="cm-table-info-pill">📱 Serving Table {tableNum}</div>
        {isOpen && <div className="cm-order-prompt">📱 Order directly from your phone!</div>}
      </div>

      {/* ── FIX 3: Closed banner blocks ordering ── */}
      {!isOpen && (
        <div className="cm-closed-banner">
          <div className="cm-closed-banner-title">Restaurant is currently closed</div>
          <div className="cm-closed-banner-sub">Please check back later</div>
        </div>
      )}

      {/* ── Category strip ── */}
      <div className="cm-cat-strip">
        <button
          className={`cm-cat-chip${!selectedCategory ? ' active' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          <div className="cm-cat-icon">🍽️</div>
          <span className="cm-cat-name">All</span>
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`cm-cat-chip${selectedCategory === cat.id ? ' active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <div className="cm-cat-icon">
              {cat.image ? <img src={cat.image} alt={cat.name} style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} /> : '🍴'}
            </div>
            <span className="cm-cat-name">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* ── Menu body ── */}
      <main className="cm-menu-body">
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            No items in this category
          </div>
        ) : (
          filteredItems.map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              cartItems={cart}
              onAddToCart={isOpen ? addToCart : () => alert('Restaurant is currently closed.')}
              onRemoveFromCart={removeFromCart}
              isRestaurantOpen={isOpen}
            />
          ))
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="cm-footer">
        <span>👤 {customer.name}</span>
        <button className="cm-logout-btn" onClick={handleLogout}>Change</button>
      </footer>

      {/* ── Floating cart button ── */}
      {cartTotalQty > 0 && !showCart && (
        <button className="cm-float-cart" onClick={() => setShowCart(true)} aria-label="Open cart">
          🛒
          <span className="cm-cart-badge">{Math.ceil(cartTotalQty)}</span>
        </button>
      )}

      {/* ── Cart panel ── */}
      {showCart && (
        <CartPanel
          cartItems={cart}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onChangeQty={changeCartQty}
          onPlaceOrder={handlePlaceOrder}
          isSubmitting={isSubmitting}
          specialInstructions={specialInstructions}
          onSpecialInstructionsChange={setSpecialInstructions}
        />
      )}

      {/* ── Toasts ── */}
      {toasts.length > 0 && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
          {toasts.map(t => (
            <div key={t.id} style={{
              background: t.type === 'success' ? 'var(--rust)' : 'var(--plum)',
              color: '#fff', padding: '10px 20px', borderRadius: 'var(--r-pill)',
              fontSize: 14, fontWeight: 500, boxShadow: 'var(--sh-md)',
              animation: 'cardRise .35s var(--spring) both', whiteSpace: 'nowrap',
            }}>
              {t.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;