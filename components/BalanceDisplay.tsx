"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState, useCallback } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useHoldingStatus } from "@/hooks/useHoldingStatus";

interface TokenInfo {
  amount: number;
  symbol: string;
  name: string;
  logo: string | null;
}

interface Balance {
  sol: number;
  tokens: Record<string, TokenInfo>;
}

export function BalanceDisplay(onCheckBalance, isLoading) {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(false);
  const { hasHolding } = useHoldingStatus();
  // Получаем баланс
  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const res = await fetch("/api/wallet/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: publicKey.toString() }),
      });
      const data = await res.json();
      if (data.success) {
        setBalance(data.balances as Balance);
      } else {
        setBalance(null);
      }
    } catch (err) {
      console.error(err);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  // Авто‑обновление при смене кошелька
  useEffect(() => {
    if (publicKey) fetchBalance();
    else setBalance(null);
  }, [publicKey, fetchBalance]);

  if (!publicKey) return null;

  const frameHold = hasHolding && "bg-gradient-to-r from-yellow-400 via-yellow-100 to-yellow-200 animate-gold-shimmer p-6 rounded-2xl shadow-lg border border-yellow-100"



  return (
    <div className={`relative w-full max-w-sm rounded-2xl shadow-md bg-gradient-to-br from-indigo-50/60 to-white dark:from-zinc-800 dark:to-zinc-900 p-6 overflow-hidden ${frameHold}`} >
      {/* Декоративное свечение */}
      <span className="absolute -top-12 -left-12 h-32 w-32 bg-indigo-300/30 dark:bg-indigo-600/20 rounded-full blur-3xl" />

      <div className="relative">
        {/* Заголовок + кнопка обновления */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Wallet balance</h3>

          <button
            onClick={fetchBalance}
            className="rounded-full p-2 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            disabled={loading}
          >
            <ArrowPathIcon
              className={`w-5 h-5 ${loading ? "animate-spin" : ""} text-indigo-500`}
            />
          </button>
        </div>

        {/* Содержимое */}
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 w-3/4 rounded-md bg-gray-300/50 dark:bg-zinc-700 animate-pulse" />
            <div className="h-4 w-2/3 rounded-md bg-gray-300/50 dark:bg-zinc-700 animate-pulse" />
          </div>
        ) : balance ? (
          <div className="space-y-4">
            {/* SOL */}
            <div className="flex items-center gap-3">
              <img src="/sol.png" alt="SOL" className="w-6 h-6 rounded-full" />
              <span className="font-medium text-gray-900 dark:text-gray-50">
                {balance.sol.toFixed(4)} SOL
              </span>
            </div>

            {/* Токены */}
            <div className="divide-y divide-gray-200 dark:divide-zinc-700">
              {Object.entries(balance.tokens).map(([address, token]) => (
                <div key={address} className="flex items-center gap-3 py-2">
                  {token.logo && (
                    <img src={token.logo} alt={token.symbol} className="w-5 h-5 rounded-full" />
                  )}
                  <span className="flex-1 truncate text-sm text-gray-700 dark:text-gray-200">
                    {token.symbol}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-50">
                    {typeof token.amount === "number" ? token.amount.toFixed(4) : "0.0000"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Нет данных — нажмите кнопку обновления.</p>
        )}
      </div>
    </div>
  );
}
