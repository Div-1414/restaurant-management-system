import React, { useEffect, useState, useRef } from 'react';
import api from '../../utils/api';
import { toast } from 'sonner';
import { Phone, User, XCircle, CheckCircle, IndianRupee, Clock, ChefHat, AlertCircle } from 'lucide-react';

// ─── Live Timer Component ───────────────────────────────────────────────────
const LiveTimer = ({ acceptedAt, stoppedAt }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!acceptedAt) return;

    const calc = () => {
      const start = new Date(acceptedAt).getTime();
      const end = stoppedAt ? new Date(stoppedAt).getTime() : Date.now();
      setSeconds(Math.floor((end - start) / 1000));
    };

    calc();

    // If already stopped, no need to tick
    if (stoppedAt) return;

    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [acceptedAt, stoppedAt]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const isLong = seconds > 20 * 60; // warn after 20 min

  const display = h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontFamily: 'monospace',
      fontWeight: 700,
      fontSize: '0.95rem',
      color: stoppedAt ? '#16a34a' : isLong ? '#dc2626' : '#d97706',
      background: stoppedAt ? '#dcfce7' : isLong ? '#fee2e2' : '#fef3c7',
      padding: '2px 10px',
      borderRadius: '999px',
    }}>
      <Clock style={{ width: 13, height: 13 }} />
      {display}
      {stoppedAt && <span style={{ fontSize: '0.7rem', marginLeft: 2 }}>✓ done</span>}
    </span>
  );
};

