import { NextRequest, NextResponse } from 'next/server';
import { createQuote } from '@/lib/sideshift';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { depositCoin, settleCoin, depositAmount, settleAddress } = body;

    if (!depositCoin || !settleCoin || !depositAmount || !settleAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const quote = await createQuote(depositCoin, settleCoin, depositAmount, settleAddress);

    return NextResponse.json(quote);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create quote' },
      { status: 500 }
    );
  }
}
