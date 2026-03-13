import React from 'react';
import QrPrintLayout from './QrPrintLayout';

const QrPreviewModal = ({
  open,
  onClose,
  qrValue,
  restaurant,      // ✅ ADD THIS
  printSettings,
  subtitle,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[360px] relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold mb-4 text-center">
          QR Preview
        </h2>

        {/* PREVIEW CONTENT */}
        <div className="flex justify-center">
          <QrPrintLayout
            qrValue={qrValue}
            restaurant={restaurant}   
            printSettings={printSettings}
            subtitle={subtitle}
          />
        </div>
      </div>
    </div>
  );
};

export default QrPreviewModal;
