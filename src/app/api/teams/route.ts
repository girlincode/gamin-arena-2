import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDatabase();
    const teamsCollection = db.collection('teams');
    
    const teams = await teamsCollection
      .find({})
      .sort({ totalScore: -1 })
      .toArray();

    return NextResponse.json({ teams });
  } catch (error: any) {
    console.error('Teams fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
