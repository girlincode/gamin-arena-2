"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-context";
import { Trophy, Play, Pause } from "lucide-react";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

export function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const { account, claimSnakeReward } = useWeb3();
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef(direction);

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
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;

      const keyMap: Record<string, Direction> = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP",
        s: "DOWN",
        a: "LEFT",
        d: "RIGHT",
      };

      const newDirection = keyMap[e.key];
      if (!newDirection) {
        if (e.key === "p" || e.key === "P") setIsPaused(p => !p);
        return;
      }

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
  }, [gameOver]);

  useEffect(() => {
    if (!isPaused && !gameOver) {
      const speed = Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 10);
      gameLoopRef.current = setInterval(moveSnake, speed);
    } else if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPaused, gameOver, score, moveSnake]);

  const startGame = () => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection("RIGHT");
    directionRef.current = "RIGHT";
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  const handleClaimReward = async () => {
    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }
    if (score < 50) {
      alert("Minimum score of 50 required to claim rewards!");
      return;
    }
    setClaiming(true);
    const success = await claimSnakeReward(score);
    if (success) {
      const multiplier = score >= 200 ? 3 : score >= 100 ? 2 : 1;
      alert(`Reward claimed successfully! ${3 * multiplier} GAME tokens added to your wallet.`);
    }
    setClaiming(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="flex items-center gap-8">
        <div className="bg-gray-800 px-6 py-3 rounded-lg">
          <span className="text-green-400 font-bold text-2xl">{score}</span>
          <span className="text-gray-400 ml-2">points</span>
        </div>
        {gameOver && (
          <div className="text-red-400 font-bold text-xl animate-pulse">Game Over!</div>
        )}
      </div>

      <div
        className="relative border-4 border-green-500 bg-gray-900 shadow-[0_0_30px_rgba(34,197,94,0.5)]"
        style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`absolute rounded-sm ${index === 0 ? "bg-green-400" : "bg-green-600"}`}
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
        {!isPaused && !gameOver ? (
          <Button onClick={() => setIsPaused(true)} variant="outline" className="gap-2">
            <Pause className="w-4 h-4" />
            Pause
          </Button>
        ) : (
          <Button onClick={gameOver ? startGame : () => setIsPaused(false)} className="gap-2 bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4" />
            {gameOver ? "Play Again" : snake.length === 1 && score === 0 ? "Start Game" : "Resume"}
          </Button>
        )}

        {gameOver && score >= 50 && (
          <Button
            onClick={handleClaimReward}
            disabled={claiming || !account}
            className="gap-2 bg-gradient-to-r from-green-500 to-cyan-500"
          >
            <Trophy className="w-4 h-4" />
            {claiming ? "Claiming..." : "Claim Reward"}
          </Button>
        )}
      </div>

      <div className="text-xs text-gray-400 space-y-1 text-center">
        <p>Arrow Keys or WASD to move</p>
        <p>P to pause</p>
      </div>
    </div>
  );
}
