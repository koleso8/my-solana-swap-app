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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Fix for dark mode flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (!theme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (_) {}
})();`,
          }}
        />
      </head>
      <body className="pb-8 pt-12">
        <Header />
        <ClientWalletProvider>
          <main>{children}</main>
        </ClientWalletProvider>
      </body>
    </html>
  );
}