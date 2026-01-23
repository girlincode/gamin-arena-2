"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-context";
import { Trophy, RotateCcw, Flag, Bomb } from "lucide-react";
import { toast } from "sonner";

const BOARD_SIZE = 10;
const MINE_COUNT = 15;

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

export function MinesweeperGame() {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const { account, claimMinesweeperReward } = useWeb3();

  const initializeBoard = useCallback(() => {
    const newBoard: Cell[][] = Array(BOARD_SIZE)
      .fill(null)
      .map(() =>
        Array(BOARD_SIZE)
          .fill(null)
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborMines: 0,
          }))
      );

    let minesPlaced = 0;
    while (minesPlaced < MINE_COUNT) {
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = row + dr;
              const nc = col + dc;
              if (
                nr >= 0 &&
                nr < BOARD_SIZE &&
                nc >= 0 &&
                nc < BOARD_SIZE &&
                newBoard[nr][nc].isMine
              ) {
                count++;
              }
            }
          }
          newBoard[row][col].neighborMines = count;
        }
      }
    }

    return newBoard;
  }, []);

  useEffect(() => {
    setBoard(initializeBoard());
    setGameStatus("playing");
    setStartTime(null);
    setElapsedTime(0);
  }, []);

  useEffect(() => {
    if (gameStatus === "playing" && startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStatus, startTime]);

  const revealCell = (row: number, col: number) => {
    if (gameStatus !== "playing" || board[row][col].isRevealed || board[row][col].isFlagged) {
      return;
    }

    if (!startTime) {
      setStartTime(Date.now());
    }

    const newBoard = board.map((r) => r.map((c) => ({ ...c })));
    
    const reveal = (r: number, c: number) => {
      if (
        r < 0 ||
        r >= BOARD_SIZE ||
        c < 0 ||
        c >= BOARD_SIZE ||
        newBoard[r][c].isRevealed ||
        newBoard[r][c].isFlagged
      ) {
        return;
      }

      newBoard[r][c].isRevealed = true;

      if (newBoard[r][c].isMine) {
        setGameStatus("lost");
        return;
      }

      if (newBoard[r][c].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            reveal(r + dr, c + dc);
          }
        }
      }
    };

    reveal(row, col);
    setBoard(newBoard);

    const revealedCount = newBoard.flat().filter((cell) => cell.isRevealed).length;
    if (revealedCount === BOARD_SIZE * BOARD_SIZE - MINE_COUNT) {
      setGameStatus("won");
    }
  };

  const toggleFlag = (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameStatus !== "playing" || board[row][col].isRevealed) return;

    const newBoard = board.map((r) => r.map((c) => ({ ...c })));
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    setBoard(newBoard);
  };

  const handleClaimReward = async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    if (gameStatus !== "won") {
      toast.error("You need to win the game first");
      return;
    }

    setClaiming(true);
    try {
      await claimMinesweeperReward(elapsedTime);
      toast.success(`Reward claimed! Completed in ${elapsedTime} seconds!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to claim reward");
    } finally {
      setClaiming(false);
    }
  };

  const resetGame = () => {
    setBoard(initializeBoard());
    setGameStatus("playing");
    setStartTime(null);
    setElapsedTime(0);
  };

  const getCellColor = (neighborMines: number) => {
    const colors = [
      "text-gray-400",
      "text-blue-400",
      "text-green-400",
      "text-red-400",
      "text-purple-400",
      "text-yellow-400",
      "text-pink-400",
      "text-orange-400",
      "text-cyan-400",
    ];
    return colors[neighborMines] || "text-gray-400";
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Minesweeper</h2>
        <p className="text-gray-400">Clear all cells without hitting mines!</p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="bg-purple-500/20 px-4 py-2 rounded-lg">
            <p className="text-sm text-gray-400">Time</p>
            <p className="text-xl font-bold text-purple-400">{elapsedTime}s</p>
          </div>
          <div className="bg-red-500/20 px-4 py-2 rounded-lg">
            <p className="text-sm text-gray-400">Mines</p>
            <p className="text-xl font-bold text-red-400">{MINE_COUNT}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-1 bg-purple-900/20 p-2 rounded-xl border border-purple-500/30">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => revealCell(rowIndex, colIndex)}
                onContextMenu={(e) => toggleFlag(rowIndex, colIndex, e)}
                className={`w-8 h-8 text-sm font-bold rounded transition-all ${
                  cell.isRevealed
                    ? cell.isMine
                      ? "bg-red-500 text-white"
                      : "bg-gray-700 text-white"
                    : cell.isFlagged
                    ? "bg-yellow-500/50 border-2 border-yellow-500"
                    : "bg-purple-500/30 hover:bg-purple-500/50 border border-purple-500/50"
                }`}
              >
                {cell.isRevealed
                  ? cell.isMine
                    ? <Bomb className="w-5 h-5 mx-auto" />
                    : cell.neighborMines > 0
                    ? <span className={getCellColor(cell.neighborMines)}>{cell.neighborMines}</span>
                    : ""
                  : cell.isFlagged
                  ? <Flag className="w-4 h-4 mx-auto text-yellow-400" />
                  : ""}
              </button>
            ))}
          </div>
        ))}
      </div>

      {gameStatus === "won" && (
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400 mb-4">Congratulations! 🎉</p>
          <p className="text-gray-400 mb-4">You cleared the minefield in {elapsedTime} seconds!</p>
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
                  Claim Reward
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {gameStatus === "lost" && (
        <div className="text-center">
          <p className="text-2xl font-bold text-red-400 mb-2">Game Over!</p>
          <p className="text-gray-400">You hit a mine!</p>
        </div>
      )}

      <div className="text-sm text-gray-500 text-center">
        <p>Left click to reveal • Right click to flag</p>
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
