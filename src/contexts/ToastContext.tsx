import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastContextType } from '../types';
import { generateSecureId } from '../utils/security';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' | 'warning',
    duration: number = 3000
  ) => {
    const id = generateSecureId();
    const toast: Toast = { id, message, type, duration };

    setToasts(prev => [...prev, toast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearToasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

/**
 * Toast notification container component
 */
const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const bgColor = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500'
  };

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ⓘ',
    warning: '⚠'
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            ${bgColor[toast.type]} text-white px-6 py-4 rounded-xl shadow-lg
            flex items-center gap-3 animate-fade-in-up pointer-events-auto
            cursor-pointer hover:shadow-xl transition-shadow
          `}
          onClick={() => removeToast(toast.id)}
        >
          <span className="font-bold text-lg">{icon[toast.type]}</span>
          <span className="font-medium flex-1">{toast.message}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
            className="ml-2 hover:opacity-70 transition opacity-70"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
