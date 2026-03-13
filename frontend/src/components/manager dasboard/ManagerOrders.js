import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { billAPI } from "../../utils/api";
import { toast } from "sonner";

const ManagerOrders = ({ refreshFloor }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const res = await api.get("/manager/active-sessions/");
      setSessions(res.data);
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBill = async (sessionId) => {
    try {
      await billAPI.generate(sessionId, 5);
      toast.success("Bill generated successfully");
      loadSessions();
      refreshFloor();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to generate bill");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 pb-24">
      <h2 className="text-lg font-bold">Active Sessions</h2>

      {sessions.length === 0 && (
        <p className="text-gray-500">No active sessions</p>
      )}

      {sessions.map((session) => (
        <div
          key={session.id}
          className="bg-white p-4 rounded-xl border shadow space-y-4"
        >
          <div>
            <p className="font-semibold text-lg">
              Table {session.table_number}
            </p>
            <p className="text-sm text-gray-500">
              Status: {session.status}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            {session.orders.map((order) =>
              order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.menu_item_name} × {item.quantity}
                  </span>
                  <span>₹{item.price}</span>
                </div>
              ))
            )}
          </div>

          <div className="font-bold text-right">
            Total: ₹{session.total}
          </div>

          <button
            onClick={() => handleGenerateBill(session.id)}
            className="w-full bg-green-600 text-white py-2 rounded-lg"
          >
            Generate Bill
          </button>
        </div>
      ))}
    </div>
  );
};

export default ManagerOrders;
