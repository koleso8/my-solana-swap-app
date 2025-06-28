import { Project_Domain } from "@/config/constants";
import React, { useEffect, useState } from "react";
import {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
} from "@solana/web3.js";

// -------------------- types --------------------
interface QuoteResponse {
    success: boolean;
    data: {
        inputAmount: string; // atomic units
        outputAmount: string; // atomic units
        priceImpact: number;
        minimumReceived: string; // atomic units
        fees: {
            networkFee: number; // lamports
            platformFee: number;
        };
        route: string[];
    };
    meta: {
        provider: string;
        version: string;
        timestamp: string;
        amm: string;
    };
}

interface SwapResponse {
    success: boolean;
    data: {
        serializedTransaction: string;
        estimatedOutput: string;
        priceImpact: number;
        fees: {
            networkFee: number;
            platformFee: number;
        };
        route: {
            from: string;
            to: string;
            amount: string;
            amm: string;
        };
    };
    meta: QuoteResponse["meta"];
}

interface ErrorResponse {
    success: false;
    error: string;
    errorCode?: string;
}

// -------------------- helpers --------------------
const safeNumber = (v: string | number | undefined, decimals = 6) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? (n / 10 ** decimals).toFixed(decimals) : "—";
};

// -------------------- component --------------------
export function SwapModal({
    isOpen,
    onClose,
    isPending,
    swapParams,
    setSwapParams,
    handleSwapRequest,
    swapResult,
    swapError,
    onBackdropClick,
    publicKey,
    sendTransaction, // <-- Add this line
    apiBaseUrl = `${Project_Domain}/api`,
}: any) {
    if (!isOpen) return null;

    // Popular tokens with decimals
    const [tokenOptions] = useState([
        { symbol: "SOL", mint: "So11111111111111111111111111111111111111112", name: "Native SOL", decimals: 9 },
        { symbol: "USDC", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", name: "USD Coin", decimals: 6 },
        { symbol: "USDT", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", name: "Tether USD", decimals: 6 },
    ]);

    const [quote, setQuote] = useState<QuoteResponse | null>(null);
    const [isGettingQuote, setIsGettingQuote] = useState(false);
    const [quoteError, setQuoteError] = useState<string | null>(null);

    // Fetch quote
    const fetchQuote = async () => {
        if (!swapParams.fromToken || !swapParams.toToken || !swapParams.amount) return;

        const fromDec = tokenOptions.find((t) => t.mint === swapParams.fromToken)?.decimals ?? 6;
        const atomicAmount = (parseFloat(swapParams.amount) * 10 ** fromDec).toString();

        setIsGettingQuote(true);
        setQuoteError(null);
        setQuote(null);
        try {
            const params = new URLSearchParams({
                fromMint: swapParams.fromToken,
                toMint: swapParams.toToken,
                amount: atomicAmount,
            });
            const res = await fetch(`${apiBaseUrl}/quote/raydium?${params}`);
            const data: QuoteResponse | ErrorResponse = await res.json();
            data.success ? setQuote(data as QuoteResponse) : setQuoteError((data as ErrorResponse).error);
        } catch (e) {
            setQuoteError("Failed to get quote: " + (e as Error).message);
        } finally {
            setIsGettingQuote(false);
        }
    };

    // Debounce quote
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (swapParams.fromToken && swapParams.toToken && swapParams.amount) fetchQuote();
        }, 500);
        return () => clearTimeout(timeout);
    }, [swapParams.fromToken, swapParams.toToken, swapParams.amount]);

    // Handle submit
    const handleSubmit = async () => {
        if (isPending || !publicKey || !swapParams.fromToken || !swapParams.toToken || !swapParams.amount) return;

        const fromDec = tokenOptions.find((t) => t.mint === swapParams.fromToken)?.decimals ?? 6;
        const amountNum = parseFloat(swapParams.amount);
        if (
            !isFinite(amountNum) ||
            amountNum <= 0 ||
            swapParams.fromToken === swapParams.toToken ||
            !quote ||
            !quote.success ||
            !quote.data?.outputAmount ||
            Number(quote.data.outputAmount) === 0
        ) {
            console.warn("Invalid swap parameters, aborting swap");
            return;
        }

        try {
            const body = {
                fromMint: swapParams.fromToken,
                toMint: swapParams.toToken,
                amount: amountNum * 10 ** fromDec,
                slippage: parseFloat(swapParams.slippage) || 0.5,
            };
            const res = await fetch(`${apiBaseUrl}/swap/raydium`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-wallet-address": publicKey.toBase58(),
                },
                body: JSON.stringify(body),
            });

            let data: SwapResponse | ErrorResponse = await res.json();
            if (!res.ok || !data.success) {
                if (!data.success && "error" in data && data.error?.includes("requires client-side creation")) {
                    // Создание токенового аккаунта для output токена
                    const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
                    const outputMint = new PublicKey(swapParams.toToken);
                    const outputTokenAccount = await getAssociatedTokenAddress(outputMint, publicKey);
                    const transaction = new Transaction().add(
                        createAssociatedTokenAccountInstruction(
                            publicKey,
                            outputTokenAccount,
                            publicKey,
                            outputMint,
                            TOKEN_PROGRAM_ID,
                            SystemProgram.programId
                        )
                    );
                    const { blockhash } = await connection.getLatestBlockhash();
                    transaction.recentBlockhash = blockhash;
                    transaction.feePayer = publicKey;

                    const txSignature = await sendTransaction(transaction, connection, { preflightCommitment: "confirmed" });
                    await connection.confirmTransaction(txSignature, "confirmed");

                    // Повторный запрос после создания аккаунта
                    const retryRes = await fetch(`${apiBaseUrl}/swap/raydium`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "x-wallet-address": publicKey.toBase58(),
                        },
                        body: JSON.stringify(body),
                    });
                    const retryData: SwapResponse | ErrorResponse = await retryRes.json();
                    if (!retryRes.ok || !retryData.success) {
                        if ("error" in retryData) {
                            handleSwapRequest({ error: `${retryData.errorCode}: ${retryData.error}` });
                        } else {
                            handleSwapRequest({ error: "Unknown error" });
                        }
                        return;
                    }
                    data = retryData;
                } else if (!data.success && "error" in data && data.error?.includes("Failed to create swap transaction")) {
                    setQuoteError("Swap failed: Pool may not exist or insufficient liquidity. Check token pair.");
                    return;
                } else {
                    if (!data.success && "error" in data) {
                        handleSwapRequest({ error: `${data.errorCode}: ${data.error}` });
                    } else {
                        handleSwapRequest({ error: "Unknown error" });
                    }
                    return;
                }
            }

            await handleSwapRequest({
                serializedTransaction: data.data.serializedTransaction,
                estimatedOutput: data.data.estimatedOutput,
                priceImpact: data.data.priceImpact,
                fees: data.data.fees,
                route: data.data.route,
            });
        } catch (e) {
            console.error("Swap request failed:", e);
            handleSwapRequest({ error: (e as Error).message });
        }
    };

    // Helpers
    const getTokenSymbol = (mint: string) => tokenOptions.find((t) => t.mint === mint)?.symbol ?? mint.slice(0, 8) + "…";

    // -------------------- JSX --------------------
    return (
        <div
            className="fixed inset-0 bg-black/50 dark:bg-gray-900/80 flex items-center justify-center z-[1000] transition-colors duration-300"
            onClick={(e) => onBackdropClick(e, onClose)}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto transition-colors duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Swap Tokens</h2>

                {/* Controls */}
                <div className="space-y-4">
                    {/* From token */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">From Token</label>
                        <select
                            value={swapParams.fromToken}
                            onChange={(e) => setSwapParams({ ...swapParams, fromToken: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            disabled={isPending}
                        >
                            <option value="">Select token</option>
                            {tokenOptions.map((t) => (
                                <option key={t.mint} value={t.mint} className="dark:bg-gray-700">
                                    {t.symbol} - {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* To token */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">To Token</label>
                        <select
                            value={swapParams.toToken}
                            onChange={(e) => setSwapParams({ ...swapParams, toToken: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            disabled={isPending}
                        >
                            <option value="">Select token</option>
                            {tokenOptions.filter((t) => t.mint !== swapParams.fromToken).map((t) => (
                                <option key={t.mint} value={t.mint} className="dark:bg-gray-700">
                                    {t.symbol} - {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Amount</label>
                        <input
                            type="number"
                            value={swapParams.amount}
                            onChange={(e) => setSwapParams({ ...swapParams, amount: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            disabled={isPending}
                            min="0"
                            step="0.000001"
                            placeholder="Enter amount"
                        />
                    </div>

                    {/* Slippage */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Slippage (%)</label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    setSwapParams({ ...swapParams, slippage: (Math.max(0, parseFloat(swapParams.slippage || "0") - 0.01)).toFixed(2) })
                                }
                                className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                                disabled={isPending}
                            >
                                −
                            </button>
                            <input
                                type="number"
                                value={swapParams.slippage || "0.5"}
                                onChange={(e) => setSwapParams({ ...swapParams, slippage: e.target.value })}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                disabled={isPending}
                                min="0"
                                max="100"
                                step="0.01"
                            />
                            <button
                                onClick={() =>
                                    setSwapParams({ ...swapParams, slippage: (parseFloat(swapParams.slippage || "0") + 0.01).toFixed(2) })
                                }
                                className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                                disabled={isPending}
                            >
                                ＋
                            </button>
                        </div>
                    </div>

                    {/* Wallet */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Wallet Address</label>
                        <input
                            type="text"
                            readOnly
                            value={publicKey?.toBase58() || "No wallet connected"}
                            className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                        />
                    </div>

                    {/* Quote block */}
                    {isGettingQuote && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-lg flex items-center gap-2">
                            <Spinner /> <span className="text-blue-700 dark:text-blue-300 text-sm">Getting quote…</span>
                        </div>
                    )}

                    {quote && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg text-sm space-y-1">
                            <h4 className="font-semibold text-green-800 dark:text-green-200">Quote</h4>
                            <div>
                                <strong>Expected output:</strong>{" "}
                                {safeNumber(quote.data.outputAmount, tokenOptions.find((t) => t.mint === swapParams.toToken)?.decimals || 6)}{" "}
                                {getTokenSymbol(swapParams.toToken)}
                            </div>
                            <div>
                                <strong>Minimum received:</strong>{" "}
                                {safeNumber(quote.data.minimumReceived, tokenOptions.find((t) => t.mint === swapParams.toToken)?.decimals || 6)}{" "}
                                {getTokenSymbol(swapParams.toToken)}
                            </div>
                            <div>
                                <strong>Price impact:</strong> {quote.data.priceImpact.toFixed(2)}%
                            </div>
                            <div>
                                <strong>Network fee:</strong> {safeNumber(quote.data.fees.networkFee, 9)} SOL
                            </div>
                            {Number(quote.data.outputAmount) === 0 && (
                                <p className="text-red-600 dark:text-red-400 text-xs mt-2">⚠️ This token pair is likely not supported on Raydium.</p>
                            )}
                        </div>
                    )}

                    {quoteError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-300">
                            Quote error: {quoteError}
                        </div>
                    )}
                    {swapError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-300">
                            Swap error: {swapError}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Close
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center disabled:opacity-50"
                        onClick={handleSubmit}
                        disabled={isPending || !publicKey || !quote || !quote.success}
                    >
                        {isPending && <Spinner />} Execute Swap
                    </button>
                </div>

                {/* Rate limit */}
                <p className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-700 rounded-lg text-xs text-yellow-800 dark:text-yellow-300">
                    <strong>Rate limit:</strong> 30 requests/min. Make sure your wallet is connected.
                </p>
            </div>
        </div>
    );
}

// -------------------- spinner --------------------
function Spinner() {
    return (
        <svg
            className="animate-spin h-5 w-5 mr-2 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    );
}