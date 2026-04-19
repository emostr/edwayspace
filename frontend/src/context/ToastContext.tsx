'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { registerNetworkErrorHandler } from '@/lib/api';
import styles from '@/components/ui/Toast/Toast.module.css';

type ToastVariant = 'success' | 'error';

interface ToastState {
  message: string;
  variant: ToastVariant;
  visible: boolean;
}

interface ToastContextValue {
  showToast: (message: string, variant: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ message: '', variant: 'success', visible: false });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, variant: ToastVariant) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, variant, visible: true });
    timerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 3000);
  }, []);

  useEffect(() => {
    registerNetworkErrorHandler((msg) => showToast(msg, 'error'));
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <div className={`${styles.toast} ${styles[toast.variant]}`}>
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
