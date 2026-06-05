import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastNotification = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-6 h-6 text-green-500" />,
    error: <XCircle className="w-6 h-6 text-red-500" />,
    warning: <AlertCircle className="w-6 h-6 text-yellow-500" />,
    info: <Info className="w-6 h-6 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  };

  return (
    <div className="fixed top-5 right-5 z-50 transition-all duration-300 ease-out transform translate-x-0 opacity-100">
      <div className={`flex items-center gap-4 px-5 py-4 rounded-xl shadow-xl border-2 ${bgColors[type]} min-w-[380px] max-w-lg`}>
        {icons[type]}
        <span className={`flex-1 text-base font-semibold ${textColors[type]}`}>{message}</span>
        <button onClick={onClose} className={`${textColors[type]} hover:opacity-70 transition-opacity`}>
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
