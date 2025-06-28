"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

interface ApiUsageSectionProps {
    hasHolding?: boolean;
    loading?: boolean;
    error?: string | null;
    amount?: number;
}

export function ApiUsageSection({ hasHolding, loading, error, amount }: ApiUsageSectionProps = {}) {
    const { publicKey } = useWallet();
    const [apiStats, setApiStats] = useState<{ remaining: number; total: number } | null>(null);

    useEffect(() => {
        if (loading || !publicKey) {
            setApiStats(publicKey ? { remaining: 100, total: 100 } : null); // Значение по умолчанию
            return;
        }

        if (error) {
            setApiStats({ remaining: 50, total: 100 }); // Значение по умолчанию при ошибке
        } else if (hasHolding !== undefined && amount !== undefined) {
            setApiStats(amount > 0 ? { remaining: Infinity, total: Infinity } : { remaining: 100, total: 100 });
        }
    }, [hasHolding, loading, error, amount, publicKey]);

    if (!publicKey) return null; // Не отображаем, если кошелёк не подключен

    // Класс для анимации золотого переливания
    const sectionClass = hasHolding
        ? "bg-gradient-to-r from-yellow-400 via-yellow-100 to-yellow-200 dark:from-yellow-500 dark:via-yellow-700 dark:to-yellow-600 animate-gold-shimmer p-6 rounded-2xl shadow-lg border border-yellow-100 dark:border-yellow-600"
        : "bg-white dark:bg-gray-900 p-6 rounded-2xl shadow border border-gray-200 dark:border-gray-700";


    return (
        <section className={sectionClass}>

            <h2 className="text-2xl font-semibold mb-4 text-gray-800">API Usage</h2>

            {loading && <p className="text-gray-600 dark:text-gray-300">Checking holding status...</p>}
            {error && apiStats && (
                <div className="space-y-2">
                    <p className="text-gray-600 dark:text-gray-300">
                        Requests remaining: <span className="font-semibold text-gray-800 dark:text-white">{apiStats.remaining}</span>
                    </p>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-3 rounded-full overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-blue-700 h-full transition-width duration-300"
                            style={{ width: `${(apiStats.remaining / apiStats.total) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {!loading && !error && (
                <>
                    {hasHolding ? (
                        <div className="text-yellow-900 dark:text-yellow-300 px-4 py-2 rounded font-bold text-center ">
                            🔥 Unlimited access unlocked 🔥
                        </div>
                    ) : apiStats ? (
                        <div className="space-y-2">
                            <p className="text-gray-600">
                                Requests remaining: <span className="font-semibold text-gray-800">{apiStats.remaining}</span>
                            </p>
                            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-700 h-full transition-width duration-300"
                                    style={{ width: `${(apiStats.remaining / apiStats.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-600">No API usage data available.</p>
                    )}
                </>
            )}
        </section>
    );
}