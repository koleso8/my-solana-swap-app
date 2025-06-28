"use client";

import { WalletProvider, ConnectionProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

export default function ClientWalletProvider({ children }: { children: React.ReactNode }) {
  const endpoint = RPC_URL;

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  if (!endpoint) {
    console.error("SOLANA_RPC_URL is not configured. Using fallback URL.");
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}