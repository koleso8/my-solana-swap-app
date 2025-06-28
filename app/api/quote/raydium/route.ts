import { NextRequest, NextResponse } from "next/server";
import { RaydiumService } from "@/lib/raydium-service";
import { Project_Name } from "@/config/constants";

const raydiumService = RaydiumService.getInstance();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const fromMint = searchParams.get("fromMint");
    const toMint = searchParams.get("toMint");
    const amount = searchParams.get("amount");

    if (!fromMint || !toMint || !amount) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing required parameters: fromMint, toMint, amount",
          errorCode: "MISSING_PARAMS"
        },
        { status: 400 }
      );
    }

    const result = await raydiumService.getQuote({
      fromMint,
      toMint,
      amount: parseFloat(amount),
    });

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
    console.error("Quote API error:", error);
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