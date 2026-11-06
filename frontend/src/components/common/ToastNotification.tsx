import React, { useState, useEffect } from 'react';
import { toast, ToastItem } from '../../services/toast.service';

export const ToastNotificationItem: React.FC<{
  item: ToastItem;
  onDismiss: (id: string) => void;
}> = ({ item, onDismiss }) => {
  const getIconAndStyle = () => {
    switch (item.type) {
      case 'success':
        return {
          icon: '✓',
          bgBadge: 'bg-emerald-100 text-emerald-700',
          borderColor: 'border-emerald-200',
        };
      case 'warning':
        return {
          icon: '⚠️',
          bgBadge: 'bg-amber-100 text-amber-800',
          borderColor: 'border-amber-200',
        };
      case 'error':
        return {
          icon: '✕',
          bgBadge: 'bg-red-100 text-red-700',
          borderColor: 'border-red-200',
        };
      case 'undo':
        return {
          icon: '↩️',
          bgBadge: 'bg-purple-100 text-purple-700',
          borderColor: 'border-purple-200',
        };
      case 'info':
      default:
        return {
          icon: 'ℹ️',
          bgBadge: 'bg-blue-100 text-[#006194]',
          borderColor: 'border-blue-200',
        };
    }
  };

  const style = getIconAndStyle();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto bg-white rounded-2xl p-4 shadow-xl border ${style.borderColor} flex items-start justify-between gap-3 max-w-sm w-full transform transition-all animate-fadeIn`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={`w-8 h-8 rounded-xl ${style.bgBadge} flex items-center justify-center font-bold text-sm shrink-0 shadow-xs`}
        >
          {style.icon}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-gray-900 leading-snug truncate">
            {item.title}
          </span>
          {item.message && (
            <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5 break-words">
              {item.message}
            </p>
          )}

          {/* Undo Button if applicable */}
          {item.type === 'undo' && item.onUndo && (
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  item.onUndo?.();
                  onDismiss(item.id);
                }}
                className="px-3 py-1 bg-[#006194] text-white rounded-lg text-xs font-bold hover:bg-[#004e77] transition-colors shadow-xs"
              >
                {item.undoLabel || 'Batal'}
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        aria-label="Tutup Notifikasi"
        onClick={() => onDismiss(item.id)}
        className="w-6 h-6 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center text-xs transition-colors shrink-0"
      >
        ✕
      </button>
    </div>
  );
};

export const ToastNotificationContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((items) => {
      setToasts(items);
    });
    return () => unsubscribe();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[70] flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none"
    >
      {toasts.map((item) => (
        <ToastNotificationItem
          key={item.id}
          item={item}
          onDismiss={(id) => toast.dismiss(id)}
        />
      ))}
    </aside>
  );
};

