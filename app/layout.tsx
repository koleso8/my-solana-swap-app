import type React from "react";
import type { Metadata } from "next";
import ClientWalletProvider from "@/components/ClientWalletProvider";
import "./globals.css";
import { Header } from "@/components/Header";
import "@solana/wallet-adapter-react-ui/styles.css";



export const metadata: Metadata = {
  title: "SolDev.Tools",
  description: "Backend API service for Solana blockchain interactions",
  generator: "SolDev.Tools",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {


  return (
    <html lang="en">
      <body className="pb-8 pt-12">
        <Header />
        <ClientWalletProvider>
          <main>{children}</main>
        </ClientWalletProvider>
      </body>
    </html>
  );
}