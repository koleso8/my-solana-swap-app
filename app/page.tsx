'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '@/components/WalletButton';
import { BalanceDisplay } from '@/components/BalanceDisplay';
import { TokenHoldingStatus } from '@/components/TokenHoldingStatus';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from "react";

const TOKEN_MINT = process.env.NEXT_PUBLIC_PROJECT_TOKEN_ADDRESS;



export default function HomePage() {
  const { publicKey, wallets, wallet, connecting, connected } = useWallet();

  useEffect(() => {
    if (!wallets?.length) return;   // ждём, пока wallets заполнится
    console.log("Wallets:", wallets);
    console.log("Wallet:", wallet);
    console.log("PublicKey:", publicKey);
  }, [wallets, wallet, publicKey]);


  const isWalletLoading = !wallets;





  return (
    <AnimatePresence mode="wait">
      <div key={isWalletLoading ? 'loading' : 'ready'} className="relative overflow-hidden">
        <HeroSection isWalletLoading={isWalletLoading} />
        <Features />
        <TokenUtility />
        <WalletInfo />
        <BackgroundBlur />
        <footer className="text-center py-6 mt-10 border-t border-gray-200 dark:border-gray-700">
          <p>All Rights Reserved &copy;SOLDEV TOOLS 2025</p>
        </footer>
      </div>
    </AnimatePresence>
  );
}

function HeroSection({ isWalletLoading }: { isWalletLoading: boolean }) {
  return (

    <section className="relative pt-24 pb-32">

      <div className="container mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold leading-tight mb-6"
        >
          Solana API Service
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="max-w-3xl mx-auto text-lg md:text-2xl text-gray-600 mb-10"
        >
          Access powerful Solana blockchain APIs for token swaps, token creation and staking – all in one place.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center"
        >
          {isWalletLoading ? (
            <div className="w-36 h-12 bg-purple-500 rounded-lg animate-pulse" />
          ) : (
            <WalletButton />
          )}
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      title: 'Token Swaps',
      desc: 'Swap tokens across Pump.fun, Raydium and Meteora with best rates.',
    },
    {
      title: 'Token Creation',
      desc: 'Create new tokens on Solana with just a few API calls.',
    },
    {
      title: 'Staking',
      desc: 'Stake tokens across supported AMMs for yield generation.',
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <motion.div
        className="grid md:grid-cols-3 gap-6"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.15 } },
        }}
      >
        {items.map((item) => (
          <motion.div
            key={item.title}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 
                     hover:shadow-md hover:-translate-y-1 transition duration-300 z-50"
          >
            <h3 className="font-semibold text-xl mb-3 text-gray-900 dark:text-gray-100">
              {item.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>

  );
}


function TokenUtility() {

  const [showButtons, setShowButtons] = useState(false);

  const handleClick = () => {
    setShowButtons(true);
  };

  return (
    <section className="relative py-5 md:py-16">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-10 rounded-3xl text-center shadow-inner backdrop-blur-md">
          <h2 className="text-3xl font-bold mb-4">Hold $TOOLS for Unlimited Access</h2>
          <p className="text-gray-700 mb-6">
            Non‑token holders get{" "}
            <span className="font-semibold">{process.env.NEXT_PUBLIC_API_RATE_LIMIT} API calls / day</span>.
            <br className="hidden md:block" />
            Token holders enjoy{" "}
            <span className="font-semibold">unlimited API access</span>.
          </p>
          {!showButtons ? (
            <button
              onClick={handleClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium shadow-md transition"
            >
              Get $TOOLS
            </button>
          ) : (
            <div className="flex justify-center gap-4">
              <a
                href={`https://jup.ag/swap/SOL-${TOKEN_MINT}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <img
                  src="/jup.webp"
                  alt="Jupiter Swap"
                  className="w-12 h-12 rounded-full hover:scale-110 transition"
                />
              </a>
              <a
                href={`https://pump.fun/${TOKEN_MINT}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <img
                  src="/pump.webp"
                  alt="Pump Fun"
                  className="w-12 h-12 rounded-full hover:scale-110 transition"
                />
              </a>
              {/* <a
                href={`https://raydium.io/swap/?inputMint=SOL&outputMint=${TOKEN_MINT}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <img
                  src="/raydium.png"
                  alt="Raydium Swap"
                  className="w-12 h-12 rounded-full hover:scale-110 transition"
                />
              </a>
              <a
                href={`https://www.orca.so/swap?inputMint=SOL&outputMint=${TOKEN_MINT}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <img
                  src="/orca.png"
                  alt="Orca Swap"
                  className="w-12 h-12 rounded-full hover:scale-110 transition"
                />
              </a> */}
            </div>
          )}
        </div>
      </div>
    </section>


  );
}

function WalletInfo() {
  return (
    <section className="container mx-auto px-4 pb-24">
      <motion.div
        className="grid md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <BalanceDisplay />
        <TokenHoldingStatus />
      </motion.div>

    </section>

  );
}

function BackgroundBlur() {
  return (
    <>
      <div className="absolute -left-40 -top-40 w-80 h-80 bg-purple-400/20 rounded-full filter blur-3xl" />
      <div className="absolute -right-40 top-1/2 w-96 h-96 bg-blue-400/20 rounded-full filter blur-3xl" />
    </>
  );
}
