import { NextRequest, NextResponse } from 'next/server';
import { createFixedShift } from '@/lib/sideshift';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quoteId, settleAddress, refundAddress } = body;

    if (!quoteId || !settleAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const shift = await createFixedShift(quoteId, settleAddress, refundAddress);

    return NextResponse.json(shift);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create shift' },
      { status: 500 }
    );
  }
}
