import { NextRequest, NextResponse } from 'next/server';
import { getShiftStatus } from '@/lib/sideshift';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shiftId: string }> }
) {
  try {
    const { shiftId } = await params;

    if (!shiftId) {
      return NextResponse.json(
        { error: 'Missing shift ID' },
        { status: 400 }
      );
    }

    const status = await getShiftStatus(shiftId);

    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get shift status' },
      { status: 500 }
    );
  }
}
