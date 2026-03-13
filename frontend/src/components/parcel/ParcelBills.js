import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'sonner';
import {
  User, Phone, IndianRupee, CheckCircle, AlertCircle, Printer
} from 'lucide-react';
import { restaurantAPI } from '../../utils/api';
import ParcelBillPrintLayout from '../parcel/ParcelBillPrintLayout';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';

// ─── Payment Mode Modal ───────────────────────────────────────────────────────
const PaymentModeModal = ({ onConfirm, onClose }) => (
  <div style={{
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{
      backgroundColor: '#fff', borderRadius: '16px',
      padding: '28px 24px', width: '300px', textAlign: 'center',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    }}>
      <h3 style={{ margin: '0 0 6px', fontWeight: 700 }}>Select Payment Mode</h3>
      <p style={{ margin: '0 0 18px', color: '#6b7280', fontSize: '0.88rem' }}>
        How did the customer pay?
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {['cash', 'upi', 'card'].map(mode => (
          <button
            key={mode}
            onClick={() => onConfirm(mode)}
            className="btn-primary"
            style={{ textTransform: 'uppercase' }}
          >
            {mode === 'cash' ? '💵 Cash' : mode === 'upi' ? '📱 UPI' : '💳 Card'}
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        style={{
          marginTop: '14px', background: 'none', border: 'none',
          color: '#9ca3af', cursor: 'pointer', fontSize: '0.9rem'
        }}
      >
        Cancel
      </button>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ParcelBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [printSettings, setPrintSettings] = useState(null);
  const printRef = React.useRef(null);
  const [printingBill, setPrintingBill] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);

  useEffect(() => {
    loadBills();
    loadRestaurantData();
  }, []);

  const loadBills = async () => {
    try {
      const res = await api.get('/parcel-bills/');
      setBills(res.data);
    } catch {
      toast.error('Failed to load parcel bills');
    } finally {
      setLoading(false);
    }
  };

  const loadRestaurantData = async () => {
    try {
      const [restaurantRes, settingsRes] = await Promise.all([
        restaurantAPI.getById(JSON.parse(localStorage.getItem('user')).restaurant),
        restaurantAPI.getPrintSettings(),
      ]);
      setRestaurant(restaurantRes.data);
      setPrintSettings(settingsRes.data);
    } catch {}
  };

  const markPaid = async (parcelOrderId, paymentMode) => {
    try {
      await api.patch(`/parcel-orders/${parcelOrderId}/mark_paid/`, {
        payment_mode: paymentMode,
      });
      toast.success('Bill marked as paid');
      setPaymentModal(null);
      loadBills();
    } catch {
      toast.error('Failed to mark bill as paid');
    }
  };

  const printBill = async (bill) => {
    setPrintingBill(bill);
    // Wait for the hidden layout to render before capturing
    setTimeout(async () => {
      if (!printRef.current) return;
      try {
        const image = await htmlToImage.toPng(printRef.current, {
          useCORS: true,
          backgroundColor: '#ffffff',
        });
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(image);
        const pdfWidth = 150;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(image, 'PNG', (210 - pdfWidth) / 2, 20, pdfWidth, pdfHeight);
        pdf.save(`parcel-bill-${bill.id}.pdf`);
      } catch {
        toast.error('Failed to generate PDF');
      }
      setPrintingBill(null);
    }, 300);
  };

  if (loading) return <p>Loading parcel bills…</p>;

  // Unpaid bills appear first
  const sorted = [...bills].sort((a, b) => {
    if (a.payment_status === 'pending' && b.payment_status !== 'pending') return -1;
    if (a.payment_status !== 'pending' && b.payment_status === 'pending') return 1;
    return 0;
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Parcel Bills</h2>

      {sorted.length === 0 && (
        <p className="text-gray-500">No parcel bills found</p>
      )}

      <div className="space-y-4">
        {sorted.map((bill) => {
          const isUnpaid = bill.payment_status === 'pending';

          return (
            <div
              key={bill.id}
              className="card p-4 space-y-3"
              style={{
                border: isUnpaid ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                background: isUnpaid ? '#fffdf5' : '#fff',
              }}
            >
              {/* ── HEADER ── */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-semibold">
                      {bill.customer_name || 'Guest'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {bill.customer_phone || '—'}
                  </div>
                </div>

                {/* Payment status badge */}
                {isUnpaid ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: '0.8rem', fontWeight: 700,
                    padding: '4px 12px', borderRadius: '999px',
                    background: '#fef3c7', color: '#92400e',
                    border: '1px solid #f59e0b',
                  }}>
                    <AlertCircle style={{ width: 13, height: 13 }} />
                    UNPAID
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: '0.8rem', fontWeight: 700,
                    padding: '4px 12px', borderRadius: '999px',
                    background: '#dcfce7', color: '#15803d',
                  }}>
                    <CheckCircle style={{ width: 13, height: 13 }} />
                    PAID
                    {bill.payment_mode && (
                      <span style={{ fontWeight: 400, fontSize: '0.75rem' }}>
                        · {bill.payment_mode.toUpperCase()}
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* ── ITEMS ── */}
              {bill.items && bill.items.length > 0 && (
                <div className="border-t pt-3 space-y-1 text-sm">
                  {bill.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.quantity}× {item.menu_item_name}</span>
                      <span>₹{item.price}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── TOTAL ── */}
              <div className="flex justify-between items-center border-t pt-3">
                <span className="font-semibold">Total</span>
                <span className="flex items-center gap-1 text-lg font-bold text-orange-600">
                  <IndianRupee className="w-4 h-4" />
                  {bill.total}
                </span>
              </div>

              {/* ── ACTIONS ── */}
              <div className="flex gap-3 flex-wrap pt-1">

                {/* Mark as Paid — only for unpaid bills */}
                {isUnpaid && (
                  <button
                    onClick={() => setPaymentModal(bill.parcel_order_id)}
                    style={{
                      padding: '8px 18px', borderRadius: '8px', border: 'none',
                      background: '#f59e0b', color: '#fff',
                      fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: '0.9rem',
                    }}
                  >
                    <IndianRupee style={{ width: 15, height: 15 }} />
                    Mark as Paid
                  </button>
                )}

                {/* ✅ Print available for ALL bills — stamp changes based on payment status */}
                <button
                  onClick={() => printBill(bill)}
                  className="border flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                  style={{ cursor: 'pointer' }}
                >
                  <Printer className="w-4 h-4" />
                  {isUnpaid ? 'Print (Unpaid)' : 'Print Bill'}
                </button>

              </div>
            </div>
          );
        })}
      </div>

      {/* ── PAYMENT MODE MODAL ── */}
      {paymentModal && (
        <PaymentModeModal
          onConfirm={(mode) => markPaid(paymentModal, mode)}
          onClose={() => setPaymentModal(null)}
        />
      )}

      {/* ── HIDDEN PRINT LAYOUT ── */}
      {printingBill && restaurant && printSettings && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
          <ParcelBillPrintLayout
            ref={printRef}
            bill={printingBill}
            restaurant={restaurant}
            printSettings={printSettings}
          />
        </div>
      )}
    </div>
  );
};

export default ParcelBills;