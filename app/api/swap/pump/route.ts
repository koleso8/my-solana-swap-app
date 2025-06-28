
import { type NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/middleware/rateLimiter"
import axios from 'axios'
import { AMM_ENDPOINTS } from '@/config/constants'
import type { SwapRequest } from "@/types/api"

export async function POST(request: NextRequest) {
  try {
    const body: SwapRequest = await request.json()

    // Validate required fields for Pump.fun
    if (!body.fromToken || !body.toToken || !body.amount || !body.walletAddress) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields: fromToken, toToken, amount, walletAddress" 
      }, { status: 400 })
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(request, body.walletAddress)
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ 
        success: false, 
        error: rateLimitResult.error 
      }, { status: 429 })
    }

    // Execute Pump.fun swap using existing logic
    try {
      const response = await axios.post(AMM_ENDPOINTS.PUMP, {
        publicKey: body.walletAddress,
        action: body.fromToken === 'SOL' ? 'buy' : 'sell',
        mint: body.fromToken === 'SOL' ? body.toToken : body.fromToken,
        denominatedInSol: body.fromToken === 'SOL' ? 'true' : 'false',
        amount: body.amount,
        slippage: body.slippage * 100, // Convert to percentage
        priorityFee: 0.00001, // Adjust as needed
        pool: 'pump',
      })

      return NextResponse.json({
        success: true,
        serializedTransaction: response.data, // Returns base58-encoded transaction
      })

    } catch (pumpError) {
      console.error('Pump.fun swap error:', pumpError)
      return NextResponse.json({
        success: false,
        error: 'Failed to execute swap on Pump.fun',
      }, { status: 502 })
    }

  } catch (error) {
    console.error("Pump.fun swap API error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}