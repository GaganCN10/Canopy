import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const ToastContext = React.createContext();

export const useToast = () => React.useContext(ToastContext);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showError = useCallback((title, message, remedy, duration = 6000) => {
    addToast({ type: 'error', title, message, remedy, duration });
  }, [addToast]);

  const showSuccess = useCallback((title, message, duration = 4000) => {
    addToast({ type: 'success', title, message, remedy: null, duration });
  }, [addToast]);

  const showInfo = useCallback((title, message, remedy, duration = 5000) => {
    addToast({ type: 'info', title, message, remedy, duration });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ showError, showSuccess, showInfo }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`card p-4 border-l-4 ${
                toast.type === 'error'
                  ? 'border-l-red-500 bg-white'
                  : toast.type === 'success'
                  ? 'border-l-green-500 bg-white'
                  : 'border-l-blue-500 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {toast.type === 'error' && (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  {toast.type === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {toast.type === 'info' && (
                    <Info className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-semibold text-sm text-canopy-forest-950">{toast.title}</h4>
                  <p className="text-sm text-canopy-ink-900/80 mt-0.5">{toast.message}</p>
                  {toast.remedy && (
                    <p className="text-xs text-canopy-ink-900/60 mt-1.5 bg-canopy-sand-100 rounded-lg px-2 py-1.5">
                      <span className="font-medium">What to do:</span> {toast.remedy}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 text-canopy-ink-900/40 hover:text-canopy-ink-900/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export { ToastProvider };
