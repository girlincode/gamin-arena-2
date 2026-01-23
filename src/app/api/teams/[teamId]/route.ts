import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    const db = await getDatabase();
    const teamsCollection = db.collection('teams');

    const team = await teamsCollection.findOne({ _id: new ObjectId(teamId) });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(team);
  } catch (error: any) {
    console.error('Team fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const body = await request.json();
    const { action, score, wins, games } = body;

    const db = await getDatabase();
    const teamsCollection = db.collection('teams');

    if (action === 'updateStats') {
      await teamsCollection.updateOne(
        { _id: new ObjectId(teamId) },
        {
          $inc: {
            totalScore: score || 0,
            totalGames: games || 0,
            totalWins: wins || 0,
          },
        }
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Team update error:', error);
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}
