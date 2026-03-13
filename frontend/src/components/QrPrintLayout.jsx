import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QrPrintLayout = React.forwardRef(
  ({ qrValue, restaurant, printSettings, subtitle }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-white p-6 w-[300px] text-center"
      >
        {/* LOGO */}
        {printSettings?.show_logo_on_qr && restaurant?.logo && (
          <img
            src={restaurant.logo}
            alt="Logo"
            className="h-14 mx-auto mb-2 object-contain"
            crossOrigin="anonymous"
          />
        )}

        {/* NAME */}
        <h2 className="font-bold text-lg mb-1">
          {restaurant?.name}
        </h2>

        {/* CUSTOM TEXT */}
        {printSettings?.qr_custom_text && (
          <p className="text-sm text-gray-600 mb-3">
            {printSettings.qr_custom_text}
          </p>
        )}

        {/* QR */}
        <div className="flex justify-center mb-3">
          <QRCodeCanvas
            value={qrValue}
            size={200}
            level="H"
            includeMargin
          />
        </div>

        {/* SUBTITLE */}
        {subtitle && (
          <p className="text-sm font-medium mb-2">
            {subtitle}
          </p>
        )}

        {/* FIXED FOOTER */}
        <div className="border-t pt-2 text-xs text-gray-400">
          Powered by Restro · Restaurant Management System
        </div>
      </div>
    );
  }
);

export default QrPrintLayout;
