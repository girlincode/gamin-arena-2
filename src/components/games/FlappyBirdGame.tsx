"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-context";
import { Trophy, RotateCcw, Play } from "lucide-react";
import { toast } from "sonner";

const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;
const PIPE_SPEED = 3;
const PIPE_GAP = 150;
const PIPE_WIDTH = 60;

export function FlappyBirdGame() {
  const [birdY, setBirdY] = useState(250);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<Array<{ x: number; topHeight: number }>>([]);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<"waiting" | "playing" | "gameover">("waiting");
  const [claiming, setClaiming] = useState(false);
  const gameLoopRef = useRef<number>();
  const { account, claimFlappyBirdReward } = useWeb3();

  const handleJump = useCallback(() => {
    if (gameStatus === "waiting") {
      setGameStatus("playing");
      setPipes([{ x: 400, topHeight: Math.random() * 200 + 100 }]);
    }
    if (gameStatus === "playing") {
      setBirdVelocity(JUMP_STRENGTH);
    }
  }, [gameStatus]);

  useEffect(() => {
    if (gameStatus !== "playing") return;

    const gameLoop = () => {
      setBirdY((prev) => {
        const newY = Math.max(0, Math.min(500, prev + birdVelocity));
        return newY;
      });
      setBirdVelocity((prev) => prev + GRAVITY);

      setPipes((prev) => {
        const newPipes = prev
          .map((pipe) => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
          .filter((pipe) => pipe.x > -PIPE_WIDTH);

        if (newPipes.length > 0 && newPipes[newPipes.length - 1].x < 200) {
          newPipes.push({
            x: 400,
            topHeight: Math.random() * 200 + 100,
          });
        }

        return newPipes;
      });

      setScore((prev) => {
        const newScore = prev + 0.1;
        return Math.floor(newScore);
      });
    };

    gameLoopRef.current = setInterval(gameLoop, 16) as unknown as number;
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameStatus, birdVelocity]);

  useEffect(() => {
    if (gameStatus !== "playing") return;

    const birdRect = { x: 50, y: birdY, width: 30, height: 30 };
    
    for (const pipe of pipes) {
      const topRect = { x: pipe.x, y: 0, width: PIPE_WIDTH, height: pipe.topHeight };
      const bottomRect = {
        x: pipe.x,
        y: pipe.topHeight + PIPE_GAP,
        width: PIPE_WIDTH,
        height: 500 - pipe.topHeight - PIPE_GAP,
      };

      if (
        birdRect.x < topRect.x + topRect.width &&
        birdRect.x + birdRect.width > topRect.x &&
        birdRect.y < topRect.y + topRect.height &&
        birdRect.y + birdRect.height > topRect.y
      ) {
        setGameStatus("gameover");
        return;
      }

      if (
        birdRect.x < bottomRect.x + bottomRect.width &&
        birdRect.x + birdRect.width > bottomRect.x &&
        birdRect.y < bottomRect.y + bottomRect.height &&
        birdRect.y + birdRect.height > bottomRect.y
      ) {
        setGameStatus("gameover");
        return;
      }
    }

    if (birdY >= 500 || birdY <= 0) {
      setGameStatus("gameover");
    }
  }, [birdY, pipes, gameStatus]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleJump();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleJump]);

  const handleClaimReward = async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    if (score < 20) {
      toast.error("You need at least 20 points to claim a reward");
      return;
    }

    setClaiming(true);
    try {
      await claimFlappyBirdReward(score);
      toast.success(`Reward claimed for ${score} points!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to claim reward");
    } finally {
      setClaiming(false);
    }
  };

  const resetGame = () => {
    setBirdY(250);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setGameStatus("waiting");
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Flappy Bird</h2>
        <p className="text-gray-400">Click or press SPACE to fly!</p>
        <p className="text-xl font-bold text-purple-400 mt-2">Score: {score}</p>
      </div>

      <div
        className="relative w-full max-w-md h-[500px] bg-gradient-to-b from-cyan-500 to-blue-600 rounded-xl border-2 border-purple-500/30 overflow-hidden cursor-pointer"
        onClick={handleJump}
      >
        {gameStatus === "waiting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="text-center">
              <Play className="w-16 h-16 text-white mx-auto mb-4" />
              <p className="text-2xl font-bold text-white">Click to Start</p>
            </div>
          </div>
        )}

        {gameStatus === "gameover" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-400 mb-2">Game Over!</p>
              <p className="text-xl text-white mb-4">Final Score: {score}</p>
              {score >= 20 && account && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClaimReward();
                  }}
                  disabled={claiming}
                  className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 mb-4"
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
          </div>
        )}

        {/* Bird */}
        <div
          className="absolute w-8 h-8 bg-yellow-400 rounded-full border-2 border-orange-500 transition-all"
          style={{
            left: "50px",
            top: `${birdY}px`,
            transform: `rotate(${Math.min(30, birdVelocity * 2)}deg)`,
          }}
        >
          <div className="absolute top-1 left-1 w-2 h-2 bg-black rounded-full"></div>
        </div>

        {/* Pipes */}
        {pipes.map((pipe, index) => (
          <div key={index}>
            <div
              className="absolute bg-green-500 border-2 border-green-700"
              style={{
                left: `${pipe.x}px`,
                top: "0",
                width: `${PIPE_WIDTH}px`,
                height: `${pipe.topHeight}px`,
              }}
            />
            <div
              className="absolute bg-green-500 border-2 border-green-700"
              style={{
                left: `${pipe.x}px`,
                top: `${pipe.topHeight + PIPE_GAP}px`,
                width: `${PIPE_WIDTH}px`,
                height: `${500 - pipe.topHeight - PIPE_GAP}px`,
              }}
            />
          </div>
        ))}
      </div>

      <Button
        onClick={resetGame}
        variant="outline"
        className="gap-2 border-purple-500/30"
      >
        <RotateCcw className="w-4 h-4" />
        Reset Game
      </Button>
    </div>
  );
}
