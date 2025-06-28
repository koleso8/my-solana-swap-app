import React from 'react';

export function DocsModal({ isOpen, onClose, onBackdropClick }: any) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center  z-[1000]"
            onClick={(e) => onBackdropClick(e, onClose)}
        >
            <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">API Documentation</h2>

                <p className="text-gray-600 mb-4">
                    Visit our full documentation at{' '}
                    <a href="/docs" className="text-blue-600 hover:underline">
                        /docs
                    </a>{' '}
                    for detailed guides.
                </p>

                <p className="text-gray-600 mb-2">Available endpoints:</p>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    <li>
                        <strong>POST /api/swap</strong> - Execute token swaps on Pump.fun, Raydium, or Meteora.
                    </li>
                    <li>
                        <strong>POST /api/wallet/holding</strong> - Check if a wallet holds a specific token.
                    </li>
                    <li>
                        <strong>POST /api/create-token</strong> - Create a new token on Pump.fun (coming soon).
                    </li>
                    <li>
                        <strong>POST /api/stake</strong> - Stake tokens on supported AMMs (coming soon).
                    </li>
                </ul>

                <div className="mt-6 flex justify-end">
                    <button className="px-4 py-2 bg-gray-200 rounded-lg" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
