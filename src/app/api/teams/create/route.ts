import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamName, ownerUsername, ownerWallet } = body;

    if (!teamName || !ownerUsername) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const teamsCollection = db.collection('teams');

    const existingTeam = await teamsCollection.findOne({ teamName });
    if (existingTeam) {
      return NextResponse.json(
        { error: 'Team name already exists' },
        { status: 409 }
      );
    }

    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const team = {
      teamName,
      ownerUsername,
      ownerWallet,
      inviteCode,
      members: [{ username: ownerUsername, walletAddress: ownerWallet, joinedAt: new Date() }],
      totalScore: 0,
      totalGames: 0,
      totalWins: 0,
      createdAt: new Date(),
    };

    const result = await teamsCollection.insertOne(team);

    return NextResponse.json({
      success: true,
      teamId: result.insertedId,
      inviteCode,
      team,
    });
  } catch (error: any) {
    console.error('Team creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}
