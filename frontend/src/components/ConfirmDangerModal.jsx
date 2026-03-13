import React, { useState } from 'react';

import { X, AlertTriangle } from 'lucide-react';



const ConfirmDangerModal = ({
  open,
  title = 'Are you sure?',
  description,
  warning,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {

  const [shake, setShake] = useState(false);


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className={`bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative
  ${shake ? 'animate-danger-shake' : ''}`}>
        
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 text-red-600 p-3 rounded-full">
            <AlertTriangle />
          </div>
          <h2 className="text-lg font-bold text-red-600">{title}</h2>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4">{description}</p>

        {/* Warning box */}
        {warning && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-5">
            ⚠️ {warning}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 rounded-lg py-2 text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </button>

          <button
  onClick={() => {
    setShake(true);
    setTimeout(() => {
      setShake(false);
      onConfirm();
    }, 300);
  }}
  className="flex-1 bg-red-600 text-white rounded-lg py-2 hover:bg-red-700"
>
  {confirmText}
</button>

        </div>
      </div>
    </div>
  );
};

export default ConfirmDangerModal;
