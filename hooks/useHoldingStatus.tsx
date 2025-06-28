import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface HoldingStatus {
    hasHolding: boolean;
    loading: boolean;
    error: string | null;
    amount: number; // Добавляем amount для большей информации
}

export function useHoldingStatus(tokenMintOverride?: string): HoldingStatus {
    const { publicKey } = useWallet();
    const defaultTokenMint = process.env.NEXT_PUBLIC_PROJECT_TOKEN_ADDRESS;
    const tokenMint = tokenMintOverride || defaultTokenMint;

    const [status, setStatus] = useState<HoldingStatus>({
        hasHolding: false,
        loading: false,
        error: null,
        amount: 0,
    });

    useEffect(() => {
        // Сброс состояния, если нет publicKey
        if (!publicKey) {
            setStatus({ hasHolding: false, loading: false, error: null, amount: 0 });
            return;
        }

        // Проверка tokenMint
        if (!tokenMint) {
            console.warn("⚠️ NEXT_PUBLIC_PROJECT_TOKEN_ADDRESS is not set or invalid.");
            setStatus({
                hasHolding: false,
                loading: false,
                error: "Project token address not configured",
                amount: 0,
            });
            return;
        }

        // Асинхронная проверка
        async function checkHolding() {
            setStatus((prev) => ({ ...prev, loading: true, error: null }));
            try {
                const res = await fetch(
                    `/api/wallet/balance?publicKey=${publicKey.toBase58()}&tokenMint=${tokenMint}`
                );
                if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
                const data = await res.json();

                if (!data.success) throw new Error(data.error || "Invalid response from API");

                setStatus({
                    hasHolding: data.holding,
                    loading: false,
                    error: null,
                    amount: data.amount || 0,
                });
            } catch (error: any) {
                setStatus({
                    hasHolding: false,
                    loading: false,
                    error: error.message || "Failed to check holding status",
                    amount: 0,
                });
            }
        }

        checkHolding();
    }, [publicKey, tokenMint]);

    return status;
}