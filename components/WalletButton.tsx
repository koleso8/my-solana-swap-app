"use client";

import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";

// Корректный динамический импорт WalletMultiButton
const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

export function WalletButton() {
  const { wallet, publicKey, disconnect } = useWallet();

  // Проверка, подключен ли Phantom
  const isPhantom = wallet?.adapter.name === "Phantom";

  if (publicKey && !isPhantom) {
    return (
      <div className="text-red-600">
        Only Phantom wallet is supported. Please disconnect and use Phantom.
        <button
          onClick={disconnect}
          className="ml-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return <WalletMultiButton className="!bg-blue-600 !text-white !hover:bg-blue-700 !rounded-lg !px-4 !py-2 !font-medium" />

}