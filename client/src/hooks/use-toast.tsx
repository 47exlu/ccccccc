import React, { useState, useEffect, useCallback } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  dismissAllToasts: () => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

// Rename to CustomToastProvider to avoid conflicts
export const CustomToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const dismissAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, ...toast }]);

    // Auto dismiss toast after duration
    if (toast.duration !== -1) {
      setTimeout(() => {
        dismissToast(id);
      }, toast.duration || 5000);
    }
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismissToast, dismissAllToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer = () => {
  const context = React.useContext(ToastContext);
  if (!context) return null;

  const { toasts, dismissToast } = context;

  return (
    <div className="fixed top-0 right-0 p-4 w-full max-w-sm z-50 flex flex-col gap-2">
      {toasts.map(({ id, title, description, variant = 'default' }) => (
        <div 
          key={id}
          className={`rounded-md p-4 shadow-lg transition-all transform translate-x-0 opacity-100
                     ${variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-background border'}`}
          role="alert"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`font-medium ${variant === 'destructive' ? 'text-white' : 'text-foreground'}`}>
                {title}
              </h3>
              {description && (
                <div className={`mt-1 text-sm ${variant === 'destructive' ? 'text-white' : 'text-muted-foreground'}`}>
                  {description}
                </div>
              )}
            </div>
            <button
              onClick={() => dismissToast(id)}
              className={`ml-4 inline-flex shrink-0 ${variant === 'destructive' ? 'text-white hover:text-white/80' : 'text-gray-400 hover:text-gray-500'}`}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a CustomToastProvider');
  }
  return context;
};

export default useToast;