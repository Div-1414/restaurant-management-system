import React, { useEffect, useState } from 'react';
import './KitchenDashboard.css';

// Helper function to safely format price
const formatPrice = (price) => {
  const num = parseFloat(price);
  return isNaN(num) ? price : num.toFixed(2);
};

const KitchenOrderPopup = ({ order, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const getOrderType = () => {
    if (order.type === 'parcel') return 'Parcel Order';
    if (order.order_source === 'qr') return 'QR Order';
    return 'New Order';
  };

  // Get hall display text
  const getHallDisplay = () => {
    if (order.hall) {
      return `${order.hall} Hall`;
    }
    return '';
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '2px solid #c17a5c'
        }}>
          <h2 style={{ 
            margin: 0, 
            color: '#1a1a1a',
            fontSize: '1.4rem',
            fontWeight: '700'
          }}>
            New Order Received!
          </h2>
          <button 
            className="close-btn" 
            onClick={() => setIsVisible(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
        
        <div className="popup-body" style={{ textAlign: 'left' }}>
          <div style={{ 
            background: '#c17a5c', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '8px',
            display: 'inline-block',
            marginBottom: '15px',
            fontWeight: '600',
            fontSize: '0.9rem',
            textTransform: 'uppercase'
          }}>
            {getOrderType()}
          </div>
          
          {order.table_number && (
            <div style={{ 
              marginBottom: '10px',
              fontSize: '1.1rem',
              color: '#1a1a1a',
              fontWeight: '600'
            }}>
              Table {order.table_number} {getHallDisplay() && `(${getHallDisplay()})`}
            </div>
          )}
          
          {order.customer_name && (
            <div style={{ 
              marginBottom: '10px',
              fontSize: '1rem',
              color: '#4b5563'
            }}>
              Customer: {order.customer_name}
            </div>
          )}
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            paddingTop: '15px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <div style={{ 
              fontSize: '0.9rem', 
              color: '#6b7280'
            }}>
              {order.items?.length || 0} items
            </div>
            <div style={{ 
              fontSize: '1.3rem', 
              fontWeight: '700',
              color: '#1a1a1a'
            }}>
              ₹{formatPrice(order.total)}
            </div>
          </div>
        </div>
        
        <button 
          className="popup-close"
          onClick={() => setIsVisible(false)}
          style={{ marginTop: '20px' }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default KitchenOrderPopup;