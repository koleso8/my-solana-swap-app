import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { SOLANA_CONFIG } from "@/config/constants";

interface TokenBalance {
    symbol: string;
    amount: number;
}

interface UseBalanceReturn {
    balanceResult: string | null;
    balanceError: string | null;
    isLoading: boolean;
    fetchBalance: () => Promise<void>;
    clearBalance: () => void;
}

export const useBalance = (): UseBalanceReturn => {
    const { publicKey } = useWallet();
    const [balanceResult, setBalanceResult] = useState<string | null>(null);
    const [balanceError, setBalanceError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchBalance = useCallback(async () => {
        if (!publicKey) {
            setBalanceError("Wallet not connected");
            return;
        }

        setBalanceResult(null);
        setBalanceError(null);
        setIsLoading(true);

        try {
            const connection = new Connection(SOLANA_CONFIG.RPC_URL, "confirmed");
            const solBalance = await connection.getBalance(publicKey);
            const tokenBalances: { [key: string]: TokenBalance } = {};

            // Получение баланса токенов (пример для SOL, USDC, USDT)
            const tokenMints = [
                {
                    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                    symbol: "USDC",
                    decimals: 6
                },
                {
                    address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
                    symbol: "USDT",
                    decimals: 6
                },
            ];

            for (const mint of tokenMints) {
                const tokenAccount = await getAssociatedTokenAddress(
                    new PublicKey(mint.address),
                    publicKey
                );

                try {
                    const accountInfo = await getAccount(connection, tokenAccount);
                    tokenBalances[mint.address] = {
                        symbol: mint.symbol,
                        amount: Number(accountInfo.amount) / (10 ** mint.decimals),
                    };
                } catch (e) {
                    // Игнорируем, если токенового аккаунта нет
                }
            }

            let resultString = `SOL Balance: ${(solBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`;

            if (Object.keys(tokenBalances).length > 0) {
                resultString += `\nTokens: ${Object.values(tokenBalances)
                    .map((token) => `${token.symbol}: ${token.amount.toFixed(4)}`)
                    .join(", ")}`;
            }

            setBalanceResult(resultString);
        } catch (err: any) {
            setBalanceError(err.message || "Failed to fetch balance");
        } finally {
            setIsLoading(false);
        }
    }, [publicKey]);

    const clearBalance = useCallback(() => {
        setBalanceResult(null);
        setBalanceError(null);
    }, []);

    return {
        balanceResult,
        balanceError,
        isLoading,
        fetchBalance,
        clearBalance,
    };
};