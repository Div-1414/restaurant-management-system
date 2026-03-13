import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { restaurantAPI, reportAPI } from '../utils/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  UtensilsCrossed,
  DollarSign,
  ChefHat,
  LogOut,
  Power,
  AlertTriangle,
  DoorOpen,
  Package,
  FileText,
  Users,
} from 'lucide-react';

import TablesView from '../components/TablesView';
import MenuManagement from '../components/MenuManagement';
import KitchenManagement from '../components/KitchenManagement';
import BillsManagement from '../components/BillsManagement';
import HallManagement from '../components/HallManagement';
import ParcelQR from '../components/parcel/ParcelQR';
import ParcelOrders from '../components/parcel/ParcelOrders';
import ParcelBills from '../components/parcel/ParcelBills';
import BillQRSettings from '../components/BillQRSettings';
import ManagerManagement from '../components/ManagerManagement';




const Owner = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  const restaurantId = user?.restaurant;
  const { messages } = useWebSocket(restaurantId);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // ✅ NEW: increment this to force ParcelOrders to re-fetch
  const [parcelOrdersKey, setParcelOrdersKey] = useState(0);


  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (!restaurantId) return;
    loadRestaurant();
    loadStats();
  }, [restaurantId]);

  // ✅ UPDATED: also handle parcel_kitchen_completed WebSocket event
  useEffect(() => {
    if (!messages?.length) return;
    const latest = messages[messages.length - 1];

    if (
      latest.type === 'new_order' ||
      latest.type === 'table_status_changed'
    ) {
      loadStats();
    }

    // When kitchen marks a parcel as completed, refresh the parcel orders list
    if (latest.message === 'parcel_kitchen_completed') {
      setParcelOrdersKey(k => k + 1);
      // If owner is not on parcel-orders tab, show a toast notification
      if (activeTab !== 'parcel-orders') {
        toast.info('A parcel order was completed by kitchen', {
          action: {
            label: 'View',
            onClick: () => setActiveTab('parcel-orders'),
          },
        });
      }
    }
  }, [messages]);

  /* ================= API ================= */

  const loadRestaurant = async () => {
    try {
      const res = await restaurantAPI.getById(restaurantId);
      setRestaurant(res.data);
      setIsOpen(res.data.is_open);
    } catch {
      toast.error('Failed to load restaurant');
    }
  };

  const loadStats = async () => {
    try {
      const res = await restaurantAPI.getStats(restaurantId);
      setStats(res.data);
      setIsOpen(res.data.is_open);
    } catch { }
  };

  const toggleRestaurantStatus = async () => {
    if (isOpen) {
      setShowCloseModal(true);
      return;
    }

    try {
      const res = await restaurantAPI.toggleOpen(restaurantId);
      setIsOpen(res.data.is_open);
      loadStats();
      toast.success('Restaurant opened');
    } catch {
      toast.error('Failed to open restaurant');
    }
  };

  const closeRestaurantForDay = async () => {
    try {
      await restaurantAPI.closeDay(restaurantId);

      setIsOpen(false);
      setShowCloseModal(false);

      // 🔥 FORCE UI REFRESH
      setActiveTab('dashboard');

      toast.success('Restaurant closed and day cleared');
    } catch {
      toast.error('Failed to close restaurant');
    }
  };



  /*--------------For Excel Download------------------- */
  const downloadTodaySales = async () => {
    try {
      const res = await reportAPI.downloadTodaySalesExcel();

      const url = window.URL.createObjectURL(
        new Blob([res.data])
      );

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `today-sales-${new Date().toISOString().slice(0, 10)}.xlsx`
      );

      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Today's sales downloaded");
    } catch {
      toast.error('Failed to download sales');
    }
  };

  /* ================= CONTENT ================= */

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-orange-700 mb-1">
            {restaurant?.name || 'Restaurant'}
          </h1>

          <h2 className="text-lg text-gray-600 mb-4">
            Dashboard Overview
          </h2>

          {/* CLOSED WARNING */}
          {!isOpen && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 px-5 py-4 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">
                Restaurant is currently closed. Open it to enable all services.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Stat label="Total Tables" value={stats?.total_tables} />
            <Stat label="Occupied" value={stats?.occupied_tables} color="red" />
            <Stat label="Available" value={stats?.available_tables} color="green" />
            <Stat
              label="Today's Revenue"
              value={`₹${stats?.today_revenue || '0.00'}`}
              color="orange"
            />
          </div>
          <div className="flex justify-end mb-6">
            <button
              onClick={downloadTodaySales}
              className="flex items-center gap-2 border border-orange-500 text-orange-600
             px-5 py-2 rounded-lg font-semibold hover:bg-orange-50"
            >
              📥 Download Today's Sales (Excel)
            </button>

          </div>


          <TablesView restaurantId={restaurantId} onUpdate={loadStats} />
        </>
      );
    }

    if (activeTab === 'menu')
      return <MenuManagement restaurantId={restaurantId} />;

    if (activeTab === 'parcel')
      return <ParcelQR restaurantId={restaurantId} />;

    // ✅ UPDATED: key prop forces re-mount (and re-fetch) when kitchen completes a parcel
    if (activeTab === 'parcel-orders')
      return <ParcelOrders key={parcelOrdersKey} restaurantId={restaurantId} />;

    if (activeTab === 'parcel-bills')
      return <ParcelBills />;

    if (activeTab === 'bills')
      return <BillsManagement restaurantId={restaurantId} />;

    if (activeTab === 'kitchen')
      return <KitchenManagement restaurantId={restaurantId} />;

    if (activeTab === 'managers')
      return <ManagerManagement restaurantId={restaurantId} />;

    if (activeTab === 'halls')
      return <HallManagement restaurantId={restaurantId} />;

    if (activeTab === 'bill-qr-settings')
      return <BillQRSettings />;

    return null;
  };

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          {restaurant?.logo && (
            <img
              src={restaurant.logo}
              alt="Restaurant Logo"
              className="w-full max-h-40 object-contain rounded-lg mb-4"
            />
          )}

          <button
            onClick={toggleRestaurantStatus}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-colors
              ${isOpen
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
              }
            `}
          >
            <Power className="w-4 h-4" />
            {isOpen ? 'OPEN' : 'CLOSED'}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2">
          <SidebarBtn
            icon={LayoutDashboard}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <SidebarBtn
            icon={UtensilsCrossed}
            label="Menu"
            active={activeTab === 'menu'}
            onClick={() => setActiveTab('menu')}
          />

          <SidebarBtn
            icon={Package}
            label="Parcel QR"
            active={activeTab === 'parcel'}
            onClick={() => setActiveTab('parcel')}
          />

          <SidebarBtn
            icon={Package}
            label="Parcel Orders"
            active={activeTab === 'parcel-orders'}
            onClick={() => setActiveTab('parcel-orders')}
          />

          <SidebarBtn
            icon={Package}
            label="Parcel Bills"
            active={activeTab === 'parcel-bills'}
            onClick={() => setActiveTab('parcel-bills')}
          />

          {/* for qr and bill preview */}
          <SidebarBtn
            icon={FileText}
            label="Bill & QR Settings"
            active={activeTab === 'bill-qr-settings'}
            onClick={() => setActiveTab('bill-qr-settings')}
          />

          <SidebarBtn
            icon={DollarSign}
            label="Bills & Payments"
            active={activeTab === 'bills'}
            onClick={() => setActiveTab('bills')}
          />
          <SidebarBtn
            icon={ChefHat}
            label="Kitchen Staff"
            active={activeTab === 'kitchen'}
            onClick={() => setActiveTab('kitchen')}
          />
          <SidebarBtn
            icon={Users}
            label="Floor Manager"
            active={activeTab === 'managers'}
            onClick={() => setActiveTab('managers')}
          />

          <SidebarBtn
            icon={DoorOpen}
            label="Halls"
            active={activeTab === 'halls'}
            onClick={() => setActiveTab('halls')}
          />
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-600 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>

        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 overflow-auto pb-20">
        {renderContent()}
      </main>

      {/* FOOTER */}
      <footer className="fixed bottom-0 left-64 right-0 bg-white border-t py-2 text-center text-sm text-gray-500">
        Powered by Restro · Restaurant Management System
      </footer>
      {showCloseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">

            <h3 className="text-xl font-bold text-red-600 mb-4">
              ⚠️ Close Restaurant & End Day
            </h3>

            <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
              <li>All services will be paused</li>
              <li className="font-semibold">
                Today's bills & parcel orders will be permanently deleted
              </li>
              <li className="text-red-600 font-semibold">
                This action cannot be undone
              </li>
            </ul>

            <p className="text-orange-600 font-semibold mb-4">
              Don't forget to download today's sales report.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={downloadTodaySales}
                className="px-4 py-2 border border-orange-500 text-orange-600 rounded-lg"
              >
                Download Sales
              </button>

              <button
                onClick={closeRestaurantForDay}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Close Restaurant
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

/* ================= SMALL COMPONENTS ================= */

const SidebarBtn = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${active ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'
      }`}
  >
    <Icon className="w-5 h-5" />
    {label}
  </button>
);

const Stat = ({ label, value, color }) => (
  <div className="card-dashboard">
    <div className="text-sm text-gray-500">{label}</div>
    <div className={`text-3xl font-bold ${color ? `text-${color}-600` : ''}`}>
      {value || 0}
    </div>
  </div>
);

export default Owner;