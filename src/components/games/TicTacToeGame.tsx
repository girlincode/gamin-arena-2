"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-context";
import { Trophy, RotateCcw, X, Circle } from "lucide-react";
import { toast } from "sonner";

type Player = "X" | "O" | null;
type Board = Player[];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6] // diagonals
];

function checkWinner(board: Board): Player | null {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function minimax(board: Board, isMaximizing: boolean): number {
  const winner = checkWinner(board);
  if (winner === "O") return 1;
  if (winner === "X") return -1;
  if (board.every(cell => cell !== null)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "O";
        const score = minimax(board, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "X";
        const score = minimax(board, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function getBestMove(board: Board): number {
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = "O";
      const score = minimax(board, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

export function TicTacToeGame() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost" | "draw">("playing");
  const [claiming, setClaiming] = useState(false);
  const { account, claimTicTacToeReward } = useWeb3();

  const makeAIMove = useCallback(() => {
    if (gameStatus !== "playing" || isPlayerTurn) return;

    setTimeout(() => {
      const newBoard = [...board];
      const bestMove = getBestMove(newBoard);
      
      if (bestMove !== -1) {
        newBoard[bestMove] = "O";
        setBoard(newBoard);
        
        const winner = checkWinner(newBoard);
        if (winner === "O") {
          setGameStatus("lost");
        } else if (newBoard.every(cell => cell !== null)) {
          setGameStatus("draw");
        } else {
          setIsPlayerTurn(true);
        }
      }
    }, 500);
  }, [board, gameStatus, isPlayerTurn]);

  const handleCellClick = (index: number) => {
    if (board[index] !== null || !isPlayerTurn || gameStatus !== "playing") return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setIsPlayerTurn(false);

    const winner = checkWinner(newBoard);
    if (winner === "X") {
      setGameStatus("won");
    } else if (newBoard.every(cell => cell !== null)) {
      setGameStatus("draw");
    } else {
      setTimeout(() => makeAIMove(), 300);
    }
  };

  const handleClaimReward = async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    setClaiming(true);
    try {
      await claimTicTacToeReward();
      toast.success("Reward claimed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to claim reward");
    } finally {
      setClaiming(false);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameStatus("playing");
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Tic Tac Toe</h2>
        <p className="text-gray-400">Beat the AI to earn rewards!</p>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-purple-900/20 p-4 rounded-xl border border-purple-500/30">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            disabled={cell !== null || !isPlayerTurn || gameStatus !== "playing"}
            className="w-20 h-20 bg-black/40 border border-purple-500/30 rounded-lg flex items-center justify-center text-4xl font-bold hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {cell === "X" && <X className="w-12 h-12 text-purple-400" />}
            {cell === "O" && <Circle className="w-12 h-12 text-orange-400" />}
          </button>
        ))}
      </div>

      <div className="text-center">
        {gameStatus === "playing" && (
          <p className="text-gray-400">
            {isPlayerTurn ? "Your turn (X)" : "AI thinking..."}
          </p>
        )}
        {gameStatus === "won" && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-2xl font-bold text-green-400">You Won! 🎉</p>
            {account && (
              <Button
                onClick={handleClaimReward}
                disabled={claiming}
                className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600"
              >
                {claiming ? (
                  "Claiming..."
                ) : (
                  <>
                    <Trophy className="w-4 h-4" />
                    Claim 8 GAT Reward
                  </>
                )}
              </Button>
            )}
          </div>
        )}
        {gameStatus === "lost" && (
          <p className="text-2xl font-bold text-red-400">AI Won! Try again!</p>
        )}
        {gameStatus === "draw" && (
          <p className="text-2xl font-bold text-yellow-400">It's a Draw!</p>
        )}
      </div>

      <Button
        onClick={resetGame}
        variant="outline"
        className="gap-2 border-purple-500/30"
      >
        <RotateCcw className="w-4 h-4" />
        New Game
      </Button>
    </div>
  );
}
