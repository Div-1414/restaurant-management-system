import React from 'react';

const BillPreviewModal = ({
  open,
  onClose,
  restaurant,
  printSettings,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[400px] relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold mb-4 text-center">
          Bill Preview
        </h2>

        <div className="border rounded-lg p-4 text-sm">

          {/* LOGO */}
          {printSettings.show_logo_on_bill && restaurant?.logo && (
            <img
              src={restaurant.logo}
              alt="Logo"
              className="h-14 mx-auto mb-2 object-contain"
            />
          )}

          <h3 className="font-semibold text-center mb-2">
            {restaurant?.name}
          </h3>

          {printSettings.show_address_on_bill && (
            <p className="text-center text-gray-600 text-xs mb-1">
              {restaurant?.address}
            </p>
          )}

          {printSettings.show_phone_on_bill && (
            <p className="text-center text-gray-600 text-xs mb-3">
              {restaurant?.contact}
            </p>
          )}

          <hr className="my-2" />

          <p className="text-gray-500 italic text-center">
            Sample bill items will appear here
          </p>

          <hr className="my-2" />

          <p className="text-xs text-gray-400 text-center">
            Powered by Restro · Restaurant Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default BillPreviewModal;
