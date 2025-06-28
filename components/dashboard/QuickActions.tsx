import { useCallback, memo } from "react";
import { DocsModal } from "@/components/modals/DocsModal";

interface ModalState {
    isSwapModalOpen: boolean;
    isBalanceModalOpen: boolean;
    isDocsModalOpen: boolean;
    isSwapPending: boolean;
    isBalancePending: boolean;
    isAnyPending: boolean;
    openSwapModal: () => void;
    closeSwapModal: () => void;
    openBalanceModal: () => void;
    closeBalanceModal: () => void;
    openDocsModal: () => void;
    closeDocsModal: () => void;
    setSwapPending: (pending: boolean) => void;
    setBalancePending: (pending: boolean) => void;
}

interface QuickActionsProps {
    walletAddress: string;
    modalState: ModalState;
}

interface ActionCardProps {
    title: string;
    desc: string;
    onClick: () => void;
    disabled?: boolean;
}

const ActionCard = memo<ActionCardProps>(({ title, desc, onClick, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`p-5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 
                  rounded-2xl text-left shadow-sm transition duration-200 
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
        </button>
    );
});

export const QuickActions = memo<QuickActionsProps>(({
    walletAddress,
    modalState
}) => {
    const {
        isDocsModalOpen,
        isAnyPending,
        openSwapModal,
        openBalanceModal,
        openDocsModal,
        closeDocsModal
    } = modalState;

    const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isAnyPending) {
            closeDocsModal();
        }
    }, [isAnyPending, closeDocsModal]);

    const handleSwapClick = useCallback(() => {
        openSwapModal();
    }, [openSwapModal]);

    const handleBalanceClick = useCallback(() => {
        openBalanceModal();
    }, [openBalanceModal]);

    const handleDocsClick = useCallback(() => {
        openDocsModal();
    }, [openDocsModal]);

    return (
        <>
            <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Quick Actions
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <ActionCard
                        title="Test Swap API"
                        desc="Try a sample token swap"
                        onClick={handleSwapClick}
                        disabled={isAnyPending}
                    />
                    <ActionCard
                        title="Check Balance"
                        desc="View wallet balances"
                        onClick={handleBalanceClick}
                        disabled={isAnyPending}
                    />
                    <ActionCard
                        title="View Docs"
                        desc="Read API documentation"
                        onClick={handleDocsClick}
                        disabled={isAnyPending}
                    />
                </div>
            </section>

            <DocsModal
                isOpen={isDocsModalOpen}
                onClose={closeDocsModal}
                onBackdropClick={handleBackdropClick}
            />
        </>
    );
});