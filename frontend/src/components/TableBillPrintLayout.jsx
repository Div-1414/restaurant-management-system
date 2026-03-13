import React from 'react';

const TableBillPrintLayout = React.forwardRef(
  ({ bill, restaurant, printSettings }, ref) => {
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

        {/* TABLE & CUSTOMER */}
        <p><strong>Table:</strong> {bill.table_number}</p>
        <p><strong>Customer:</strong> {bill.customer_name || 'Guest'}</p>
        <p><strong>Phone:</strong> {bill.customer_phone || '—'}</p>

        <hr className="my-2" />

        {/* ITEMS */}
        {bill.orders?.map((order) =>
          order.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <span>
                {item.quantity}× {item.menu_item_name}
                {item.is_half ? ' (Half)' : ''}
              </span>
              <span>₹{parseFloat(item.price).toFixed(2)}</span>
            </div>
          ))
        )}

        <hr className="my-2" />

        {/* TOTALS */}
        <div className="flex justify-between text-xs text-gray-600">
          <span>Subtotal</span>
          <span>₹{parseFloat(bill.subtotal).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Tax</span>
          <span>₹{parseFloat(bill.tax).toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold mt-1">
          <span>Total</span>
          <span>₹{parseFloat(bill.total).toFixed(2)}</span>
        </div>

        {/* PAYMENT MODE */}
        {bill.payment_mode && (
          <p className="text-xs text-gray-500 mt-1">
            Paid via {bill.payment_mode.toUpperCase()}
          </p>
        )}

        <hr className="my-2" />

        {/* FOOTER */}
        <p className="text-xs text-center text-gray-400">
          Powered by Restro · Restaurant Management System
        </p>
      </div>
    );
  }
);

export default TableBillPrintLayout;