"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-context";
import { Gamepad2, Trophy, RotateCcw, Home, Wallet, Coins, Cpu, Grid3X3 } from "lucide-react";

type Grid = (number | null)[][];

const COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: "bg-amber-100", text: "text-gray-800" },
  4: { bg: "bg-amber-200", text: "text-gray-800" },
  8: { bg: "bg-orange-300", text: "text-white" },
  16: { bg: "bg-orange-400", text: "text-white" },
  32: { bg: "bg-orange-500", text: "text-white" },
  64: { bg: "bg-orange-600", text: "text-white" },
  128: { bg: "bg-yellow-400", text: "text-white" },
  256: { bg: "bg-yellow-500", text: "text-white" },
  512: { bg: "bg-yellow-600", text: "text-white" },
  1024: { bg: "bg-amber-500", text: "text-white" },
  2048: { bg: "bg-amber-600", text: "text-white" },
};

function createEmptyGrid(): Grid {
  return Array(4).fill(null).map(() => Array(4).fill(null));
}

function addRandomTile(grid: Grid): Grid {
  const newGrid = grid.map(row => [...row]);
  const emptyCells: [number, number][] = [];
  
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (newGrid[r][c] === null) {
        emptyCells.push([r, c]);
      }
    }
  }
  
  if (emptyCells.length > 0) {
    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
  
  return newGrid;
}

function moveLeft(grid: Grid): { grid: Grid; score: number; moved: boolean } {
  let score = 0;
  let moved = false;
  const newGrid = createEmptyGrid();
  
  for (let r = 0; r < 4; r++) {
    const row = grid[r].filter(cell => cell !== null) as number[];
    const merged: number[] = [];
    
    for (let i = 0; i < row.length; i++) {
      if (i + 1 < row.length && row[i] === row[i + 1]) {
        merged.push(row[i] * 2);
        score += row[i] * 2;
        i++;
      } else {
        merged.push(row[i]);
      }
    }
    
    for (let c = 0; c < merged.length; c++) {
      newGrid[r][c] = merged[c];
    }
    
    for (let c = 0; c < 4; c++) {
      if (newGrid[r][c] !== grid[r][c]) {
        moved = true;
      }
    }
  }
  
  return { grid: newGrid, score, moved };
}

function rotateGrid(grid: Grid): Grid {
  const newGrid = createEmptyGrid();
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      newGrid[c][3 - r] = grid[r][c];
    }
  }
  return newGrid;
}

function move(grid: Grid, direction: "up" | "down" | "left" | "right"): { grid: Grid; score: number; moved: boolean } {
  let rotatedGrid = grid;
  let rotations = 0;
  
  switch (direction) {
    case "up":
      rotations = 1;
      break;
    case "right":
      rotations = 2;
      break;
    case "down":
      rotations = 3;
      break;
    default:
      rotations = 0;
  }
  
  for (let i = 0; i < rotations; i++) {
    rotatedGrid = rotateGrid(rotatedGrid);
  }
  
  const result = moveLeft(rotatedGrid);
  
  for (let i = 0; i < (4 - rotations) % 4; i++) {
    result.grid = rotateGrid(result.grid);
  }
  
  return result;
}

function canMove(grid: Grid): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === null) return true;
      if (c + 1 < 4 && grid[r][c] === grid[r][c + 1]) return true;
      if (r + 1 < 4 && grid[r][c] === grid[r + 1][c]) return true;
    }
  }
  return false;
}

function hasWon(grid: Grid): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 2048) return true;
    }
  }
  return false;
}

