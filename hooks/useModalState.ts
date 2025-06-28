import { useState, useCallback } from "react";

interface ModalState {
  isSwapModalOpen: boolean;
  isBalanceModalOpen: boolean;
  isDocsModalOpen: boolean;
}

export const useModalState = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isSwapModalOpen: false,
    isBalanceModalOpen: false,
    isDocsModalOpen: false,
  });

  const [pendingState, setPendingState] = useState({
    isSwapPending: false,
    isBalancePending: false,
  });

  const openSwapModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isSwapModalOpen: true }));
  }, []);

  const closeSwapModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isSwapModalOpen: false }));
  }, []);

  const openBalanceModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isBalanceModalOpen: true }));
  }, []);

  const closeBalanceModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isBalanceModalOpen: false }));
  }, []);

  const openDocsModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isDocsModalOpen: true }));
  }, []);

  const closeDocsModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isDocsModalOpen: false }));
  }, []);

  const setSwapPending = useCallback((pending: boolean) => {
    setPendingState(prev => ({ ...prev, isSwapPending: pending }));
  }, []);

  const setBalancePending = useCallback((pending: boolean) => {
    setPendingState(prev => ({ ...prev, isBalancePending: pending }));
  }, []);

  const isAnyPending = pendingState.isSwapPending || pendingState.isBalancePending;

  return {
    ...modalState,
    ...pendingState,
    isAnyPending,
    openSwapModal,
    closeSwapModal,
    openBalanceModal,
    closeBalanceModal,
    openDocsModal,
    closeDocsModal,
    setSwapPending,
    setBalancePending,
  };
};