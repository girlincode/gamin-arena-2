"use client";

import { useState, useCallback, useEffect } from "react";
import { Chess, Square, Move } from "chess.js";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-context";
import { Trophy, RotateCcw, Cpu } from "lucide-react";

const PIECE_SYMBOLS: Record<string, string> = {
  wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
  bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚",
};

export function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost" | "draw">("playing");
  const [thinking, setThinking] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const { account, claimChessReward } = useWeb3();

  const getPieceAt = (square: Square) => {
    const piece = game.get(square);
    if (!piece) return null;
    const color = piece.color === "w" ? "w" : "b";
    return PIECE_SYMBOLS[color + piece.type];
  };

  const makeAIMove = useCallback(() => {
    if (game.isGameOver()) return;
    
    setThinking(true);
    
    setTimeout(() => {
      const moves = game.moves({ verbose: true });
      if (moves.length === 0) return;

      let bestMove: Move | null = null;
      let bestScore = -Infinity;

      for (const move of moves) {
        const testGame = new Chess(game.fen());
        testGame.move(move);
        
        let score = 0;
        
        if (move.captured) {
          const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
          score += pieceValues[move.captured] || 0;
        }
        
        if (testGame.isCheckmate()) score += 100;
        if (testGame.isCheck()) score += 2;
        
        const centerSquares = ["d4", "d5", "e4", "e5"];
        if (centerSquares.includes(move.to)) score += 0.5;
        
        score += Math.random() * 0.5;
        
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }

      if (bestMove) {
        const newGame = new Chess(game.fen());
        newGame.move(bestMove);
        setGame(newGame);

        if (newGame.isCheckmate()) {
          setGameStatus("lost");
        } else if (newGame.isDraw()) {
          setGameStatus("draw");
        }
      }
      
      setThinking(false);
    }, 500);
  }, [game]);

  const handleSquareClick = (square: Square) => {
    if (gameStatus !== "playing" || thinking || game.turn() !== "w") return;

    if (selectedSquare) {
      try {
        const newGame = new Chess(game.fen());
        newGame.move({ from: selectedSquare, to: square, promotion: "q" });
        setGame(newGame);
        setSelectedSquare(null);
        setValidMoves([]);

        if (newGame.isCheckmate()) {
          setGameStatus("won");
        } else if (newGame.isDraw()) {
          setGameStatus("draw");
        } else {
          setTimeout(makeAIMove, 300);
        }
      } catch {
        const piece = game.get(square);
        if (piece && piece.color === "w") {
          setSelectedSquare(square);
          const moves = game.moves({ square, verbose: true });
          setValidMoves(moves.map(m => m.to as Square));
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    } else {
      const piece = game.get(square);
      if (piece && piece.color === "w") {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        setValidMoves(moves.map(m => m.to as Square));
      }
    }
  };

  const resetGame = () => {
    setGame(new Chess());
    setSelectedSquare(null);
    setValidMoves([]);
    setGameStatus("playing");
    setThinking(false);
  };

  const handleClaimReward = async () => {
    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }
    setClaiming(true);
    const success = await claimChessReward();
    if (success) {
      alert("Reward claimed successfully! 10 GAME tokens added to your wallet.");
    }
    setClaiming(false);
  };

  const renderBoard = () => {
    const squares = [];
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const square = (files[f] + ranks[r]) as Square;
        const isLight = (r + f) % 2 === 0;
        const isSelected = selectedSquare === square;
        const isValidMove = validMoves.includes(square);
        const piece = getPieceAt(square);
        const isKingInCheck = game.isCheck() && piece === (game.turn() === "w" ? "♔" : "♚");

        squares.push(
          <div
            key={square}
            onClick={() => handleSquareClick(square)}
            className={`
              w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center cursor-pointer
              text-3xl sm:text-4xl transition-all duration-150 relative
              ${isLight ? "bg-amber-100" : "bg-amber-700"}
              ${isSelected ? "ring-4 ring-cyan-400 ring-inset" : ""}
              ${isKingInCheck ? "bg-red-500" : ""}
              hover:brightness-110
            `}
          >
            {isValidMove && (
              <div className={`absolute w-4 h-4 rounded-full ${piece ? "ring-4 ring-cyan-400 ring-opacity-60" : "bg-cyan-400 bg-opacity-50"}`} />
            )}
            <span className={`relative z-10 ${piece?.startsWith("♟") || piece?.startsWith("♜") || piece?.startsWith("♞") || piece?.startsWith("♝") || piece?.startsWith("♛") || piece?.startsWith("♚") ? "text-gray-900" : ""}`}>
              {piece}
            </span>
          </div>
        );
      }
    }
    return squares;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="flex items-center gap-4">
        <div className={`px-4 py-2 rounded-lg font-bold ${
          gameStatus === "won" ? "bg-green-500 text-white" :
          gameStatus === "lost" ? "bg-red-500 text-white" :
          gameStatus === "draw" ? "bg-yellow-500 text-black" :
          "bg-gray-800 text-white"
        }`}>
          {gameStatus === "won" && "You Won!"}
          {gameStatus === "lost" && "AI Wins!"}
          {gameStatus === "draw" && "Draw!"}
          {gameStatus === "playing" && (thinking ? "AI Thinking..." : game.turn() === "w" ? "Your Turn (White)" : "AI Turn (Black)")}
        </div>
        {thinking && <Cpu className="w-6 h-6 animate-spin text-cyan-400" />}
      </div>

      <div className="grid grid-cols-8 border-4 border-amber-900 shadow-2xl">
        {renderBoard()}
      </div>

      <div className="flex gap-4">
        <Button onClick={resetGame} variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          New Game
        </Button>
        {gameStatus === "won" && (
          <Button 
            onClick={handleClaimReward} 
            disabled={claiming || !account}
            className="gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
          >
            <Trophy className="w-4 h-4" />
            {claiming ? "Claiming..." : "Claim 10 GAME Tokens"}
          </Button>
        )}
      </div>

      {game.isCheck() && gameStatus === "playing" && (
        <div className="text-red-400 font-bold animate-pulse">Check!</div>
      )}
    </div>
  );
}
