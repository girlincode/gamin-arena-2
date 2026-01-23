import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection('users');

    const leaderboard = await usersCollection
      .find({})
      .sort({ 'scores.chess': -1, 'scores.tetris': -1, 'scores.snake': -1, totalGames: -1 })
      .limit(100)
      .toArray();

    const formattedLeaderboard = leaderboard.map((user: any) => ({
      username: user.username,
      walletAddress: user.walletAddress,
      totalScore: Object.values(user.scores as Record<string, number>).reduce((a, b) => a + b, 0),
      gamesPlayed: user.totalGames,
      wins: user.totalWins,
      scores: user.scores
    }));

    formattedLeaderboard.sort((a, b) => b.totalScore - a.totalScore);

    return NextResponse.json({ leaderboard: formattedLeaderboard });
  } catch (error: any) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
