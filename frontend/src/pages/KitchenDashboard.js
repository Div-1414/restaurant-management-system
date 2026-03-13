import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../utils/api';
import { toast } from 'sonner';
import { LogOut, Trash2 } from 'lucide-react';

const KitchenDashboard = () => {
  const auth = useAuth();
  const user = auth.user;
  const logout = auth.logout;
  const [orders, setOrders] = useState([]);
  const [completedItems, setCompletedItems] = useState({});

  useEffect(() => {
    if (user && user.restaurant) {
      loadAllOrders();
      const interval = setInterval(loadAllOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadAllOrders = async () => {
    if (!user || !user.restaurant) return;
    
    try {
      const response = await orderAPI.getAll(user.restaurant);
      const activeOrders = response.data.filter(o => o.status !== 'completed');
      setOrders(activeOrders);
    } catch (error) {
      console.error('Failed to load orders');
    }
  };

  const toggleItemCompletion = (tableNum, orderItemKey) => {
    setCompletedItems(prev => ({
      ...prev,
      [`${tableNum}_${orderItemKey}`]: !prev[`${tableNum}_${orderItemKey}`]
    }));
  };

  const deleteTable = async (tableNum) => {
    if (!window.confirm(`Remove Table ${tableNum} from kitchen display?`)) return;

    try {
      const tableOrderIds = orders
        .filter(o => o.table_number === tableNum)
        .map(o => o.id);

      for (const orderId of tableOrderIds) {
        await orderAPI.updateStatus(orderId, 'completed');
      }

      toast.success(`Table ${tableNum} removed from kitchen`);
      
      // Clear completed items for this table
      setCompletedItems(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(key => {
          if (key.startsWith(`${tableNum}_`)) {
            delete newState[key];
          }
        });
        return newState;
      });
      
      loadAllOrders();
    } catch (error) {
      toast.error('Failed to remove table');
    }
  };

  const groupByTable = () => {
    const grouped = {};
    orders.forEach(order => {
      const tableNum = order.table_number;
      if (!grouped[tableNum]) {
        grouped[tableNum] = [];
      }
      grouped[tableNum].push(order);
    });
    return grouped;
  };

  const areAllItemsCompleted = (tableNum, tableOrderList) => {
    let totalItems = 0;
    let completedCount = 0;

    tableOrderList.forEach(order => {
      order.items?.forEach((item, idx) => {
        for (let i = 0; i < item.quantity; i++) {
          totalItems++;
          if (completedItems[`${tableNum}_${order.id}_${idx}_${i}`]) {
            completedCount++;
          }
        }
      });
    });

    return totalItems > 0 && totalItems === completedCount;
  };

  const tableOrders = groupByTable();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Kitchen Display</h1>
            <p className="text-gray-400 mt-1">Live Orders - Item Tracking</p>
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
        {Object.keys(tableOrders).length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg">No active orders</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(tableOrders).map(([tableNum, tableOrderList]) => {
              const allCompleted = areAllItemsCompleted(tableNum, tableOrderList);
              
              return (
                <div 
                  key={tableNum} 
                  className={`rounded-xl p-6 border-l-4 ${
                    allCompleted ? 'bg-green-900/30 border-green-500' : 'bg-gray-800 border-orange-500'
                  }`}
                  data-testid={`table-${tableNum}-card`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Table {tableNum}</h2>
                    {allCompleted && (
                      <button
                        onClick={() => deleteTable(tableNum)}
                        data-testid={`delete-table-${tableNum}`}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Table
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {tableOrderList.map((order) => (
                      <div key={order.id} className="bg-gray-900/50 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-3">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </div>

                        <div className="space-y-2 mb-4">
                          {order.items?.map((item, idx) => (
                            <div key={idx}>
                              {Array.from({ length: item.quantity }).map((_, qIdx) => {
                                const itemKey = `${tableNum}_${order.id}_${idx}_${qIdx}`;
                                const isCompleted = completedItems[itemKey];
                                
                                return (
                                  <div 
                                    key={qIdx}
                                    className="flex items-center gap-3 bg-gray-800 p-3 rounded mb-2"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isCompleted || false}
                                      onChange={() => toggleItemCompletion(tableNum, `${order.id}_${idx}_${qIdx}`)}
                                      data-testid={`item-checkbox-${order.id}-${idx}-${qIdx}`}
                                      className="w-5 h-5 rounded border-gray-600 text-green-600 focus:ring-green-500 cursor-pointer"
                                    />
                                    <span className={`flex-1 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                                      1x {item.menu_item_name}
                                    </span>
                                    <span className="text-gray-400">₹{parseFloat(item.price / item.quantity).toFixed(2)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>

                        {order.special_instructions && (
                          <div className="bg-yellow-900/30 border border-yellow-700 rounded p-3">
                            <div className="text-xs font-semibold text-yellow-300 mb-1">Special Instructions:</div>
                            <div className="text-sm text-yellow-100">{order.special_instructions}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {allCompleted && (
                    <div className="mt-4 bg-green-500/20 border border-green-500 rounded-lg p-3 text-center">
                      <p className="text-green-300 font-semibold">All items completed!</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default KitchenDashboard;
