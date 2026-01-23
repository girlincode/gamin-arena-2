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
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ 
      walletAddress: walletAddress.toLowerCase() 
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, walletAddress } = body;

    if (!username || !walletAddress) {
      return NextResponse.json(
        { error: 'Username and wallet address required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({
      walletAddress: walletAddress.toLowerCase()
    });

    if (existingUser) {
      return NextResponse.json({ 
        user: existingUser,
        message: 'User already exists' 
      });
    }

    const newUser = {
      username,
      walletAddress: walletAddress.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
      scores: {
        chess: 0,
        tetris: 0,
        snake: 0,
        memory: 0,
        game2048: 0,
        tictactoe: 0,
        rockpaperscissors: 0,
        wordle: 0,
        flappybird: 0,
        minesweeper: 0,
        sudoku: 0
      },
      totalGames: 0,
      totalWins: 0
    };

    await usersCollection.insertOne(newUser);

    return NextResponse.json({ 
      user: newUser,
      message: 'User created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, username } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    const updateData: any = {
      updatedAt: new Date()
    };

    if (username) {
      updateData.username = username;
    }

    const result = await usersCollection.updateOne(
      { walletAddress: walletAddress.toLowerCase() },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = await usersCollection.findOne({
      walletAddress: walletAddress.toLowerCase()
    });

    return NextResponse.json({ 
      user: updatedUser,
      message: 'User updated successfully' 
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
