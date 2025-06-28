import { NextRequest, NextResponse } from "next/server";
import { RaydiumService } from "@/lib/raydium-service";
import { rateLimit } from "@/lib/rate-limit";
import { Project_Name } from "@/config/constants";

const raydiumService = RaydiumService.getInstance();

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded", errorCode: "RATE_LIMIT" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const walletAddress = req.headers.get("wallet-address") || req.headers.get("x-wallet-address");

    if (!walletAddress) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Wallet address is required", 
          errorCode: "MISSING_WALLET" 
        },
        { status: 400 }
      );
    }

    const swapRequest = {
      ...body,
      walletAddress,
    };

    const result = await raydiumService.prepareSwap(swapRequest);

    if (!result.success) {
      const statusCode = result.errorCode === "INVALID_PARAMS" ? 400 : 500;
      return NextResponse.json(result, { status: statusCode });
    }

    // Добавляем брендинг
    return NextResponse.json({
      ...result,
      meta: {
        provider: Project_Name,
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        amm: "Raydium",
      },
    });
  } catch (error: any) {
    console.error("Swap API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        errorCode: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}