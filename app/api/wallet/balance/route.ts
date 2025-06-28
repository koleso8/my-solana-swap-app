import { NextRequest, NextResponse } from "next/server";
import { getWalletBalance } from "@/lib/wallet/getWalletBalance";

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();
    const balance = await getWalletBalance(walletAddress);
    return NextResponse.json({ success: true, balances: balance });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch balance' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("publicKey");
    const tokenMint = searchParams.get("tokenMint");



    
    
    if (!walletAddress) {
      return NextResponse.json({ success: false, error: "Missing publicKey" }, { status: 400 });
    }

    const balances = await getWalletBalance(walletAddress);

    if (tokenMint) {
      const amount = balances.tokens?.[tokenMint]?.amount ?? 0;
      return NextResponse.json({
        success: true,
        holding: amount > 0,
        amount,
      });
    }
    console.log("Requested mint:", tokenMint);
console.log("Available balances:", Object.keys(balances.tokens || {}));

    return NextResponse.json({ success: true, balances });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

