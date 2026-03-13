import React from 'react';

const ParcelBillPrintLayout = React.forwardRef(
  ({ bill, restaurant, printSettings }, ref) => {
    const isPaid = bill?.payment_status === 'paid';

    return (
      <div
        ref={ref}
        className="bg-white p-4 text-sm"
        style={{ width: 300 }}
      >
        {/* LOGO */}
        {printSettings?.show_logo_on_bill && restaurant?.logo && (
          <img
            src={restaurant.logo}
            alt="Logo"
            className="h-14 mx-auto mb-2 object-contain"
            crossOrigin="anonymous"
          />
        )}

        {/* NAME */}
        <h2 className="text-center font-bold mb-1">
          {restaurant?.name}
        </h2>

        {/* ADDRESS */}
        {printSettings?.show_address_on_bill && restaurant?.address && (
          <p className="text-center text-xs text-gray-600">
            {restaurant.address}
          </p>
        )}

        {/* PHONE */}
        {printSettings?.show_phone_on_bill && restaurant?.contact && (
          <p className="text-center text-xs text-gray-600 mb-2">
            {restaurant.contact}
          </p>
        )}

        <hr className="my-2" />

        {/* BILL TYPE HEADER */}
        <p className="text-center text-xs font-semibold text-gray-500 mb-1">
          PARCEL ORDER BILL
        </p>

        {/* PAYMENT STATUS STAMP */}
        <div style={{
          textAlign: 'center',
          margin: '6px 0',
        }}>
          <span style={{
            display: 'inline-block',
            padding: '3px 18px',
            borderRadius: '4px',
            border: `2px solid ${isPaid ? '#16a34a' : '#f59e0b'}`,
            color: isPaid ? '#16a34a' : '#92400e',
            fontWeight: 800,
            fontSize: '0.95rem',
            letterSpacing: '0.1em',
            background: isPaid ? '#f0fdf4' : '#fffbeb',
          }}>
            {isPaid ? '✓ PAID' : '⚠ UNPAID'}
          </span>
        </div>

        {/* PAYMENT MODE (only if paid) */}
        {isPaid && bill?.payment_mode && (
          <p className="text-center text-xs text-gray-500 mb-1">
            Payment: {bill.payment_mode.toUpperCase()}
          </p>
        )}

        <hr className="my-2" />

        {/* CUSTOMER */}
        <p>
          <strong>Customer:</strong>{' '}
          {bill.customer_name || 'Guest'}
        </p>
        <p>
          <strong>Phone:</strong>{' '}
          {bill.customer_phone || '—'}
        </p>

        <hr className="my-2" />

        {/* ITEMS */}
        {bill.items?.map((item) => (
          <div
            key={item.id}
            className="flex justify-between"
          >
            <span>
              {item.quantity}× {item.menu_item_name}
            </span>
            <span>₹{item.price}</span>
          </div>
        ))}

        <hr className="my-2" />

        {/* SUBTOTAL / TAX / TOTAL */}
        {bill.tax > 0 && (
          <>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Subtotal</span>
              <span>₹{bill.subtotal}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Tax</span>
              <span>₹{bill.tax}</span>
            </div>
          </>
        )}

        <div className="flex justify-between font-bold mt-1">
          <span>Total</span>
          <span>₹{bill.total}</span>
        </div>

        <hr className="my-2" />

        {/* FOOTER */}
        <p className="text-xs text-center text-gray-400">
          Powered by Restro · Restaurant Management System
        </p>
      </div>
    );
  }
);

export default ParcelBillPrintLayout;