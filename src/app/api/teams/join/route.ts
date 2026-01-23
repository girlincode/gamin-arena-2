import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inviteCode, username, walletAddress } = body;

    if (!inviteCode || !username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const teamsCollection = db.collection('teams');

    const team = await teamsCollection.findOne({ inviteCode });
    if (!team) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 404 }
      );
    }

    const isMember = team.members?.some(
      (m: { username: string }) => m.username === username
    );
    if (isMember) {
      return NextResponse.json(
        { error: 'Already a member of this team' },
        { status: 409 }
      );
    }

    const newMember = {
      username,
      walletAddress: walletAddress || null,
      joinedAt: new Date(),
    };

    await teamsCollection.updateOne(
      { inviteCode },
      {
        $push: {
          members: newMember as any
        }
      }
    );

    return NextResponse.json({
      success: true,
      teamName: team.teamName,
    });
  } catch (error: any) {
    console.error('Team join error:', error);
    return NextResponse.json(
      { error: 'Failed to join team' },
      { status: 500 }
    );
  }
}