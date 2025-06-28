import { useCallback, memo, useEffect } from "react";
import { BalanceDisplay } from "@/components/BalanceDisplay";
import { BalanceModal } from "@/components/modals/BalanceModal";
import { useBalance } from "@/hooks/useBalance";

interface ModalState {
    isBalanceModalOpen: boolean;
    isBalancePending: boolean;
    closeBalanceModal: () => void;
    setBalancePending: (pending: boolean) => void;
}

interface BalanceSectionProps {
    walletAddress: string;
    modalState: ModalState;
}

export const BalanceSection = memo<BalanceSectionProps>(({ walletAddress, modalState }) => {
    const { isBalanceModalOpen, closeBalanceModal } = modalState;
    const { balanceResult, balanceError, isLoading, fetchBalance, clearBalance } = useBalance();

    // Синхронизируем состояние загрузки с modalState
    useEffect(() => {
        modalState.setBalancePending(isLoading);
    }, [isLoading, modalState.setBalancePending]);

    const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isLoading) {
            closeBalanceModal();
        }
    }, [isLoading, closeBalanceModal]);

    const handleCheckBalance = useCallback(() => {
        fetchBalance();
    }, [fetchBalance]);

    return (
        <>
            <BalanceDisplay
                balance={balanceResult}
                error={balanceError}
                onCheckBalance={handleCheckBalance}
                isLoading={isLoading}
            />

            <BalanceModal
                isOpen={isBalanceModalOpen}
                onClose={closeBalanceModal}
                onBackdropClick={handleBackdropClick}
                isPending={isLoading}
                walletPublicKey={walletAddress}
                balanceResult={balanceResult}
                balanceError={balanceError}
            />
        </>
    );
});