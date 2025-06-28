import { useState, useCallback, useRef } from "react";

export const useTransactionStatus = () => {
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setStatus = useCallback((status: string | null) => {
    setTxStatus(status);
    
    // Очищаем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Если статус не null, устанавливаем таймер на очистку
    if (status) {
      timeoutRef.current = setTimeout(() => {
        setTxStatus(null);
        timeoutRef.current = null;
      }, 5000);
    }
  }, []);

  const clearStatus = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setTxStatus(null);
  }, []);

  return {
    txStatus,
    setTxStatus: setStatus,
    clearTxStatus: clearStatus,
  };
};