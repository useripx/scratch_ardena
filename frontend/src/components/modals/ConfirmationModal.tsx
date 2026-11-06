import React, { useState } from 'react';
import { Modal } from '../common/Modal';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  badgeText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Lanjutkan',
  cancelLabel = 'Batal',
  isDestructive = true,
  badgeText = 'Aksi Destruktif',
  onConfirm,
  onCancel,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        {/* Warning Icon & Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
              isDestructive ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}
          >
            {isDestructive ? '🗑️' : '⚠️'}
          </div>
          <div className="flex flex-col">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit ${
                isDestructive ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {badgeText}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">Konfirmasi diperlukan untuk melanjutkan</span>
          </div>
        </div>

        {/* Message */}
        <p className="text-xs text-gray-700 leading-relaxed bg-[#f7f9fb] p-3.5 rounded-xl border border-gray-200">
          {message}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50 ${
              isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-[#006194] hover:bg-[#004e77]'
            }`}
          >
            {isProcessing ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

