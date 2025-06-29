import React from 'react';

export function DocsModal({ isOpen, onClose, onBackdropClick }: any) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]"
            onClick={(e) => onBackdropClick(e, onClose)}
        >
            <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">API Documentation</h2>

                <p className="text-gray-400 mb-4">
                    Visit our full documentation at{' '}
                    <a href="/docs" className="text-blue-600 hover:underline dark:text-blue-400">
                        /docs
                    </a>{' '}
                    for detailed guides.
                </p>

                <p className="text-gray-600 mb-2 dark:text-gray-300">Available endpoints:</p>
                <ul className="list-disc pl-5 text-gray-400 space-y-1 dark:text-gray-400">
                    <li>
                        <strong>POST /api/swap/raydium</strong> - Execute token swaps on Raydium.
                    </li>
                    <li>
                        <strong>POST /api/swap/pump</strong> - Execute token swaps on Pump.fun.
                    </li>
                    <li>
                        <strong>POST /api/swap/meteora</strong> - Execute token swaps on Meteora.
                    </li>
                    <li>
                        <strong>POST /api/wallet/holding</strong> - Check if a wallet holds a specific token.
                    </li>
                    <li>
                        <strong>POST /api/create-token</strong> - Create a new token on Pump.fun <span className="text-yellow-500">(coming soon)</span>.
                    </li>
                    <li>
                        <strong>POST /api/stake</strong> - Stake tokens on supported AMMs <span className="text-yellow-500">(coming soon)</span>.
                    </li>
                </ul>

                <div className="mt-6 flex justify-end">
                    <button
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}