// ─── Bill Payment Status Modal ──────────────────────────────────────────────
const BillStatusModal = ({ orderId, onConfirm, onClose }) => (
  <div style={{
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{
      backgroundColor: '#fff', borderRadius: '16px',
      padding: '28px 24px', width: '320px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    }}>
      <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700 }}>
        Generate Bill
      </h3>
      <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '0.9rem' }}>
        How would you like to record this payment?
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={() => onConfirm(orderId, 'paid')}
          style={{
            padding: '12px', borderRadius: '10px', border: 'none',
            background: '#16a34a', color: '#fff', fontWeight: 700,
            fontSize: '1rem', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <CheckCircle style={{ width: 18, height: 18 }} />
          Mark as PAID
        </button>

        <button
          onClick={() => onConfirm(orderId, 'pending')}
          style={{
            padding: '12px', borderRadius: '10px', border: '2px solid #f59e0b',
            background: '#fffbeb', color: '#92400e', fontWeight: 700,
            fontSize: '1rem', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <AlertCircle style={{ width: 18, height: 18 }} />
          Mark as UNPAID
        </button>
      </div>

      <button
        onClick={onClose}
        style={{
          marginTop: '14px', width: '100%', background: 'none',
          border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.9rem'
        }}
      >
        Cancel
      </button>
    </div>
  </div>
);

// ─── Payment Mode Modal ──────────────────────────────────────────────────────
const PaymentModeModal = ({ orderId, onConfirm, onClose }) => (
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
      <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>Select Payment Mode</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {['cash', 'upi', 'card'].map(mode => (
          <button
            key={mode}
            onClick={() => onConfirm(orderId, mode)}
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
          marginTop: '12px', background: 'none', border: 'none',
          color: '#6c757d', cursor: 'pointer', fontSize: '0.9rem'
        }}
      >
        Cancel
      </button>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const ParcelOrders = ({ restaurantId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Which order is showing "Paid / Unpaid?" modal
  const [billStatusModal, setBillStatusModal] = useState(null);

  // Which order is showing payment mode modal (for marking unpaid → paid later)
  const [paymentModal, setPaymentModal] = useState(null);

  useEffect(() => {
    loadParcels();
  }, [restaurantId]);

  const loadParcels = async () => {
    try {
      const res = await api.get('/parcel-orders/');
      setOrders(res.data);
    } catch {
      toast.error('Failed to load parcel orders');
    } finally {
      setLoading(false);
    }
  };

  const acceptParcel = async (id) => {
    try {
      await api.patch(`/parcel-orders/${id}/accept/`);
      toast.success('Parcel accepted & sent to kitchen');
      loadParcels();
    } catch {
      toast.error('Failed to accept parcel');
    }
  };

  const cancelParcel = async (id) => {
    try {
      await api.patch(`/parcel-orders/${id}/cancel/`);
      toast.success('Parcel cancelled');
      loadParcels();
    } catch {
      toast.error('Failed to cancel parcel');
    }
  };

  // Called from BillStatusModal — generates bill with chosen payment_status
  const handleGenerateBill = async (id, paymentStatus) => {
    try {
      await api.post(`/parcel-orders/${id}/generate_bill/`, {
        tax: 0,
        payment_status: paymentStatus,
      });
      toast.success(
        paymentStatus === 'paid'
          ? 'Bill generated & marked as PAID'
          : 'Bill generated — marked as UNPAID'
      );
      setBillStatusModal(null);
      loadParcels();
    } catch {
      toast.error('Failed to generate bill');
    }
  };

  // Called from PaymentModeModal — marks an existing unpaid bill as paid
  const markPaid = async (id, paymentMode) => {
    try {
      await api.patch(`/parcel-orders/${id}/mark_paid/`, {
        payment_mode: paymentMode,
      });
      toast.success('Payment recorded');
      setPaymentModal(null);
      loadParcels();
    } catch {
      toast.error('Failed to mark paid');
    }
  };

  if (loading) return <p>Loading parcels…</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Parcel Orders</h2>

      {orders.length === 0 && (
        <p className="text-gray-500">No parcel orders</p>
      )}

      <div className="space-y-4">
        {orders.map((order) => {
          const isUnpaid = order.bill && order.bill.payment_status === 'pending';
          const isPaid   = order.bill && order.bill.payment_status === 'paid';

          return (
            <div
              key={order.id}
              className="card p-4 space-y-3"
              style={{
                border: isUnpaid ? '2px solid #f59e0b' : undefined,
                background: isUnpaid ? '#fffdf5' : undefined,
              }}
            >
              {/* ── HEADER ── */}
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-semibold">
                      {order.customer_name || 'Guest'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {order.customer_phone}
                  </div>
                </div>

                {/* Right side badges */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  {/* Status badge */}
                  <span className={`px-3 py-1 rounded-full text-sm
                    ${order.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : order.status === 'accepted'
                        ? 'bg-blue-100 text-blue-700'
                        : order.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                    }`}>
                    {order.status}
                  </span>

                  {/* Timer — only show if accepted */}
                  {order.accepted_at && (
                    <LiveTimer
                      acceptedAt={order.accepted_at}
                      stoppedAt={order.kitchen_completed_at}
                    />
                  )}

                  {/* Kitchen completion badge */}
                  {order.status === 'accepted' && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: '0.78rem', fontWeight: 600, padding: '2px 10px',
                      borderRadius: '999px',
                      background: order.kitchen_completed ? '#dcfce7' : '#eff6ff',
                      color: order.kitchen_completed ? '#15803d' : '#1d4ed8',
                    }}>
                      <ChefHat style={{ width: 13, height: 13 }} />
                      {order.kitchen_completed ? 'Kitchen Done ✓' : 'In Kitchen…'}
                    </span>
                  )}

                  {/* Unpaid bill warning */}
                  {isUnpaid && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: '0.78rem', fontWeight: 700, padding: '2px 10px',
                      borderRadius: '999px',
                      background: '#fef3c7', color: '#92400e',
                      border: '1px solid #f59e0b',
                    }}>
                      <AlertCircle style={{ width: 12, height: 12 }} />
                      UNPAID
                    </span>
                  )}

                  {/* Paid badge */}
                  {isPaid && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: '0.78rem', fontWeight: 600, padding: '2px 10px',
                      borderRadius: '999px',
                      background: '#dcfce7', color: '#15803d',
                    }}>
                      <CheckCircle style={{ width: 12, height: 12 }} />
                      PAID
                    </span>
                  )}
                </div>
              </div>

              {/* ── ITEMS ── */}
              <div className="border-t pt-3 space-y-1 text-sm">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.quantity}× {item.menu_item_name}</span>
                    <span>₹{item.price}</span>
                  </div>
                ))}
              </div>

              {/* ── TOTAL ── */}
              <div className="flex justify-between items-center border-t pt-3">
                <span className="font-semibold">Total</span>
                <span className="flex items-center gap-1 text-lg font-bold text-orange-600">
                  <IndianRupee className="w-4 h-4" />
                  {order.total}
                </span>
              </div>

              {/* ── ACTIONS ── */}
              <div className="flex gap-3 pt-2 flex-wrap">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => acceptParcel(order.id)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </button>

                    <button
                      onClick={() => cancelParcel(order.id)}
                      className="btn-outline text-red-600 flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}

                {/* Generate Bill — shows modal asking Paid/Unpaid */}
                {order.status === 'accepted' && !order.has_bill && (
                  <button
                    onClick={() => setBillStatusModal(order.id)}
                    className="btn-primary"
                  >
                    Generate Bill
                  </button>
                )}

                {/* Mark Unpaid → Paid — available anytime bill is pending */}
                {isUnpaid && (
                  <button
                    onClick={() => setPaymentModal(order.id)}
                    style={{
                      padding: '8px 16px', borderRadius: '8px', border: 'none',
                      background: '#f59e0b', color: '#fff',
                      fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <IndianRupee style={{ width: 15, height: 15 }} />
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BILL STATUS MODAL (Paid / Unpaid?) ── */}
      {billStatusModal && (
        <BillStatusModal
          orderId={billStatusModal}
          onConfirm={handleGenerateBill}
          onClose={() => setBillStatusModal(null)}
        />
      )}

      {/* ── PAYMENT MODE MODAL (cash/upi/card) ── */}
      {paymentModal && (
        <PaymentModeModal
          orderId={paymentModal}
          onConfirm={markPaid}
          onClose={() => setPaymentModal(null)}
        />
      )}
    </div>
  );
};

export default ParcelOrders;