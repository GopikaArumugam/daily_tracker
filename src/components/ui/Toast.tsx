import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

let toastListeners: Array<(toast: ToastMessage) => void> = [];

export const showToast = (message: string, type: ToastMessage['type'] = 'success') => {
  const id = Math.random().toString(36).substring(2, 9);
  toastListeners.forEach(listener => listener({ id, message, type }));
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (toast: ToastMessage) => {
      setToasts(prev => [...prev, toast]);
      
      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 4000);
    };
    
    toastListeners.push(handleToast);
    return () => {
      toastListeners = toastListeners.filter(listener => listener !== handleToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          let bgColor = 'bg-zinc-900 border-zinc-800 text-zinc-100';
          let Icon = Info;
          let iconColor = 'text-blue-400';
          
          if (toast.type === 'success') {
            bgColor = 'bg-zinc-900/90 border-emerald-500/30 text-zinc-100 dark:bg-zinc-900/95 dark:border-emerald-500/20 light:bg-white/95 light:border-emerald-500/20 light:shadow-emerald-500/5';
            Icon = CheckCircle2;
            iconColor = 'text-emerald-400';
          } else if (toast.type === 'error') {
            bgColor = 'bg-zinc-900/90 border-rose-500/30 text-zinc-100 dark:bg-zinc-900/95 dark:border-rose-500/20 light:bg-white/95 light:border-rose-500/20';
            Icon = AlertCircle;
            iconColor = 'text-rose-400';
          } else if (toast.type === 'info') {
            bgColor = 'bg-zinc-900/90 border-blue-500/30 text-zinc-100 dark:bg-zinc-900/95 dark:border-blue-500/20 light:bg-white/95 light:border-blue-500/20';
            Icon = Info;
            iconColor = 'text-blue-400';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl pointer-events-auto min-w-[280px] max-w-sm ${bgColor}`}
            >
              <span className={iconColor}>
                <Icon size={18} />
              </span>
              <p className="flex-1 font-medium pr-2 text-zinc-800 dark:text-zinc-200">
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-zinc-400 hover:text-zinc-200 transition-colors p-0.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
