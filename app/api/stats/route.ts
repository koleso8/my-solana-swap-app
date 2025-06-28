import { NextResponse } from 'next/server';

const REQUEST_LIMIT = parseInt(process.env.API_RATE_LIMIT || '50', 10);

// In-memory mock store
const usageMap = new Map<string, number>();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicKey = searchParams.get('publicKey');

    if (!publicKey) {
      return NextResponse.json({ remaining: 0 });
    }

    const used = usageMap.get(publicKey) || 0;
    const remaining = Math.max(REQUEST_LIMIT - used, 0);

    return NextResponse.json({ remaining });
  } catch (e) {
    // Instead of 500, return a fallback
    return NextResponse.json({ remaining: 0 });
  }
}
