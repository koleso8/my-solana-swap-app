import { useState, useCallback, useEffect, memo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
    Connection,
    VersionedTransaction,
    PublicKey,
    Transaction,
    SystemProgram,
} from "@solana/web3.js";
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { SOLANA_CONFIG } from "@/config/constants";
import { SwapModal } from "@/components/modals/SwapModal";

interface ModalState {
    isSwapModalOpen: boolean;
    isSwapPending: boolean;
    closeSwapModal: () => void;
    setSwapPending: (pending: boolean) => void;
}

interface SwapSectionProps {
    walletAddress: string;
    setTxStatus: (status: string | null) => void;
    clearTxStatus: () => void;
    modalState: ModalState;
}

interface SwapParams {
    fromMint: string;
    toMint: string;
    amount: number;
    slippage: number;
    amm: string;
}

export const SwapSection = memo<SwapSectionProps>(({
    walletAddress,
    setTxStatus,
    clearTxStatus,
    modalState
}) => {
    const { publicKey, signTransaction, sendTransaction } = useWallet();
    const { isSwapModalOpen, isSwapPending, closeSwapModal, setSwapPending } = modalState;
    const [swapParams, setSwapParams] = useState({
        fromToken: "So11111111111111111111111111111111111111112", // SOL
        toToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
        amount: "1",
        amm: "raydium",
        slippage: "0.5",
        walletAddress: walletAddress,
    });
    const [swapResult, setSwapResult] = useState<string | null>(null);
    const [swapError, setSwapError] = useState<string | null>(null);

    // Обновляем адрес кошелька в параметрах свапа
    useEffect(() => {
        setSwapParams((prev) => ({ ...prev, walletAddress }));
    }, [walletAddress]);

    const handleSwapRequest = useCallback(async (params: SwapParams) => {
        if (!publicKey || !signTransaction || !sendTransaction) {
            setSwapError("Wallet not connected or does not support signing");
            return;
        }

        setSwapResult(null);
        setSwapError(null);
        setSwapPending(true);
        setTxStatus("Preparing transaction...");

        try {
            const connection = new Connection(SOLANA_CONFIG.RPC_URL, "confirmed");

            const response = await fetch("/api/swap/raydium", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "wallet-address": publicKey.toString(),
                },
                body: JSON.stringify(params),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                if (data.error.includes("requires client-side creation")) {
                    // Создание токенового аккаунта для output токена
                    setTxStatus("Creating output token account...");
                    const outputMint = new PublicKey(params.toMint);
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

                    const signedTx = await signTransaction(transaction);
                    const txSignature = await sendTransaction(signedTx, connection, {
                        preflightCommitment: "confirmed"
                    });

                    await connection.confirmTransaction(txSignature, "confirmed");
                    setTxStatus("Token account created. Retrying swap...");

                    // Повторный запрос после создания аккаунта
                    const retryResponse = await fetch("/api/swap/raydium", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "wallet-address": publicKey.toString(),
                        },
                        body: JSON.stringify(params),
                    });

                    const retryData = await retryResponse.json();
                    if (!retryResponse.ok || !retryData.success) {
                        setSwapError(retryData.error || "Failed to fetch swap transaction after account creation");
                        return;
                    }
                    data.serializedTransaction = retryData.serializedTransaction;
                } else {
                    setSwapError(data.error || "Failed to fetch swap transaction");
                    return;
                }
            }

            const serializedTx = Buffer.from(data.serializedTransaction, "base64");
            const transaction = VersionedTransaction.deserialize(serializedTx);

            setTxStatus("Signing transaction...");
            const signedTx = await signTransaction(transaction);

            setTxStatus("Sending transaction...");
            const txSignature = await sendTransaction(signedTx, connection, {
                preflightCommitment: "confirmed"
            });

            setTxStatus("Confirming transaction...");
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            await connection.confirmTransaction({
                signature: txSignature,
                blockhash,
                lastValidBlockHeight,
            }, "confirmed");

            setSwapResult(`Transaction successful: https://solscan.io/tx/${txSignature}`);
            setTxStatus("Transaction confirmed!");
        } catch (error: any) {
            setSwapError(error.message || "Failed to execute swap");
            setTxStatus(`Error: ${error.message}`);
        } finally {
            setSwapPending(false);
            clearTxStatus();
        }
    }, [publicKey, signTransaction, sendTransaction, setTxStatus, clearTxStatus, setSwapPending]);

    const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isSwapPending) {
            closeSwapModal();
        }
    }, [isSwapPending, closeSwapModal]);

    const handleOpenSwapModal = useCallback(() => {
        // Эта функция больше не нужна, так как модал открывается через QuickActions
    }, []);

    const handleCloseSwapModal = useCallback(() => {
        closeSwapModal();
    }, [closeSwapModal]);

    return (
        <SwapModal
            isOpen={isSwapModalOpen}
            onClose={handleCloseSwapModal}
            isPending={isSwapPending}
            swapParams={swapParams}
            setSwapParams={setSwapParams}
            handleSwapRequest={handleSwapRequest}
            swapResult={swapResult}
            swapError={swapError}
            onBackdropClick={handleBackdropClick}
            publicKey={publicKey}
        />
    );
});