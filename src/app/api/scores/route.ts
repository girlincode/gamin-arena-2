import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const scoresCollection = db.collection('scores');

    const scores = await scoresCollection
      .find({ walletAddress: walletAddress.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ scores });
  } catch (error: any) {
    console.error('Get scores error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, username, game, score, won } = body;

    if (!walletAddress || !game || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const scoresCollection = db.collection('scores');
    const usersCollection = db.collection('users');

    const newScore = {
      walletAddress: walletAddress.toLowerCase(),
      username: username || 'Anonymous',
      game,
      score,
      won: won || false,
      createdAt: new Date()
    };

    await scoresCollection.insertOne(newScore);

    const updateData: any = {
      $inc: {
        totalGames: 1
      },
      $max: {
        [`scores.${game}`]: score
      },
      $set: {
        updatedAt: new Date()
      }
    };

    if (won) {
      updateData.$inc.totalWins = 1;
    }

    await usersCollection.updateOne(
      { walletAddress: walletAddress.toLowerCase() },
      updateData
    );

    return NextResponse.json({ 
      score: newScore,
      message: 'Score saved successfully' 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Save score error:', error);
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    );
  }
}
