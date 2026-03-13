import React, { useState, useEffect } from 'react';
import { billAPI, restaurantAPI } from '../utils/api';
import { toast } from 'sonner';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import {
  Receipt,
  CheckCircle,
  User,
  Phone,
  Calendar,
  Printer
} from 'lucide-react';
import TableBillPrintLayout from './TableBillPrintLayout';

const BillsManagement = ({ restaurantId }) => {
  const [bills, setBills] = useState([]);
  const [dailyIncome, setDailyIncome] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===== Payment Modal State ===== */
  const [paymentModalBillId, setPaymentModalBillId] = useState(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("cash");

  /* ===== Print State ===== */
  const [restaurant, setRestaurant] = useState(null);
  const [printSettings, setPrintSettings] = useState(null);
  const [printingBill, setPrintingBill] = useState(null);
  const printRef = React.useRef(null);

  useEffect(() => {
    loadBills();
    loadDailyIncome();
    loadRestaurantData();

    const interval = setInterval(() => {
      loadBills();
      loadDailyIncome();
    }, 5000);

    return () => clearInterval(interval);
  }, [restaurantId]);

  const loadBills = async () => {
    try {
      const response = await billAPI.getAll(restaurantId);
      setBills(response.data);
    } catch (error) {
      console.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const loadDailyIncome = async () => {
    try {
      const response = await billAPI.getDailyIncome(restaurantId);
      setDailyIncome(response.data);
    } catch (error) {
      console.error("Failed to load daily income");
    }
  };

  const loadRestaurantData = async () => {
    try {
      const [restaurantRes, settingsRes] = await Promise.all([
        restaurantAPI.getById(
          JSON.parse(localStorage.getItem('user')).restaurant
        ),
        restaurantAPI.getPrintSettings(),
      ]);
      setRestaurant(restaurantRes.data);
      setPrintSettings(settingsRes.data);
    } catch {}
  };

  /* ===== Confirm Payment ===== */
  const confirmPayment = async () => {
    try {
      await billAPI.updatePayment(paymentModalBillId, {
        payment_mode: selectedPaymentMode,
      });

      toast.success("Bill marked as paid");
      setPaymentModalBillId(null);
      loadBills();
      loadDailyIncome();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to update payment"
      );
    }
  };

  /* ===== Print Bill ===== */
  const printBill = async (bill) => {
    setPrintingBill(bill);

    setTimeout(async () => {
      if (!printRef.current) return;

      const image = await htmlToImage.toPng(printRef.current, {
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(image);
      const pdfWidth = 150;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const x = (210 - pdfWidth) / 2;

      pdf.addImage(image, 'PNG', x, 20, pdfWidth, pdfHeight);
      pdf.save(`table-bill-${bill.id}.pdf`);

      setPrintingBill(null);
    }, 100);
  };

  const getTodaysBills = () => {
    const today = new Date().toDateString();
    return bills.filter(
      (bill) => new Date(bill.created_at).toDateString() === today
    );
  };

  const todaysBills = getTodaysBills();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      {/* ===== HEADER ===== */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Bills & Payments</h2>

        {dailyIncome && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Today's Income (Paid Bills Only)
                </p>
                <p className="text-4xl font-bold text-green-600">
                  ₹{parseFloat(dailyIncome.total_income).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {dailyIncome.bills_count} paid bills |{" "}
                  {todaysBills.length} total bills today
                </p>
              </div>
              <div className="bg-green-500 p-4 rounded-full">
                <Receipt className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== BILLS LIST ===== */}
      <div className="space-y-4">
        {todaysBills.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No bills generated today</p>
          </div>
        ) : (
          todaysBills.map((bill) => (
            <div
              key={bill.id}
              className={`card p-6 ${
                bill.payment_status === "paid"
                  ? "border-l-4 border-green-500 bg-green-50/30"
                  : "border-l-4 border-orange-500"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {/* ===== Header ===== */}
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      Table {bill.table_number}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        bill.payment_status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {bill.payment_status === "paid" ? "PAID" : "PENDING"}
                    </span>
                  </div>

                  {/* ===== Customer Info ===== */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{bill.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{bill.customer_phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(bill.created_at).toLocaleString()}
                      </span>
                    </div>
                    {bill.paid_at && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          Paid at{" "}
                          {new Date(bill.paid_at).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ===== Ordered Items ===== */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Ordered Items:
                    </h4>
                    <div className="space-y-1">
                      {bill.orders?.map((order) =>
                        order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.quantity}x {item.menu_item_name}
                            </span>
                            <span className="font-semibold">
                              ₹{parseFloat(item.price).toFixed(2)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* ===== Totals ===== */}
                  <div className="border-t border-gray-200 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>₹{parseFloat(bill.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span>₹{parseFloat(bill.tax).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-orange-600">
                        ₹{parseFloat(bill.total).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ===== Action Buttons ===== */}
                <div className="ml-6 flex flex-col gap-2">
                  {bill.payment_status === "pending" && (
                    <button
                      onClick={() => {
                        setPaymentModalBillId(bill.id);
                        setSelectedPaymentMode("cash");
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark as Paid
                    </button>
                  )}

                  {bill.payment_status === "paid" && (
                    <button
                      onClick={() => printBill(bill)}
                      className="border border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2"
                    >
                      <Printer className="w-5 h-5" />
                      Print Bill
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===== Payment Modal ===== */}
      {paymentModalBillId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 space-y-5">
            <h3 className="text-lg font-bold">Select Payment Method</h3>

            <div className="space-y-3">
              {["cash", "upi", "card"].map((mode) => (
                <label
                  key={mode}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${
                    selectedPaymentMode === mode
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <span className="capitalize font-medium">{mode}</span>
                  <input
                    type="radio"
                    name="paymentMode"
                    value={mode}
                    checked={selectedPaymentMode === mode}
                    onChange={() => setSelectedPaymentMode(mode)}
                  />
                </label>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setPaymentModalBillId(null)}
                className="flex-1 bg-gray-300 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Hidden Print Layout ===== */}
      {printingBill && restaurant && printSettings && (
        <div style={{ position: 'absolute', left: '-9999px' }}>
          <TableBillPrintLayout
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

export default BillsManagement;