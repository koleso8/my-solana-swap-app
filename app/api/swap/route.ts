import { type NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/middleware/rateLimiter"
import { swapOnPump, swapOnRaydium, swapOnMeteora } from "@/lib/amm-integrations"
import type { SwapRequest } from "@/types/api"

export async function POST(request: NextRequest) {
  try {
    const body: SwapRequest = await request.json()

    // Validate required fields
    if (!body.fromToken || !body.toToken || !body.amount || !body.amm || !body.walletAddress) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(request, body.walletAddress)
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ success: false, error: rateLimitResult.error }, { status: 429 })
    }

    // Execute swap based on AMM
    let result
    switch (body.amm) {
      case "pump":
        result = await swapOnPump(body)
        break
      case "raydium":
        result = await swapOnRaydium(body)
        break
      case "meteora":
        result = await swapOnMeteora(body)
        break
      default:
        return NextResponse.json({ success: false, error: "Unsupported AMM" }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Swap API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
