import React, { useEffect, useState } from 'react';
import { restaurantAPI } from '../utils/api';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import QrPreviewModal from './QrPreviewModal';
import BillPreviewModal from './BillPreviewModal';

const BillQRSettings = () => {
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showQrPreview, setShowQrPreview] = useState(false);
  const [showBillPreview, setShowBillPreview] = useState(false);

  const [form, setForm] = useState({
    show_logo_on_qr: true,
    qr_custom_text: '',
    show_logo_on_bill: true,
    show_address_on_bill: true,
    show_phone_on_bill: true,
  });

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadSettings();
    loadRestaurant();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await restaurantAPI.getPrintSettings();
      setForm(res.data);
    } catch {
      toast.error('Failed to load print settings');
    } finally {
      setLoading(false);
    }
  };

  const loadRestaurant = async () => {
    if (!user?.restaurant) return;

    try {
      const res = await restaurantAPI.getById(user.restaurant);
      setRestaurant(res.data);
    } catch {
      toast.error('Failed to load restaurant details');
    }
  };

  /* ================= SAVE ================= */

  const saveSettings = async () => {
    try {
      setSaving(true);
      await restaurantAPI.updatePrintSettings(form);
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-orange-700 mb-1">
        Bill & QR Settings
      </h1>
      <p className="text-gray-600 mb-6">
        Customize how your bills and QR codes look
      </p>

      {/* QR SETTINGS */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">QR Code</h2>

        <label className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            checked={form.show_logo_on_qr}
            onChange={(e) =>
              setForm({ ...form, show_logo_on_qr: e.target.checked })
            }
          />
          Show restaurant logo on QR
        </label>

        <textarea
          maxLength={120}
          value={form.qr_custom_text}
          onChange={(e) =>
            setForm({ ...form, qr_custom_text: e.target.value })
          }
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Scan & order easily"
        />
      </div>

      {/* BILL SETTINGS */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Bill</h2>

        <label className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={form.show_logo_on_bill}
            onChange={(e) =>
              setForm({ ...form, show_logo_on_bill: e.target.checked })
            }
          />
          Show restaurant logo on bill
        </label>

        <label className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={form.show_address_on_bill}
            onChange={(e) =>
              setForm({ ...form, show_address_on_bill: e.target.checked })
            }
          />
          Show address on bill
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.show_phone_on_bill}
            onChange={(e) =>
              setForm({ ...form, show_phone_on_bill: e.target.checked })
            }
          />
          Show phone number on bill
        </label>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setShowQrPreview(true)}
          className="border px-5 py-2 rounded-lg font-medium hover:bg-gray-100"
        >
          Preview QR
        </button>

        <button
          onClick={() => setShowBillPreview(true)}
          className="border px-5 py-2 rounded-lg font-medium hover:bg-gray-100"
        >
          Preview Bill
        </button>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Powered by Restro · Restaurant Management System
      </p>

      {/* QR PREVIEW */}
      <QrPreviewModal
        open={showQrPreview}
        onClose={() => setShowQrPreview(false)}
        qrValue={`${process.env.REACT_APP_FRONTEND_URL}/parcel/menu/${user?.restaurant}`}
        restaurant={restaurant}
        printSettings={form}
        subtitle="Scan to order parcel"
      />

      {/* BILL PREVIEW */}
      <BillPreviewModal
        open={showBillPreview}
        onClose={() => setShowBillPreview(false)}
        restaurant={restaurant}
        printSettings={form}
      />
    </div>
  );
};

export default BillQRSettings;
