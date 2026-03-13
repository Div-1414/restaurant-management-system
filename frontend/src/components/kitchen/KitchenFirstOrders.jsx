import React from 'react';
import OrderCard from './OrderCard';
import './KitchenDashboard.css';

const KitchenFirstOrders = ({ orders, onItemComplete, onRemove }) => {
  return (
    <div className="kitchen-column first-orders">
      <div className="column-header">
        <h2>First Orders ({orders.length})</h2>
      </div>
      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="empty-state">
            <p>No first orders</p>
          </div>
        ) : (
          orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              type="first"
              onItemComplete={onItemComplete}
              onRemove={onRemove}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KitchenFirstOrders;