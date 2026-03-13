import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../utils/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { toast } from 'sonner';
import { LogOut, Clock, ChefHat, CheckCircle } from 'lucide-react';

const Kitchen = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState({ pending: [], preparing: [], ready: [] });
  const { messages } = useWebSocket(user?.restaurant);

  useEffect(() => {
    if (user?.restaurant) {
      loadOrders();
    }
  }, [user]);

  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.type === 'new_order' || latestMessage.type === 'order_status_updated') {
        loadOrders();
        if (latestMessage.type === 'new_order') {
          toast.success('New order received!');
        }
      }
    }
  }, [messages]);

  const loadOrders = async () => {
    try {
      const pending = await orderAPI.getAll(user.restaurant, 'pending');
      const preparing = await orderAPI.getAll(user.restaurant, 'preparing');
      const ready = await orderAPI.getAll(user.restaurant, 'ready');
      
      setOrders({
        pending: pending.data,
        preparing: preparing.data,
        ready: ready.data
      });
    } catch (error) {
      console.error('Failed to load orders');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success('Order status updated');
      loadOrders();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const renderOrderCard = (order, status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-700',
      preparing: 'bg-blue-100 text-blue-700',
      ready: 'bg-green-100 text-green-700'
    };

    return (
      <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 fade-in" data-testid="kitchen-order-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-gray-900">Table {order.table_number}</div>
            <div className="text-sm text-gray-500">{new Date(order.created_at).toLocaleTimeString()}</div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[status]}`}>
            {status.toUpperCase()}
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          {order.items && order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <div>
                <div className="font-semibold text-gray-900">{item.quantity}x {item.menu_item_name}</div>
              </div>
              <div className="text-gray-600">${parseFloat(item.price).toFixed(2)}</div>
            </div>
          ))}
        </div>
        
        {order.special_instructions && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="text-sm font-semibold text-yellow-800 mb-1">Special Instructions:</div>
            <div className="text-sm text-yellow-700">{order.special_instructions}</div>
          </div>
        )}
        
        <div className="flex gap-2">
          {status === 'pending' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'preparing')}
              data-testid={`start-preparing-${order.id}`}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <ChefHat className="w-4 h-4" />
              Start Preparing
            </button>
          )}
          {status === 'preparing' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'ready')}
              data-testid={`mark-ready-${order.id}`}
              className="flex-1 bg-green-600 text-white hover:bg-green-700 rounded-full px-6 py-3 font-semibold transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Ready
            </button>
          )}
          {status === 'ready' && (
            <div className="flex-1 text-center py-3 bg-green-100 text-green-700 rounded-full font-semibold">
              Ready for Pickup
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>Kitchen Display</h1>
            <p className="text-gray-400 mt-1">Live Orders</p>
          </div>
          <button
            onClick={logout}
            data-testid="kitchen-logout-button"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>Pending ({orders.pending.length})</h2>
            </div>
            <div className="space-y-4">
              {orders.pending.length === 0 ? (
                <div className="bg-gray-800 rounded-xl p-6 text-center text-gray-500">
                  No pending orders
                </div>
              ) : (
                orders.pending.map(order => renderOrderCard(order, 'pending'))
              )}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>Preparing ({orders.preparing.length})</h2>
            </div>
            <div className="space-y-4">
              {orders.preparing.length === 0 ? (
                <div className="bg-gray-800 rounded-xl p-6 text-center text-gray-500">
                  No orders in preparation
                </div>
              ) : (
                orders.preparing.map(order => renderOrderCard(order, 'preparing'))
              )}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>Ready ({orders.ready.length})</h2>
            </div>
            <div className="space-y-4">
              {orders.ready.length === 0 ? (
                <div className="bg-gray-800 rounded-xl p-6 text-center text-gray-500">
                  No ready orders
                </div>
              ) : (
                orders.ready.map(order => renderOrderCard(order, 'ready'))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Kitchen;
