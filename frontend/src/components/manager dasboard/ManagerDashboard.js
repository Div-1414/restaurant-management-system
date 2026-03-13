import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { restaurantAPI, groupAPI } from "../../utils/api";
import { toast } from "sonner";

import ManagerTables from "./ManagerTables";
import ManagerCombine from "./ManagerCombine";
import ManagerTransfer from "./ManagerTransfer";
import ManagerManualOrder from "./ManagerManualOrder";
import ManagerOrders from "./ManagerOrders";

import { useWebSocket } from "../../hooks/useWebSocket";

const ManagerDashboard = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurant;

  const { messages } = useWebSocket(restaurantId);

  const [restaurant, setRestaurant] = useState(null);
  const [floorData, setFloorData] = useState(null);
  const [activeTab, setActiveTab] = useState("tables");
  const [loading, setLoading] = useState(true);

  /* ✅ NEW STATE FOR REORDER */
  const [reorderTableId, setReorderTableId] = useState(null);

  /* ================= LOAD RESTAURANT ================= */
  const loadRestaurant = async () => {
    try {
      const res = await restaurantAPI.getById(restaurantId);
      setRestaurant(res.data);
    } catch {
      toast.error("Failed to load restaurant");
    }
  };

  /* ================= LOAD FLOOR ================= */
  const loadFloor = async () => {
    try {
      const res = await groupAPI.floorOverview();
      setFloorData(res.data);
    } catch {
      toast.error("Failed to load floor data");
    } finally {
      setLoading(false);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    if (!restaurantId) return;

    loadRestaurant();
    loadFloor();
  }, [restaurantId]);

  /* ================= REALTIME UPDATE ================= */
  useEffect(() => {
    if (!messages?.length) return;

    const latest = messages[messages.length - 1];

    if (
      latest.type === "new_order" ||
      latest.type === "table_status_changed" ||
      latest.type === "table_combined" ||
      latest.type === "table_transferred" ||
      latest.type === "bill_generated"
    ) {
      loadFloor();
    }
  }, [messages]);

  /* ✅ REORDER HANDLER */
  const handleReorder = (tableId) => {
    setReorderTableId(tableId);
    setActiveTab("order");
  };

  const clearReorder = () => {
    setReorderTableId(null);
  };

  /* ================= RENDER ACTIVE SECTION ================= */
  const renderSection = () => {
    if (!floorData) return null;

    switch (activeTab) {
      case "tables":
        return <ManagerTables floorData={floorData} />;

      case "combine":
        return (
          <ManagerCombine
            floorData={floorData}
            refreshFloor={loadFloor}
          />
        );

      case "transfer":
        return (
          <ManagerTransfer
            floorData={floorData}
            refreshFloor={loadFloor}
          />
        );

      case "order":
        return (
          <ManagerManualOrder
            restaurantId={restaurantId}
            floorData={floorData}
            refreshFloor={loadFloor}
            reorderTableId={reorderTableId}
            clearReorder={clearReorder}
          />
        );

      case "orders":
        return (
          <ManagerOrders
            refreshFloor={loadFloor}
            onReorder={handleReorder}
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const tabs = ["tables", "combine", "transfer", "order", "orders"];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* ================= HEADER ================= */}
      <div className="bg-white shadow p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-orange-600">
          {restaurant?.name || "Restaurant"}
        </h1>

        <p className="text-sm text-gray-500">
          Floor Manager Dashboard
        </p>

        <span
          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
            restaurant?.is_open
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {restaurant?.is_open ? "OPEN" : "CLOSED"}
        </span>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="p-4">
        {renderSection()}
      </div>

      {/* ================= MOBILE NAV ================= */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex md:hidden">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-semibold ${
              activeTab === tab
                ? "text-orange-600"
                : "text-gray-500"
            }`}
          >
            {tab === "orders"
              ? "Sessions"
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ================= DESKTOP NAV ================= */}
      <div className="hidden md:flex justify-center gap-6 bg-white border-t p-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === tab
                ? "bg-orange-600 text-white"
                : "text-gray-600"
            }`}
          >
            {tab === "orders"
              ? "Active Sessions"
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

    </div>
  );
};

export default ManagerDashboard;