export default function Game2048Page() {
  const router = useRouter();
  const { account, claim2048Reward } = useWeb3();
  const [grid, setGrid] = useState<Grid>(createEmptyGrid);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const savedWallet = localStorage.getItem("gaming_wallet");
    if (!savedWallet) {
      router.push("/");
      return;
    }
    initGame();
  }, [router]);

  const initGame = () => {
    let newGrid = createEmptyGrid();
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setClaimed(false);
  };

  const handleMove = useCallback((direction: "up" | "down" | "left" | "right") => {
    if (gameOver) return;
    
    const result = move(grid, direction);
    
    if (result.moved) {
      const newGrid = addRandomTile(result.grid);
      setGrid(newGrid);
      const newScore = score + result.score;
      setScore(newScore);
      
      if (hasWon(newGrid) && !won) {
        setWon(true);
        updateHighScore(newScore);
      }
      
      if (!canMove(newGrid)) {
        setGameOver(true);
        updateHighScore(newScore);
      }
    }
  }, [grid, score, gameOver, won]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const direction = e.key.replace("Arrow", "").toLowerCase() as "up" | "down" | "left" | "right";
        handleMove(direction);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleMove]);

  const updateHighScore = (score: number) => {
    const savedWallet = localStorage.getItem("gaming_wallet");
    if (!savedWallet) return;
    
    const users = JSON.parse(localStorage.getItem("gaming_users") || "{}");
    
    const user = users[savedWallet] || {
      username: savedWallet,
      walletAddress: savedWallet,
      totalGames: 0,
      totalWins: 0,
      scores: { chess: 0, tetris: 0, snake: 0, memory: 0, game2048: 0 }
    };
    
    user.scores.game2048 = Math.max(user.scores.game2048, score);
    user.totalGames += 1;
    
    users[savedWallet] = user;
    localStorage.setItem("gaming_users", JSON.stringify(users));
  };

  const handleClaimReward = async () => {
    if (!account || claimed || score < 100) return;
    setClaiming(true);
    const success = await claim2048Reward(score);
    if (success) {
      setClaimed(true);
    }
    setClaiming(false);
  };

  const rewardAmount = Math.floor(score / 100);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-blue-900/10 pointer-events-none" />

      <header className="relative z-10 border-b border-cyan-500/20 bg-black/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Grid3X3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-[family-name:var(--font-orbitron)] text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              2048
            </h1>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="gap-2 border-cyan-500/30 hover:bg-cyan-500/10">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="bg-black/40 px-6 py-3 rounded-xl border border-cyan-500/20">
              <p className="text-xs text-gray-500 uppercase">Score</p>
              <p className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">{score}</p>
            </div>
            <div className="bg-black/40 px-6 py-3 rounded-xl border border-cyan-500/20">
              <p className="text-xs text-gray-500 uppercase">Best</p>
              <p className="text-2xl font-bold text-cyan-400 font-[family-name:var(--font-orbitron)]">{bestScore}</p>
            </div>
          </div>

          {(won || gameOver) && (
            <div className={`px-6 py-3 rounded-xl font-bold ${
              won ? "bg-green-500/20 border border-green-500/30 text-green-400" :
              "bg-red-500/20 border border-red-500/30 text-red-400"
            }`}>
              {won ? "You reached 2048! Keep going or start new game" : "Game Over!"}
            </div>
          )}

          <div className="bg-gray-800 p-3 rounded-xl shadow-2xl">
            <div className="grid grid-cols-4 gap-2">
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const color = cell ? COLORS[cell] || COLORS[2048] : null;
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`
                        w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center
                        font-bold text-xl sm:text-2xl transition-all duration-100
                        ${color ? color.bg : "bg-gray-700"}
                        ${color ? color.text : ""}
                      `}
                    >
                      {cell}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={initGame} variant="outline" className="gap-2 border-cyan-500/30 hover:bg-cyan-500/10">
              <RotateCcw className="w-4 h-4" />
              New Game
            </Button>
            
            {(won || gameOver) && score >= 100 && (
              <>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                  <Trophy className="w-5 h-5 text-cyan-400" />
                  <span className="text-cyan-400 font-bold">Score: {score}</span>
                </div>
                {account && !claimed && (
                  <Button 
                    onClick={handleClaimReward}
                    disabled={claiming}
                    className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  >
                    {claiming ? (
                      <>
                        <Cpu className="w-4 h-4 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4" />
                        Claim {rewardAmount} GAT
                      </>
                    )}
                  </Button>
                )}
                {claimed && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <Coins className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400">{rewardAmount} GAT Claimed!</span>
                  </div>
                )}
                {!account && (
                  <Button variant="outline" onClick={() => router.push("/")} className="gap-2 border-purple-500/30">
                    <Wallet className="w-4 h-4" />
                    Connect Wallet for Rewards
                  </Button>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div />
            <Button 
              variant="outline" 
              onClick={() => handleMove("up")}
              className="border-cyan-500/30 hover:bg-cyan-500/10"
            >
              ↑
            </Button>
            <div />
            <Button 
              variant="outline" 
              onClick={() => handleMove("left")}
              className="border-cyan-500/30 hover:bg-cyan-500/10"
            >
              ←
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleMove("down")}
              className="border-cyan-500/30 hover:bg-cyan-500/10"
            >
              ↓
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleMove("right")}
              className="border-cyan-500/30 hover:bg-cyan-500/10"
            >
              →
            </Button>
          </div>

          <div className="text-sm text-gray-500 text-center max-w-md">
            <p>Use arrow keys or buttons to move tiles.</p>
            <p>Combine matching numbers to reach 2048!</p>
            <p>Earn 1 GAT for every 100 points scored.</p>
          </div>
        </div>
      </main>
    </div>
  );
}