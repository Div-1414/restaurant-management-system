import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import './KitchenDashboard.css';

// Generate notification sound using Web Audio API (no external file needed)
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1046.5, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();
    
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);
    
    oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime);
    gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode2.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    oscillator2.start(audioContext.currentTime);
    oscillator2.stop(audioContext.currentTime + 0.4);
    
  } catch (error) {
    console.log('Audio notification error:', error);
  }
};

const formatPrice = (price) => {
  const num = parseFloat(price);
  return isNaN(num) ? price : num.toFixed(2);
};

const OrderCard = ({ order, type, onRemove }) => {
  const [localItems, setLocalItems] = useState(
    order.items.map(item => ({
      ...item,
      completed: item.completed || false
    }))
  );

  const [minutesElapsed, setMinutesElapsed] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const prevOrderRef = useRef(null);

  // Sound alert when new order arrives
  useEffect(() => {
    if (prevOrderRef.current !== order.id) {
      playNotificationSound();
      prevOrderRef.current = order.id;
    }
  }, [order.id]);

  /* ================= TIMER ================= */
  useEffect(() => {
    const updateTimer = () => {
      const created = new Date(order.created_at);
      const now = new Date();
      const diff = Math.floor((now - created) / 60000);
      setMinutesElapsed(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [order.created_at]);

  /* ================= ITEM TOGGLE ================= */
  const handleItemToggle = (itemId) => {
    const updated = localItems.map(item =>
      item.id === itemId
        ? { ...item, completed: !item.completed }
        : item
    );
    setLocalItems(updated);
  };

  /* ================= COMPLETE ORDER ================= */
  // ✅ KEY CHANGE: parcel orders call complete-kitchen, table orders call existing status endpoint
  const handleCompleteOrder = async () => {
    setLoadingComplete(true);
    try {
      if (type === 'parcel') {
        // Parcel: marks kitchen_completed=True, stops timer, keeps order visible to owner
        await api.patch(`/parcel-orders/${order.id}/complete-kitchen/`);
      } else {
        // Table order: unchanged existing flow
        await api.patch(
          `/kitchen/orders/${order.id}/status/`,
          { status: 'completed' }
        );
      }
      onRemove(order.id, type);
    } catch (error) {
      console.error('Error completing order:', error.response || error);
      setLoadingComplete(false);
    }
  };

  const allItemsCompleted =
    localItems.length > 0 &&
    localItems.every(item => item.completed);

  const getTimerStatus = () => {
    if (minutesElapsed >= 30) return 'urgent';
    if (minutesElapsed >= 15) return 'warning';
    return 'normal';
  };

  const getTimerLabel = () => {
    const status = getTimerStatus();
    if (status === 'urgent') return 'Urgent';
    if (status === 'warning') return 'Warning';
    return 'Normal';
  };

  const formatTime = () => {
    const hours = Math.floor(minutesElapsed / 60);
    const mins = minutesElapsed % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}`;
  };

  const getHeaderDisplay = () => {
    if (type === 'parcel') {
      return {
        main: order.customer_name || 'Guest',
        sub: `Phone: ${order.customer_phone || 'N/A'}`
      };
    } else {
      const customerName = order.customer_name || 'Guest';
      const tableNum = order.table_number || 'N/A';
      const hallName = order.hall_name || 'General';
      return {
        main: `${customerName} – Table ${tableNum}`,
        sub: `Hall: ${hallName}`
      };
    }
  };

  const headerDisplay = getHeaderDisplay();

  const renderAddOns = (item) => {
    const selectedOptions = item.selected_options || item.options || item.add_ons || item.addons;
    if (!selectedOptions || selectedOptions.length === 0) return null;

    return (
      <div className="item-addons">
        {selectedOptions.map((option, index) => (
          <span key={index} className="addon-tag">
            • {typeof option === 'string' ? option : (option.name || option.label || JSON.stringify(option))}
          </span>
        ))}
      </div>
    );
  };

  // ✅ Label for the complete button differs by type
  const completeButtonLabel = type === 'parcel'
    ? (loadingComplete ? 'Processing...' : 'Kitchen Done ✓')
    : (loadingComplete ? 'Processing...' : 'Complete Order');

  return (
    <>
      <div className="order-card">
        {/* HEADER */}
        <div className="card-header">
          <div className="order-info">
            <h3>{headerDisplay.main}</h3>
            <p className="customer-name">{headerDisplay.sub}</p>
          </div>
          <div className="order-badges">
            {order.is_vip && <span className="gold-badge">Gold</span>}
            <div className={`timer-badge ${getTimerStatus()}`}>
              <div className="timer-label">{getTimerLabel()}</div>
              <div>{formatTime()}</div>
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        {order.special_instructions && (
          <div className="order-special-instructions">
            <div className="special-instructions-header">
              <span className="warning-icon">⚠️</span>
              <span className="special-instructions-title">Special Instructions</span>
            </div>
            <p className="special-instructions-text">{order.special_instructions}</p>
          </div>
        )}

        {/* ITEMS TABLE HEADER */}
        <div className="items-header">
          <span>Items</span>
          <span>Qty</span>
        </div>

        {/* ITEMS LIST */}
        <div className="items-list">
          {localItems.map(item => (
            <div key={item.id} className="item-row">
              <div className="item-checkbox">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleItemToggle(item.id)}
                  id={`item-${item.id}`}
                />
                <div className="item-details-wrapper">
                  <label
                    htmlFor={`item-${item.id}`}
                    className={`item-name ${item.completed ? 'checked' : ''}`}
                  >
                    {item.name}
                  </label>
                  {renderAddOns(item)}
                  {item.special_instructions && (
                    <div className="item-special-instructions">
                      <span className="instruction-label">Note:</span> {item.special_instructions}
                    </div>
                  )}
                </div>
              </div>
              <span className="qty">{item.display_quantity || item.quantity}</span>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="card-footer">
          <span className="total">Total: ₹{formatPrice(order.total)}</span>
          <button
            className="btn-complete"
            onClick={() => setShowConfirm(true)}
            disabled={!allItemsCompleted || loadingComplete}
          >
            {completeButtonLabel}
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <h3>
              {type === 'parcel' ? 'Mark Kitchen Done?' : 'Complete Order?'}
            </h3>
            <p>
              {type === 'parcel'
                ? <>Mark parcel for <strong>{headerDisplay.main}</strong> as prepared? It will be removed from the kitchen screen.</>
                : <>Are you sure you want to mark order for <strong>{headerDisplay.main}</strong> as complete?</>
              }
            </p>
            <div className="confirm-actions">
              <button onClick={() => setShowConfirm(false)}>Cancel</button>
              <button onClick={handleCompleteOrder}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderCard;