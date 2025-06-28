import { type NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/middleware/rateLimiter"
import { createTokenOnPump } from "@/lib/amm-integrations"
import type { CreateTokenRequest } from "@/types/api"

export async function POST(request: NextRequest) {
  try {
    const body: CreateTokenRequest = await request.json()

    // Validate required fields
    if (!body.name || !body.symbol || !body.supply || !body.walletAddress) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(request, body.walletAddress)
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ success: false, error: rateLimitResult.error }, { status: 429 })
    }

    // Create token (currently only supports Pump.fun)
    const result = await createTokenOnPump(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Create token API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
