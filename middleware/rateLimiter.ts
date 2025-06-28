import type { NextRequest } from "next/server"
import { checkTokenHolding } from "@/lib/solana"
import { SOLANA_CONFIG } from "@/config/constants"

// In-memory store for rate limiting (use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export async function checkRateLimit(
  request: NextRequest,
  walletAddress: string,
): Promise<{ allowed: boolean; error?: string }> {
  try {
    // Check if wallet holds project token
    const holding = await checkTokenHolding(walletAddress, SOLANA_CONFIG.PROJECT_TOKEN_ADDRESS)

    if (holding.isHolder) {
      // Token holders get unlimited access
      return { allowed: true }
    }

    // Check rate limit for non-holders
    const now = Date.now()
    const dayInMs = 24 * 60 * 60 * 1000
    const key = `${walletAddress}:${Math.floor(now / dayInMs)}`

    const current = requestCounts.get(key) || { count: 0, resetTime: now + dayInMs }

    if (current.count >= SOLANA_CONFIG.API_RATE_LIMIT) {
      return {
        allowed: false,
        error: `Rate limit exceeded. Hold $TOKEN for unlimited access. Limit resets in ${Math.ceil((current.resetTime - now) / (60 * 60 * 1000))} hours.`,
      }
    }

    // Increment counter
    requestCounts.set(key, { ...current, count: current.count + 1 })

    return { allowed: true }
  } catch (error) {
    console.error("Rate limit check error:", error)
    return { allowed: false, error: "Failed to check rate limit" }
  }
}

export function getRemainingRequests(walletAddress: string): number {
  const now = Date.now()
  const dayInMs = 24 * 60 * 60 * 1000
  const key = `${walletAddress}:${Math.floor(now / dayInMs)}`

  const current = requestCounts.get(key)
  if (!current) return SOLANA_CONFIG.API_RATE_LIMIT

  return Math.max(0, SOLANA_CONFIG.API_RATE_LIMIT - current.count)
}
