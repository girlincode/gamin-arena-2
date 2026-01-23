"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Chess, Square, Move, PieceSymbol } from "chess.js";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-context";
import { Gamepad2, Trophy, RotateCcw, Cpu, Home, Wallet, Coins } from "lucide-react";

const PIECE_SYMBOLS: Record<string, string> = {
  wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
  bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚",
};

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

const POSITION_BONUS: Record<PieceSymbol, number[][]> = {
  p: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  r: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ],
  q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  k: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ],
};

function evaluateBoard(game: Chess, isMaximizing: boolean): number {
  if (game.isCheckmate()) {
    return isMaximizing ? -100000 : 100000;
  }
  if (game.isDraw()) return 0;

  let score = 0;
  const board = game.board();

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      const pieceValue = PIECE_VALUES[piece.type];
      const posBonus = POSITION_BONUS[piece.type];
      const positionValue = piece.color === 'w' 
        ? posBonus[row][col] 
        : posBonus[7 - row][col];

      if (piece.color === 'w') {
        score += pieceValue + positionValue;
      } else {
        score -= pieceValue + positionValue;
      }
    }
  }

  return score;
}

function minimax(game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game, isMaximizing);
  }

  const moves = game.moves({ verbose: true });
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function findBestMove(game: Chess, depth: number = 3): Move | null {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  let bestMove: Move | null = null;
  let bestValue = Infinity;

  for (const move of moves) {
    game.move(move);
    const value = minimax(game, depth - 1, -Infinity, Infinity, true);
    game.undo();

    if (value < bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }

  return bestMove;
}

export default function ChessPage() {
  const router = useRouter();
  const { account, claimChessReward } = useWeb3();
  const [game, setGame] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost" | "draw">("playing");
  const [thinking, setThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const savedWallet = localStorage.getItem("gaming_wallet");
    if (!savedWallet) {
      router.push("/");
    }
  }, [router]);

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
      const gameCopy = new Chess(game.fen());
      const bestMove = findBestMove(gameCopy, 3);

      if (bestMove) {
        const newGame = new Chess(game.fen());
        newGame.move(bestMove);
        setGame(newGame);
        setMoveHistory(prev => [...prev, `${bestMove.from}-${bestMove.to}`]);

        if (newGame.isCheckmate()) {
          setGameStatus("lost");
          updateUserStats(false);
        } else if (newGame.isDraw()) {
          setGameStatus("draw");
          updateUserStats(false);
        }
      }
      
      setThinking(false);
    }, 100);
  }, [game]);

  const updateUserStats = (isWin: boolean) => {
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
    
    user.totalGames += 1;
    if (isWin) {
      user.totalWins += 1;
      user.scores.chess = Math.max(user.scores.chess, 100);
    }
    
    users[savedWallet] = user;
    localStorage.setItem("gaming_users", JSON.stringify(users));
  };

  const handleClaimReward = async () => {
    if (!account || claimed) return;
    setClaiming(true);
    const success = await claimChessReward();
    if (success) {
      setClaimed(true);
    }
    setClaiming(false);
  };

  const handleSquareClick = (square: Square) => {
    if (gameStatus !== "playing" || thinking || game.turn() !== "w") return;

    if (selectedSquare) {
      try {
        const newGame = new Chess(game.fen());
        newGame.move({ from: selectedSquare, to: square, promotion: "q" });
        setGame(newGame);
        setMoveHistory(prev => [...prev, `${selectedSquare}-${square}`]);
        setSelectedSquare(null);
        setValidMoves([]);

        if (newGame.isCheckmate()) {
          setGameStatus("won");
          updateUserStats(true);
        } else if (newGame.isDraw()) {
          setGameStatus("draw");
          updateUserStats(false);
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
    setMoveHistory([]);
    setClaimed(false);
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
        const pieceObj = game.get(square);
        const isKingInCheck = game.isCheck() && pieceObj?.type === "k" && pieceObj?.color === game.turn();
        const isLastMove = moveHistory.length > 0 && (
          moveHistory[moveHistory.length - 1].includes(square)
        );

        squares.push(
          <div
            key={square}
            onClick={() => handleSquareClick(square)}
            className={`
              w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center cursor-pointer
              text-3xl sm:text-4xl md:text-5xl transition-all duration-150 relative
              ${isLight ? "bg-amber-100" : "bg-amber-700"}
              ${isSelected ? "ring-4 ring-cyan-400 ring-inset" : ""}
              ${isKingInCheck ? "bg-red-500" : ""}
              ${isLastMove ? "bg-yellow-400/50" : ""}
              hover:brightness-110
            `}
          >
            {isValidMove && (
              <div className={`absolute w-4 h-4 rounded-full ${piece ? "ring-4 ring-cyan-400 ring-opacity-60" : "bg-cyan-400 bg-opacity-50"}`} />
            )}
            <span className={`relative z-10 ${pieceObj?.color === "b" ? "text-gray-900" : "text-gray-100 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"}`}>
              {piece}
            </span>
          </div>
        );
      }
    }
    return squares;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-orange-900/10 pointer-events-none" />

      <header className="relative z-10 border-b border-amber-500/20 bg-black/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-[family-name:var(--font-orbitron)] text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              CHESS
            </h1>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="gap-2 border-amber-500/30 hover:bg-amber-500/10">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6">
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
            {thinking && <Cpu className="w-6 h-6 animate-spin text-amber-400" />}
          </div>

          <div className="grid grid-cols-8 border-4 border-amber-900 shadow-2xl rounded-lg overflow-hidden">
            {renderBoard()}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={resetGame} variant="outline" className="gap-2 border-amber-500/30 hover:bg-amber-500/10">
              <RotateCcw className="w-4 h-4" />
              New Game
            </Button>
            {gameStatus === "won" && (
              <>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30">
                  <Trophy className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-bold">+100 Points!</span>
                </div>
                {account && !claimed && (
                  <Button 
                    onClick={handleClaimReward}
                    disabled={claiming}
                    className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  >
                    {claiming ? (
                      <>
                        <Cpu className="w-4 h-4 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4" />
                        Claim 50 GAT
                      </>
                    )}
                  </Button>
                )}
                {claimed && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <Coins className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400">50 GAT Claimed!</span>
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

          {game.isCheck() && gameStatus === "playing" && (
            <div className="text-red-400 font-bold animate-pulse text-lg">Check!</div>
          )}

          <div className="text-sm text-gray-500 text-center max-w-md">
            <p>Click a piece to select it, then click a valid square to move.</p>
            <p>You play as White. Defeat the AI to earn points and GAT tokens!</p>
          </div>

          {moveHistory.length > 0 && (
            <div className="bg-black/40 rounded-xl p-4 max-w-md w-full">
              <h4 className="text-amber-400 font-bold mb-2">Move History</h4>
              <div className="flex flex-wrap gap-2 text-sm text-gray-400 max-h-24 overflow-y-auto">
                {moveHistory.map((move, i) => (
                  <span key={i} className={`px-2 py-1 rounded ${i % 2 === 0 ? 'bg-amber-500/10' : 'bg-orange-500/10'}`}>
                    {Math.floor(i/2) + 1}.{i % 2 === 0 ? '' : '..'} {move}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}