"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { TokenHoldingStatus } from "@/components/TokenHoldingStatus";
import { useMemo } from "react";
import { useHoldingStatus } from "@/hooks/useHoldingStatus";
import { SwapSection } from "@/components/dashboard/SwapSection";
import { QuickActions } from "@/components/dashboard/QuickActions";

import { TransactionStatus } from "@/components/dashboard/TransactionStatus";
import { useTransactionStatus } from "@/hooks/useTransactionStatus";
import { useModalState } from "@/hooks/useModalState";
import { ApiUsageSection } from "@/components/ApiUsageSection";
import { BalanceSection } from "@/components/dashboard/BalanceSection";

const WalletButton = dynamic(() => import("@/components/WalletButton").then((mod) => mod.WalletButton), {
  ssr: false,
});

export default function DashboardPage() {
  const { publicKey } = useWallet();
  const { hasHolding, loading, error, amount } = useHoldingStatus();
  const { txStatus, setTxStatus, clearTxStatus } = useTransactionStatus();
  const modalState = useModalState();

  // Мемоизированный публичный ключ в строковом формате
  const walletAddress = useMemo(() => publicKey?.toString() || "", [publicKey]);

  if (!publicKey) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-6 pt-16">Welcome to Dashboard</h1>
        <p className="text-gray-600 mb-8">Connect your wallet to begin</p>
        <WalletButton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-8 pt-4">
        <h1 className="text-4xl font-bold">Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <BalanceSection walletAddress={walletAddress} modalState={modalState} />
          <TokenHoldingStatus hasHolding={hasHolding} loading={loading} error={error} amount={amount} />
        </div>

        <ApiUsageSection hasHolding={hasHolding} loading={loading} error={error} amount={amount} />

        <QuickActions
          walletAddress={walletAddress}
          modalState={modalState}
        />

        <TransactionStatus status={txStatus} />

        <SwapSection
          walletAddress={walletAddress}
          setTxStatus={setTxStatus}
          clearTxStatus={clearTxStatus}
          modalState={modalState}
        />
      </div>
    </div>
  );
}