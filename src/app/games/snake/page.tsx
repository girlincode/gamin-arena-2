"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Play, Pause, Home } from "lucide-react";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

export default function SnakePage() {
  const router = useRouter();
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef(direction);

  useEffect(() => {
    const savedWallet = localStorage.getItem("gaming_wallet");
    if (!savedWallet) {
      router.push("/");
    }
  }, [router]);

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

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
    
    user.scores.snake = Math.max(user.scores.snake, score);
    user.totalGames += 1;
    
    users[savedWallet] = user;
    localStorage.setItem("gaming_users", JSON.stringify(users));
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      const currentDir = directionRef.current;

      switch (currentDir) {
        case "UP": head.y--; break;
        case "DOWN": head.y++; break;
        case "LEFT": head.x--; break;
        case "RIGHT": head.x++; break;
      }

      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        setIsPaused(true);
        return prevSnake;
      }

      if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setIsPaused(true);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameOver, isPaused, food, generateFood]);

  useEffect(() => {
    if (gameOver && score > 0) {
      updateHighScore(score);
    }
  }, [gameOver, score, updateHighScore]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || !hasStarted) return;

      const keyMap: Record<string, Direction> = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP", W: "UP",
        s: "DOWN", S: "DOWN",
        a: "LEFT", A: "LEFT",
        d: "RIGHT", D: "RIGHT",
      };

      const newDirection = keyMap[e.key];
      if (!newDirection) {
        if (e.key === "p" || e.key === "P") setIsPaused(p => !p);
        return;
      }

      e.preventDefault();
      const opposites: Record<Direction, Direction> = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
      };

      if (opposites[newDirection] !== directionRef.current) {
        setDirection(newDirection);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, hasStarted]);

  useEffect(() => {
    if (!isPaused && !gameOver && hasStarted) {
      const speed = Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 10);
      gameLoopRef.current = setInterval(moveSnake, speed);
    } else if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPaused, gameOver, score, moveSnake, hasStarted]);

  const startGame = () => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection("RIGHT");
    directionRef.current = "RIGHT";
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setHasStarted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-emerald-900/20 pointer-events-none" />

      <header className="relative z-10 border-b border-green-500/20 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-gaming text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              SNAKE
            </h1>
          </Link>
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="gap-2 border-green-500/50 hover:bg-green-500/10">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-8">
            <div className="bg-card/60 backdrop-blur-sm px-6 py-3 rounded-xl border border-green-500/30">
              <span className="text-green-400 font-gaming font-bold text-3xl">{score}</span>
              <span className="text-muted-foreground ml-2">points</span>
            </div>
            {gameOver && (
              <div className="text-red-400 font-bold text-xl animate-pulse">Game Over!</div>
            )}
          </div>

          <div
            className="relative border-4 border-green-500 bg-gray-900 rounded-lg shadow-[0_0_30px_rgba(34,197,94,0.5)]"
            style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
          >
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`absolute rounded-sm transition-all ${index === 0 ? "bg-green-400" : "bg-green-600"}`}
                style={{
                  left: segment.x * CELL_SIZE,
                  top: segment.y * CELL_SIZE,
                  width: CELL_SIZE - 2,
                  height: CELL_SIZE - 2,
                  boxShadow: index === 0 ? "0 0 10px rgba(74, 222, 128, 0.8)" : "none",
                }}
              />
            ))}
            <div
              className="absolute bg-red-500 rounded-full animate-pulse"
              style={{
                left: food.x * CELL_SIZE,
                top: food.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                boxShadow: "0 0 15px rgba(239, 68, 68, 0.8)",
              }}
            />
          </div>

          <div className="flex gap-4">
            {!isPaused && !gameOver && hasStarted ? (
              <Button onClick={() => setIsPaused(true)} variant="outline" className="gap-2 border-green-500/50 hover:bg-green-500/10">
                <Pause className="w-4 h-4" />
                Pause
              </Button>
            ) : (
              <Button onClick={gameOver || !hasStarted ? startGame : () => setIsPaused(false)} className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Play className="w-4 h-4" />
                {gameOver ? "Play Again" : !hasStarted ? "Start Game" : "Resume"}
              </Button>
            )}
          </div>

          {gameOver && score >= 50 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30">
              <Trophy className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-bold">+{score} Points!</span>
            </div>
          )}

          <div className="text-sm text-muted-foreground text-center">
            <p>Arrow Keys or WASD to move • P to pause</p>
            <p>Score 50+ points to add to your total!</p>
          </div>
        </div>
      </main>
    </div>
  );
}