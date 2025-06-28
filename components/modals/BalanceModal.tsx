import React, { useState } from 'react';

export function BalanceModal({
    isOpen,
    onClose,
    isPending,
    onBackdropClick,
    walletPublicKey,
}: {
    isOpen: boolean;
    onClose: () => void;
    isPending: boolean;
    onBackdropClick: (e: any, cb: () => void) => void;
    walletPublicKey: string | null;
}) {
    const [balanceResult, setBalanceResult] = useState<string | null>(null);
    const [balanceError, setBalanceError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleBalanceRequest = async () => {
        if (!walletPublicKey) return;

        setBalanceResult(null);
        setBalanceError(null);
        setIsLoading(true);

        try {
            const url = `/api/wallet/balance?publicKey=${walletPublicKey}`;
            const res = await fetch(url);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Unknown error');

            setBalanceResult(JSON.stringify(data, null, 2));
        } catch (err: any) {
            setBalanceError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] "
            onClick={(e) => onBackdropClick(e, onClose)}
        >
            <div
                className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl  dark:bg-gray-900"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-4">Wallet Balance</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-600  dark:text-white">Your wallet</label>
                    <input
                        type="text"
                        value={walletPublicKey || ''}
                        disabled
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                </div>

                <div className="text-sm text-gray-500 mb-2">
                    <code>/api/wallet/balance?publicKey={walletPublicKey}</code>
                </div>

                {balanceResult && (
                    <pre className="mt-4 p-3 bg-gray-100 rounded text-sm whitespace-pre-wrap">
                        {balanceResult}
                    </pre>
                )}
                {balanceError && (
                    <p className="mt-4 text-red-600 text-sm">{balanceError}</p>
                )}

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 dark:text-white text-gray-800 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Close
                    </button>
                    <button
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 dark:text-white text-gray-800 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                        onClick={handleBalanceRequest}
                        disabled={isLoading || !walletPublicKey}
                    >
                        {isLoading && <Spinner />} Check Balance
                    </button>
                </div>
            </div>
        </div>
    );
}

function Spinner() {
    return (
        <svg
            className="animate-spin h-5 w-5 mr-2 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    );
}
