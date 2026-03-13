import React from 'react';
import OrderCard from './OrderCard';
import './KitchenDashboard.css';

const KitchenParcelOrders = ({ orders, onItemComplete, onRemove }) => {
  return (
    <div className="kitchen-column parcel-orders">
      <div className="column-header">
        <h2>Parcel Orders ({orders.length})</h2>
      </div>
      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="empty-state">
            <p>No parcel orders</p>
          </div>
        ) : (
          orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              type="parcel"
              onItemComplete={onItemComplete}
              onRemove={onRemove}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KitchenParcelOrders;