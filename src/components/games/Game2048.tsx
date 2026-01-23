"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-context";
import { Trophy, RotateCcw, Loader2 } from "lucide-react";

const GRID_SIZE = 4;

export function Game2048() {
  const { claim2048Reward } = useWeb3();
  const [grid, setGrid] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // Initialize game
  const initGame = useCallback(() => {
    const newGrid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const addRandomTile = (currentGrid: number[][]) => {
    const available = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (currentGrid[i][j] === 0) available.push({ x: i, y: j });
      }
    }
    if (available.length > 0) {
      const randomCell = available[Math.floor(Math.random() * available.length)];
      currentGrid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver || won) return;

    let moved = false;
    const newGrid = grid.map(row => [...row]);
    let newScore = score;

    const rotate = (matrix: number[][]) => {
      const N = matrix.length;
      const res = Array(N).fill(0).map(() => Array(N).fill(0));
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          res[j][N - 1 - i] = matrix[i][j];
        }
      }
      return res;
    };

    let processedGrid = newGrid;
    
    // Rotate grid so we always process left
    if (direction === 'UP') processedGrid = rotate(rotate(rotate(processedGrid)));
    else if (direction === 'RIGHT') processedGrid = rotate(rotate(processedGrid));
    else if (direction === 'DOWN') processedGrid = rotate(processedGrid);

    // Process left move
    for (let i = 0; i < GRID_SIZE; i++) {
      let row = processedGrid[i].filter(x => x !== 0);
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          newScore += row[j];
          row.splice(j + 1, 1);
        }
      }
      while (row.length < GRID_SIZE) row.push(0);
      if (row.join(',') !== processedGrid[i].join(',')) moved = true;
      processedGrid[i] = row;
    }

    // Rotate back
    if (direction === 'UP') processedGrid = rotate(processedGrid);
    else if (direction === 'RIGHT') processedGrid = rotate(rotate(processedGrid));
    else if (direction === 'DOWN') processedGrid = rotate(rotate(rotate(processedGrid)));

    if (moved) {
      addRandomTile(processedGrid);
      setGrid(processedGrid);
      setScore(newScore);

      if (processedGrid.flat().includes(2048) && !won) {
        setWon(true);
      } else if (!canMove(processedGrid)) {
        setGameOver(true);
      }
    }
  }, [grid, score, gameOver, won]);

  const canMove = (currentGrid: number[][]) => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (currentGrid[i][j] === 0) return true;
        if (i < GRID_SIZE - 1 && currentGrid[i][j] === currentGrid[i + 1][j]) return true;
        if (j < GRID_SIZE - 1 && currentGrid[i][j] === currentGrid[i][j + 1]) return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const direction = e.key.replace('Arrow', '').toUpperCase() as 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
        move(direction);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const handleClaim = async () => {
    if (!claim2048Reward) return;
    setClaiming(true);
    try {
      await claim2048Reward(score);
      setWon(false); // Reset won state to prevent double claiming
      alert("Reward claimed successfully!");
    } catch (error) {
      console.error("Failed to claim reward:", error);
    } finally {
      setClaiming(false);
    }
  };

  const getTileColor = (value: number) => {
    const colors: Record<number, string> = {
      2: "bg-gray-200 text-gray-800",
      4: "bg-orange-100 text-gray-800",
      8: "bg-orange-200 text-white",
      16: "bg-orange-300 text-white",
      32: "bg-orange-400 text-white",
      64: "bg-orange-500 text-white",
      128: "bg-yellow-200 text-white",
      256: "bg-yellow-300 text-white",
      512: "bg-yellow-400 text-white",
      1024: "bg-yellow-500 text-white",
      2048: "bg-yellow-600 text-white shadow-[0_0_30px_rgba(255,215,0,0.5)]",
    };
    return colors[value] || "bg-gray-800 text-white";
  };

  return (
    <div className="flex flex-col items-center gap-6 max-w-md mx-auto p-4">
      <div className="flex justify-between items-center w-full bg-card p-4 rounded-xl border border-purple-500/20">
        <div>
          <h3 className="text-sm text-muted-foreground uppercase font-bold">Score</h3>
          <p className="text-2xl font-bold text-white">{score}</p>
        </div>
        <div className="text-right">
          <h3 className="text-sm text-muted-foreground uppercase font-bold">Target</h3>
          <p className="text-2xl font-bold text-yellow-400">2048</p>
        </div>
      </div>

      <div className="relative bg-gray-900 p-4 rounded-xl shadow-2xl border-4 border-gray-800">
        <div className="grid grid-cols-4 gap-3">
          {grid.map((row, i) => (
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-lg flex items-center justify-center text-2xl md:text-3xl font-bold transition-all duration-200 ${getTileColor(cell)}`}
              >
                {cell !== 0 && cell}
              </div>
            ))
          ))}
        </div>

        {(gameOver || won) && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 text-center z-10">
            {won ? (
              <>
                <Trophy className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
                <h3 className="text-3xl font-bold text-white mb-2">You Won!</h3>
                <p className="text-gray-300 mb-6">You reached 2048!</p>
                <div className="flex gap-4">
                  <Button 
                    onClick={handleClaim} 
                    disabled={claiming}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                  >
                    {claiming ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Trophy className="w-4 h-4 mr-2" />
                    )}
                    Claim Reward
                  </Button>
                  <Button onClick={initGame} variant="outline">Play Again</Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-bold text-white mb-2">Game Over</h3>
                <p className="text-gray-300 mb-6">Final Score: {score}</p>
                <Button onClick={initGame} size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 text-sm text-muted-foreground">
        <span>Use arrow keys to move tiles</span>
      </div>
    </div>
  );
}
