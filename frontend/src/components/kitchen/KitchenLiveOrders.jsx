import React from 'react';
import OrderCard from './OrderCard';
import './KitchenDashboard.css';

const KitchenLiveOrders = ({ orders, onRemove }) => {
  return (
    <div className="kitchen-column live-orders">
      <div className="column-header">
        <h2>Live Orders ({orders.length})</h2>
      </div>
      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="empty-state">
            <p>No live orders</p>
          </div>
        ) : (
          orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              type="live"
              onRemove={onRemove}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KitchenLiveOrders;