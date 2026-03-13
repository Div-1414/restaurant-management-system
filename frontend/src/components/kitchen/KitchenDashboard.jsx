import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import KitchenFirstOrders from './KitchenFirstOrders';
import KitchenLiveOrders from './KitchenLiveOrders';
import KitchenParcelOrders from './KitchenParcelOrders';
import KitchenOrderPopup from './KitchenOrderPopup';
import useKitchenWebSocket from './useKitchenWebSocket';
import './KitchenDashboard.css';

const KitchenDashboard = () => {
  const [firstOrders, setFirstOrders] = useState([]);
  const [liveOrders, setLiveOrders] = useState([]);
  const [parcelOrders, setParcelOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupOrder, setPopupOrder] = useState(null);
  const [removedOrders, setRemovedOrders] = useState(new Set());
  const [restaurantName, setRestaurantName] = useState('');
  const [isOpen, setIsOpen] = useState(true); // ✅ NEW

  const restaurantId = JSON.parse(localStorage.getItem('user'))?.restaurant;

  /* ================= FETCH INITIAL ORDERS ================= */
  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get('/kitchen/orders/');

      if (response.data.restaurant_name) {
        setRestaurantName(response.data.restaurant_name);
        localStorage.setItem('restaurant_name', response.data.restaurant_name);
      }

      // ✅ NEW
      if (response.data.is_open !== undefined) {
        setIsOpen(response.data.is_open);
      }

      const filterRemoved = (orders, type) =>
        orders.filter((o) => !removedOrders.has(`${o.id}-${type}`));

      setFirstOrders(filterRemoved(response.data.first_orders || [], 'first'));
      setLiveOrders(filterRemoved(response.data.live_orders || [], 'live'));
      setParcelOrders(filterRemoved(response.data.parcel_orders || [], 'parcel'));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
      setLoading(false);
    }
  }, [removedOrders]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  /* ================= WEBSOCKET HANDLER ================= */
  const handleWebSocketMessage = useCallback((data) => {

    // ✅ NEW: restaurant closed broadcast
    if (data.restaurant_closed === true) {
      setIsOpen(false);
      setFirstOrders([]);
      setLiveOrders([]);
      setParcelOrders([]);
      return;
    }

    if (data.type !== 'kitchen_order_update') return;

    const newOrder = data.order;
    if (!newOrder) return;

    let orderType = newOrder.type;
    if (!orderType && newOrder.is_first_order !== undefined) {
      orderType = newOrder.is_first_order ? 'first' : 'live';
    }
    if (!orderType && newOrder.type === 'parcel') orderType = 'parcel';
    if (!orderType) orderType = 'live';

    const orderWithType = { ...newOrder, type: orderType };

    setPopupOrder(orderWithType);

    if (orderType === 'first') {
      setFirstOrders((prev) => {
        if (prev.some(o => o.id === orderWithType.id)) return prev;
        return [orderWithType, ...prev];
      });
    } else if (orderType === 'live') {
      setLiveOrders((prev) => {
        if (prev.some(o => o.id === orderWithType.id)) return prev;
        return [orderWithType, ...prev];
      });
    } else if (orderType === 'parcel') {
      setParcelOrders((prev) => {
        if (prev.some(o => o.id === orderWithType.id)) return prev;
        return [orderWithType, ...prev];
      });
    }

    setTimeout(() => {
      api.get('/kitchen/orders/')
        .then((response) => {
          if (response.data.restaurant_name) setRestaurantName(response.data.restaurant_name);
          if (response.data.is_open !== undefined) setIsOpen(response.data.is_open);
          setFirstOrders(response.data.first_orders || []);
          setLiveOrders(response.data.live_orders || []);
          setParcelOrders(response.data.parcel_orders || []);
        })
        .catch((error) => console.error('WebSocket refresh error:', error));
    }, 2000);

  }, []);

  const { isConnected } = useKitchenWebSocket(restaurantId, handleWebSocketMessage);

  /* ================= REMOVE ORDER ================= */
  const handleRemove = (orderId, type) => {
    const key = `${orderId}-${type}`;
    setRemovedOrders((prev) => new Set([...prev, key]));
    if (type === 'first') setFirstOrders((prev) => prev.filter((o) => o.id !== orderId));
    else if (type === 'live') setLiveOrders((prev) => prev.filter((o) => o.id !== orderId));
    else if (type === 'parcel') setParcelOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  if (loading) {
    return <div className="kitchen-loading">Loading Kitchen Dashboard...</div>;
  }

  return (
    <div className="kitchen-dashboard">

      {/* HEADER */}
      <div className="kitchen-header">
        <div className="restaurant-name">
          {restaurantName ? `${restaurantName} - Kitchen Dashboard` : 'Kitchen Dashboard'}
        </div>
        <div className="header-right">
          <div className="connection-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            <span className="status-text">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* ✅ RESTAURANT CLOSED — styled to match kitchen UI */}
      {!isOpen ? (
        <div className="kitchen-closed-wrapper">
          <div className="kitchen-closed-box">
            <div className="kitchen-closed-icon">🔒</div>
            <h2 className="kitchen-closed-title">Restaurant is Closed</h2>
            <p className="kitchen-closed-msg">
              The owner has closed the restaurant for today.<br />
              No new orders will be accepted until reopened.
            </p>
            <div className="kitchen-closed-badge">Day Ended</div>
          </div>
        </div>
      ) : (
        <>
          {/* ORDERS */}
          <div className="kitchen-columns">
            <KitchenFirstOrders orders={firstOrders} onRemove={handleRemove} />
            <KitchenLiveOrders orders={liveOrders} onRemove={handleRemove} />
            <KitchenParcelOrders orders={parcelOrders} onRemove={handleRemove} />
          </div>

          {/* EMPTY STATE */}
          {firstOrders.length === 0 && liveOrders.length === 0 && parcelOrders.length === 0 && (
            <div className="kitchen-empty-state">
              <div className="kitchen-empty-icon">🍽️</div>
              <p className="kitchen-empty-title">No active orders right now</p>
              <p className="kitchen-empty-sub">New orders will appear here automatically</p>
            </div>
          )}
        </>
      )}

      {popupOrder && (
        <KitchenOrderPopup order={popupOrder} onClose={() => setPopupOrder(null)} />
      )}
    </div>
  );
};

export default KitchenDashboard;