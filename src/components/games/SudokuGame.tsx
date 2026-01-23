"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-context";
import { Trophy, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const SIZE = 9;
const BOX_SIZE = 3;

function generateSudoku(): { puzzle: number[][]; solution: number[][] } {
  const solution: number[][] = Array(SIZE)
    .fill(null)
    .map(() => Array(SIZE).fill(0));

  function isValid(board: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < SIZE; i++) {
      if (board[row][i] === num || board[i][col] === num) return false;
    }

    const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
    for (let i = 0; i < BOX_SIZE; i++) {
      for (let j = 0; j < BOX_SIZE; j++) {
        if (board[boxRow + i][boxCol + j] === num) return false;
      }
    }

    return true;
  }

  function solve(board: number[][]): boolean {
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (board[row][col] === 0) {
          const nums = Array.from({ length: SIZE }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
          for (const num of nums) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (solve(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  solve(solution);

  const puzzle = solution.map((row) => row.map((cell) => cell));
  const cellsToRemove = 40;
  let removed = 0;

  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * SIZE);
    const col = Math.floor(Math.random() * SIZE);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }

  return { puzzle, solution };
}

export function SudokuGame() {
  const [puzzle, setPuzzle] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [board, setBoard] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [gameStatus, setGameStatus] = useState<"playing" | "won">("playing");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const { account, claimSudokuReward } = useWeb3();

  useEffect(() => {
    const { puzzle: newPuzzle, solution: newSolution } = generateSudoku();
    setPuzzle(newPuzzle);
    setSolution(newSolution);
    setBoard(newPuzzle.map((row) => row.map((cell) => cell)));
    setGameStatus("playing");
    setStartTime(Date.now());
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

  useEffect(() => {
    const isComplete = board.every((row, r) =>
      row.every((cell, c) => cell !== 0 && cell === solution[r][c])
    );

    if (isComplete && board.some((row) => row.some((cell) => cell !== 0))) {
      setGameStatus("won");
    }
  }, [board, solution]);

  const handleCellClick = (row: number, col: number) => {
    if (puzzle[row][col] !== 0) return;
    setSelectedCell([row, col]);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== 0) return;

    const newBoard = board.map((r) => r.map((c) => c));
    newBoard[row][col] = num;
    setBoard(newBoard);
  };

  const handleClear = () => {
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== 0) return;

    const newBoard = board.map((r) => r.map((c) => c));
    newBoard[row][col] = 0;
    setBoard(newBoard);
  };

  const handleClaimReward = async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    if (gameStatus !== "won") {
      toast.error("You need to complete the puzzle first");
      return;
    }

    setClaiming(true);
    try {
      await claimSudokuReward(elapsedTime);
      toast.success(`Reward claimed! Completed in ${elapsedTime} seconds!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to claim reward");
    } finally {
      setClaiming(false);
    }
  };

  const resetGame = () => {
    const { puzzle: newPuzzle, solution: newSolution } = generateSudoku();
    setPuzzle(newPuzzle);
    setSolution(newSolution);
    setBoard(newPuzzle.map((row) => row.map((cell) => cell)));
    setGameStatus("playing");
    setStartTime(Date.now());
    setElapsedTime(0);
    setSelectedCell(null);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Sudoku</h2>
        <p className="text-gray-400">Fill the grid so every row, column, and box contains 1-9</p>
        <div className="mt-4 bg-purple-500/20 px-4 py-2 rounded-lg inline-block">
          <p className="text-sm text-gray-400">Time</p>
          <p className="text-xl font-bold text-purple-400">{elapsedTime}s</p>
        </div>
      </div>

      <div className="grid grid-cols-9 gap-0.5 bg-purple-900/20 p-2 rounded-xl border-2 border-purple-500/30">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isBoxBorder =
              rowIndex % BOX_SIZE === 0 || colIndex % BOX_SIZE === 0;
            const isSelected =
              selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex;
            const isGiven = puzzle[rowIndex][colIndex] !== 0;
            const isCorrect = cell === solution[rowIndex][colIndex];

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`w-10 h-10 text-lg font-bold transition-all ${
                  isSelected
                    ? "bg-purple-500/50 border-2 border-purple-400"
                    : isBoxBorder
                    ? "bg-purple-500/10 border border-purple-500/30"
                    : "bg-black/40 border border-purple-500/20"
                } ${
                  isGiven
                    ? "text-purple-300 font-bold"
                    : cell === 0
                    ? "text-gray-600"
                    : isCorrect
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {cell !== 0 ? cell : ""}
              </button>
            );
          })
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="w-12 h-12 bg-purple-600 border border-purple-500 rounded-lg text-xl font-bold text-white hover:bg-purple-700 transition-all"
            >
              {num}
            </button>
          ))}
        </div>
        <Button
          onClick={handleClear}
          variant="outline"
          className="border-purple-500/30"
        >
          Clear
        </Button>
      </div>

      {gameStatus === "won" && (
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400 mb-4">Congratulations! 🎉</p>
          <p className="text-gray-400 mb-4">You solved it in {elapsedTime} seconds!</p>
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
