import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  AccountLayout,
  getAccount,
  getAssociatedTokenAddress
} from "@solana/spl-token";
import { getTokenMetadata } from "@/lib/moralisToken";

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const PROJECT_TOKEN_ADDRESS = process.env.PROJECT_TOKEN_ADDRESS || "";

export async function getWalletBalance(walletAddress: string) {
  const connection = new Connection(RPC_URL, "confirmed");
  const publicKey = new PublicKey(walletAddress);

  const solBalance = await connection.getBalance(publicKey);
  const sol = solBalance / LAMPORTS_PER_SOL;

  const tokens: Record<
    string,
    { amount: number; symbol: string; name: string; logo: string | null }
  > = {};

  try {
    const tokenAccounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
      filters: [
        { dataSize: AccountLayout.span },
        {
          memcmp: {
            offset: 32,
            bytes: publicKey.toBase58()
          }
        }
      ]
    });

    const mintsToFetch = new Set<string>();
    const tokenBalances: Record<string, { amount: number; decimals: number }> = {};

    for (const { account } of tokenAccounts) {
      const parsed = AccountLayout.decode(account.data);
      const mint = parsed.mint.toString();
      const meta = await getTokenMetadata(mint);
      const decimals = Number(meta?.decimals || 6);
      const amount = Number(parsed.amount) / Math.pow(10, decimals);

      mintsToFetch.add(mint);
      tokenBalances[mint] = { amount, decimals };

    }

    const tokenMetaResults = await Promise.all(
      Array.from(mintsToFetch).map(async (mint) => ({
        mint,
        meta: await getTokenMetadata(mint)
      }))
    );

    for (const { mint, meta } of tokenMetaResults) {
      const { amount } = tokenBalances[mint] || { amount: 0 };
      tokens[mint] = {
        amount,
        symbol: meta?.symbol || mint.slice(0, 6) + "...",
        name: meta?.name || "Unknown",
        logo: meta?.logo || null
      };
    }
  } catch (e) {
    console.error("Error fetching token accounts:", e);
  }

  // <CheckCircle size={20}  color={'green'}/> ДОБАВЛЕНИЕ ТОКЕНА ПРОЕКТА ЕСЛИ ЕГО НЕТ
  if (PROJECT_TOKEN_ADDRESS && !tokens[PROJECT_TOKEN_ADDRESS]) {
    try {
      const ata = await getAssociatedTokenAddress(
        new PublicKey(PROJECT_TOKEN_ADDRESS),
        publicKey
      );
      const acc = await getAccount(connection, ata);
      const meta = await getTokenMetadata(PROJECT_TOKEN_ADDRESS);
      const decimals = Number(meta?.decimals || 6);
      const amount = Number(acc.amount) / Math.pow(10, decimals);

      tokens[PROJECT_TOKEN_ADDRESS] = {
        amount,
        symbol: meta?.symbol || PROJECT_TOKEN_ADDRESS.slice(0, 6) + "...",
        name: meta?.name || "Unknown",
        logo: meta?.logo || null
      };
    } catch (e) {
      console.warn("Project token not found in wallet (ATA not found):", e.message);
      const meta = await getTokenMetadata(PROJECT_TOKEN_ADDRESS);
      tokens[PROJECT_TOKEN_ADDRESS] = {
        amount: 0,
        symbol: meta?.symbol || PROJECT_TOKEN_ADDRESS.slice(0, 6) + "...",
        name: meta?.name || "Unknown",
        logo: meta?.logo || null
      };
    }
  }

  return {
    sol,
    tokens
  };
}
