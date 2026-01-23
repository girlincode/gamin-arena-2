"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-context";
import { Trophy, Play, Pause, RotateCcw } from "lucide-react";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: "#00f5ff" },
  O: { shape: [[1, 1], [1, 1]], color: "#ffd700" },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: "#9b59b6" },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: "#2ecc71" },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "#e74c3c" },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: "#3498db" },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: "#e67e22" },
};

type TetrominoKey = keyof typeof TETROMINOS;

interface Piece {
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

export function TetrisGame() {
  const [board, setBoard] = useState<(string | null)[][]>(() =>
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrominoKey | null>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const { account, claimTetrisReward } = useWeb3();
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomPiece = (): TetrominoKey => {
    const pieces = Object.keys(TETROMINOS) as TetrominoKey[];
    return pieces[Math.floor(Math.random() * pieces.length)];
  };

  const createPiece = (type: TetrominoKey): Piece => {
    const tetro = TETROMINOS[type];
    return {
      shape: tetro.shape,
      color: tetro.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetro.shape[0].length / 2),
      y: 0,
    };
  };

  const isValidMove = useCallback((piece: Piece, boardState: (string | null)[][]): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x;
          const newY = piece.y + y;
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return false;
          if (newY >= 0 && boardState[newY][newX]) return false;
        }
      }
    }
    return true;
  }, []);

  const rotatePiece = useCallback((piece: Piece): Piece => {
    const newShape = piece.shape[0].map((_, i) =>
      piece.shape.map(row => row[i]).reverse()
    );
    return { ...piece, shape: newShape };
  }, []);

  const mergePieceToBoard = useCallback((piece: Piece, boardState: (string | null)[][]): (string | null)[][] => {
    const newBoard = boardState.map(row => [...row]);
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] && piece.y + y >= 0) {
          newBoard[piece.y + y][piece.x + x] = piece.color;
        }
      }
    }
    return newBoard;
  }, []);

  const clearLines = useCallback((boardState: (string | null)[][]): { newBoard: (string | null)[][]; clearedLines: number } => {
    const newBoard = boardState.filter(row => row.some(cell => !cell));
    const clearedLines = BOARD_HEIGHT - newBoard.length;
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }
    return { newBoard, clearedLines };
  }, []);

  const moveDown = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    const newPiece = { ...currentPiece, y: currentPiece.y + 1 };
    
    if (isValidMove(newPiece, board)) {
      setCurrentPiece(newPiece);
    } else {
      const newBoard = mergePieceToBoard(currentPiece, board);
      const { newBoard: clearedBoard, clearedLines } = clearLines(newBoard);
      
      if (clearedLines > 0) {
        const points = [0, 100, 300, 500, 800][clearedLines] * level;
        setScore(s => s + points);
        setLines(l => {
          const newLines = l + clearedLines;
          setLevel(Math.floor(newLines / 10) + 1);
          return newLines;
        });
      }
      
      setBoard(clearedBoard);
      
      const next = nextPiece || getRandomPiece();
      const newPieceObj = createPiece(next);
      
      if (!isValidMove(newPieceObj, clearedBoard)) {
        setGameOver(true);
        setIsPaused(true);
      } else {
        setCurrentPiece(newPieceObj);
        setNextPiece(getRandomPiece());
      }
    }
  }, [currentPiece, board, gameOver, isPaused, isValidMove, mergePieceToBoard, clearLines, level, nextPiece]);

  const moveHorizontal = useCallback((dir: number) => {
    if (!currentPiece || gameOver || isPaused) return;
    const newPiece = { ...currentPiece, x: currentPiece.x + dir };
    if (isValidMove(newPiece, board)) {
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, board, gameOver, isPaused, isValidMove]);

  const rotate = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    const rotated = rotatePiece(currentPiece);
    if (isValidMove(rotated, board)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, board, gameOver, isPaused, rotatePiece, isValidMove]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    let newPiece = { ...currentPiece };
    while (isValidMove({ ...newPiece, y: newPiece.y + 1 }, board)) {
      newPiece.y++;
    }
    setCurrentPiece(newPiece);
    setTimeout(moveDown, 0);
  }, [currentPiece, board, gameOver, isPaused, isValidMove, moveDown]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      switch (e.key) {
        case "ArrowLeft": moveHorizontal(-1); break;
        case "ArrowRight": moveHorizontal(1); break;
        case "ArrowDown": moveDown(); break;
        case "ArrowUp": rotate(); break;
        case " ": hardDrop(); break;
        case "p": case "P": setIsPaused(p => !p); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveHorizontal, moveDown, rotate, hardDrop, gameOver]);

  useEffect(() => {
    if (!isPaused && !gameOver) {
      const speed = Math.max(100, 1000 - (level - 1) * 100);
      gameLoopRef.current = setInterval(moveDown, speed);
    } else if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPaused, gameOver, level, moveDown]);

  const startGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    const firstPiece = getRandomPiece();
    setCurrentPiece(createPiece(firstPiece));
    setNextPiece(getRandomPiece());
  };

  const handleClaimReward = async () => {
    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }
    if (score < 1000) {
      alert("Minimum score of 1000 required to claim rewards!");
      return;
    }
    setClaiming(true);
    const success = await claimTetrisReward(score);
    if (success) {
      const multiplier = score >= 10000 ? 3 : score >= 5000 ? 2 : 1;
      alert(`Reward claimed successfully! ${5 * multiplier} GAME tokens added to your wallet.`);
    }
    setClaiming(false);
  };

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x] && currentPiece.y + y >= 0) {
            displayBoard[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
          }
        }
      }
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className="w-6 h-6 border border-gray-800"
            style={{ backgroundColor: cell || "#1a1a2e" }}
          />
        ))}
      </div>
    ));
  };

  const renderNextPiece = () => {
    if (!nextPiece) return null;
    const piece = TETROMINOS[nextPiece];
    return (
      <div className="grid gap-0.5">
        {piece.shape.map((row, y) => (
          <div key={y} className="flex gap-0.5">
            {row.map((cell, x) => (
              <div
                key={x}
                className="w-4 h-4"
                style={{ backgroundColor: cell ? piece.color : "transparent" }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-4">
      <div className="border-4 border-purple-500 bg-gray-900 p-1 shadow-[0_0_30px_rgba(147,51,234,0.5)]">
        {renderBoard()}
      </div>

      <div className="flex flex-col gap-4 min-w-[200px]">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-bold text-purple-400 mb-2">Score</h3>
          <p className="text-3xl font-mono text-white">{score.toLocaleString()}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-bold text-purple-400 mb-2">Level</h3>
          <p className="text-2xl font-mono text-white">{level}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-bold text-purple-400 mb-2">Lines</h3>
          <p className="text-2xl font-mono text-white">{lines}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-bold text-purple-400 mb-2">Next</h3>
          <div className="flex justify-center">{renderNextPiece()}</div>
        </div>

        <div className="flex flex-col gap-2">
          {!currentPiece || gameOver ? (
            <Button onClick={startGame} className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Play className="w-4 h-4" />
              {gameOver ? "Play Again" : "Start Game"}
            </Button>
          ) : (
            <Button onClick={() => setIsPaused(p => !p)} variant="outline" className="gap-2">
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
          )}

          {gameOver && score >= 1000 && (
            <Button
              onClick={handleClaimReward}
              disabled={claiming || !account}
              className="gap-2 bg-gradient-to-r from-purple-500 to-cyan-500"
            >
              <Trophy className="w-4 h-4" />
              {claiming ? "Claiming..." : "Claim Reward"}
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-400 space-y-1">
          <p>← → Move</p>
          <p>↑ Rotate</p>
          <p>↓ Soft Drop</p>
          <p>Space Hard Drop</p>
          <p>P Pause</p>
        </div>
      </div>
    </div>
  );
}
