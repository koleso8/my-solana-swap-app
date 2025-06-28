import { NextRequest, NextResponse } from "next/server";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount, TOKEN_PROGRAM_ID, AccountLayout } from "@solana/spl-token";
import { getProgramAccounts } from "@solana/web3.js";
import { getTokenMetadata } from "@/lib/moralisToken";

const RPC_URL = process.env.SOLANA_RPC_URL!;

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();
   // console.log("Received POST request for wallet:", walletAddress);

    if (!walletAddress || !PublicKey.isOnCurve(new PublicKey(walletAddress))) {
      return NextResponse.json(
        { success: false, error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const balance = await getWalletBalance(walletAddress);
    console.log("Balance fetched:", balance);
    return NextResponse.json({ success: true, balances: balance });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch balance" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publicKeyStr = searchParams.get("publicKey");
    const tokenMintStr = searchParams.get("tokenMint");

    // console.log("Received GET request for wallet:", publicKeyStr, "tokenMint:", tokenMintStr);

    if (!publicKeyStr) {
      return NextResponse.json(
        { success: false, error: "Missing publicKey" },
        { status: 400 }
      );
    }

    if (!PublicKey.isOnCurve(new PublicKey(publicKeyStr))) {
      return NextResponse.json(
        { success: false, error: "Invalid publicKey" },
        { status: 400 }
      );
    }

    const connection = new Connection(RPC_URL);
    const userPubkey = new PublicKey(publicKeyStr);

    // Если указан tokenMint, проверяем только этот токен
    if (tokenMintStr) {
      const tokenMint = new PublicKey(tokenMintStr);
      let holding = false;
      let amount = 0;

      try {
        const tokenAccount = await getAssociatedTokenAddress(tokenMint, userPubkey);
        const account = await getAccount(connection, tokenAccount);
        const meta = await getTokenMetadata(tokenMintStr);
        const decimals = meta?.decimals || 6; // Используем decimals из метаданных или 6 по умолчанию
        amount = Number(account.amount) / Math.pow(10, decimals);
        holding = amount > 0;
      } catch (e) {
        console.log("Token account not found or error:", e);
        // Оставляем holding = false и amount = 0
      }

      return NextResponse.json({ success: true, holding, amount });
    }

    // Если tokenMint не указан, возвращаем полный баланс
    const balances = await getWalletBalance(publicKeyStr);
    console.log("Balances fetched:", balances);
    return NextResponse.json({ success: true, balances });
  } catch (err: unknown) {
    console.error("Error in GET request:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Функция getWalletBalance (предполагается, что она импортируется из "@/lib/wallet/getWalletBalance")
async function getWalletBalance(walletAddress: string) {
  const connection = new Connection(RPC_URL);
  const publicKey = new PublicKey(walletAddress);

  console.log('Starting getWalletBalance for:', walletAddress);

  const solBalance = await connection.getBalance(publicKey);
  const sol = solBalance / LAMPORTS_PER_SOL;
  console.log('SOL balance fetched:', sol);

  const tokens: Record<string, { amount: number; symbol: string; name: string; logoURI: string | null }> = {};

  try {
    console.log('Fetching token accounts for:', publicKey.toString());
    const tokenAccounts = await getProgramAccounts(connection, TOKEN_PROGRAM_ID, {
      filters: [
        {
          dataSize: AccountLayout.span,
        },
        {
          memcmp: {
            offset: 32,
            bytes: publicKey.toBase58(),
          },
        },
      ],
    });

    console.log('All token accounts fetched:', tokenAccounts.length);

    const mintsToFetch = new Set<string>();
    const tokenBalances: Record<string, { amount: number; decimals: number }> = {};
    for (const { account } of tokenAccounts) {
      const parsed = AccountLayout.decode(account.data);
      const mint = parsed.mint.toString();
      const meta = await getTokenMetadata(mint);
      const decimals = meta?.decimals || 6;
      const amount = Number(parsed.amount) / Math.pow(10, decimals);
      console.log('Parsed token:', { mint, amount, decimals });
      if (amount > 0 && mint) {
        mintsToFetch.add(mint);
        tokenBalances[mint] = { amount, decimals };
      }
    }
    console.log('Token balances:', tokenBalances);

    const tokenMetaPromises = Array.from(mintsToFetch).map(async (mint) => {
      const meta = await getTokenMetadata(mint);
      return { mint, meta };
    });
    const metaResults = await Promise.all(tokenMetaPromises);

    for (const { mint, meta } of metaResults) {
      const { amount, decimals } = tokenBalances[mint] || { amount: 0, decimals: 6 };
      if (amount > 0) {
        tokens[mint] = {
          amount,
          symbol: meta?.symbol || mint.slice(0, 6) + '...',
          name: meta?.name || 'Unknown',
          logo: meta?.logo || null,
        };
      }
    }
  } catch (e) {
    console.error('Error fetching token accounts:', e.message, e.stack);
  }

  return {
    sol,
    tokens,
  };
}