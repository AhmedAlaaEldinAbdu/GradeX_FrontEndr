import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import ToastMessage from '@/shared/components/ToastMessage';
import { useTranslation } from 'react-i18next';

type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

interface ToastData {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
  isRaw?: boolean;
}

interface ToastContextProps {
  showToast: (toast: ToastData) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [toast, setToast] = useState<ToastData | null>(null);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const showToast = (data: ToastData) => {
    if (timeoutId) clearTimeout(timeoutId);

    setToast(data);

    const duration = data.duration ?? 3000;

    const id = setTimeout(() => setToast(null), duration);
    setTimeoutId(id);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          position={(toast.position ?? isRTL) ? 'top-left' : 'top-right'}
          duration={toast.duration}
          isRaw={toast.isRaw}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
