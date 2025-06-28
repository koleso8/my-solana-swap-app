import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token"
import { SOLANA_CONFIG } from "@/config/constants"
import type { WalletBalance } from "@/types/solana"

export const connection = new Connection(SOLANA_CONFIG.RPC_URL, "confirmed")

export async function getWalletBalance(walletAddress: string, tokenAddress?: string): Promise<WalletBalance> {
  try {
    const publicKey = new PublicKey(walletAddress)

    // Get SOL balance
    const solBalance = await connection.getBalance(publicKey)
    const solBalanceInSol = solBalance / LAMPORTS_PER_SOL

    const result: WalletBalance = {
      sol: solBalanceInSol,
      tokens: {},
    }

    if (tokenAddress) {
      // Get specific token balance
      const tokenBalance = await getTokenBalance(walletAddress, tokenAddress)
      result.tokens[tokenAddress] = tokenBalance
    } else {
      // Get all token balances (placeholder - would need to implement token account discovery)
      // This is a simplified version
      result.tokens = {}
    }

    return result
  } catch (error) {
    console.error("Error getting wallet balance:", error)
    throw new Error("Failed to get wallet balance")
  }
}

export async function getTokenBalance(walletAddress: string, tokenAddress: string): Promise<number> {
  try {
    const walletPublicKey = new PublicKey(walletAddress)
    const tokenPublicKey = new PublicKey(tokenAddress)

    const associatedTokenAddress = await getAssociatedTokenAddress(tokenPublicKey, walletPublicKey)

    const tokenAccount = await getAccount(connection, associatedTokenAddress)
    return Number(tokenAccount.amount)
  } catch (error) {
    // Token account doesn't exist or other error
    return 0
  }
}

export async function checkTokenHolding(
  walletAddress: string,
  tokenAddress: string,
): Promise<{ isHolder: boolean; amount: number }> {
  try {
    const balance = await getTokenBalance(walletAddress, tokenAddress)
    return {
      isHolder: balance > 0,
      amount: balance,
    }
  } catch (error) {
    console.error("Error checking token holding:", error)
    return { isHolder: false, amount: 0 }
  }
}
