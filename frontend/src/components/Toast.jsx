import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const styles = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-sky-600 text-white',
    warning: 'bg-amber-600 text-white',
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 shrink-0" />,
    info: <Info className="h-5 w-5 shrink-0" />,
    warning: <AlertCircle className="h-5 w-5 shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl animate-in slide-in-from-bottom-5 duration-200 backdrop-blur-md max-w-md">
      <div className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ${styles[type] || styles.success}`}>
        {icons[type]}
        <p className="text-xs font-semibold">{message}</p>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1 opacity-80 hover:opacity-100 transition">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
