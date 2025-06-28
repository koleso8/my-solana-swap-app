import { type NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/middleware/rateLimiter"
import { stakeTokens } from "@/lib/amm-integrations"
import type { StakeRequest } from "@/types/api"

export async function POST(request: NextRequest) {
  try {
    const body: StakeRequest = await request.json()

    // Validate required fields
    if (!body.tokenAddress || !body.amount || !body.amm || !body.walletAddress) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(request, body.walletAddress)
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ success: false, error: rateLimitResult.error }, { status: 429 })
    }

    // Execute staking
    const result = await stakeTokens(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Stake API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
