export async function saveGameScore(
  game: 'chess' | 'tetris' | 'snake' | 'memory' | 'game2048',
  score: number,
  won: boolean = false
): Promise<boolean> {
  try {
    const wallet = localStorage.getItem('gaming_wallet');
    if (!wallet) {
      console.error('No wallet found');
      return false;
    }

    const userResponse = await fetch(`/api/users?wallet=${wallet}`);
    if (!userResponse.ok) {
      console.error('User not found');
      return false;
    }

    const { user } = await userResponse.json();

    const response = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: wallet,
        username: user.username,
        game,
        score,
        won
      })
    });

    if (response.ok) {
      console.log(`Score saved: ${game} - ${score} points`);
      return true;
    } else {
      console.error('Failed to save score');
      return false;
    }
  } catch (error) {
    console.error('Error saving score:', error);
    return false;
  }
}
