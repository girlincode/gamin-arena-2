"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, RotateCcw, Home, Sparkles } from "lucide-react";

const CARD_SYMBOLS = ["🎮", "🎲", "🎯", "🏆", "⚡", "🔥", "💎", "🚀"];

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const savedWallet = localStorage.getItem("gaming_wallet");
    if (!savedWallet) {
      router.push("/");
    }
  }, [router]);

  const initializeGame = () => {
    const symbols = [...CARD_SYMBOLS, ...CARD_SYMBOLS];
    const shuffled = symbols
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameWon(false);
    setIsLocked(false);
    setGameStarted(true);
  };

  const updateHighScore = (moves: number) => {
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
    
    const currentBest = user.scores.memory || 9999;
    user.scores.memory = Math.min(currentBest, moves);
    user.totalGames += 1;
    user.totalWins += 1;
    
    users[savedWallet] = user;
    localStorage.setItem("gaming_users", JSON.stringify(users));
  };

  const handleCardClick = (id: number) => {
    if (isLocked || gameWon || !gameStarted) return;
    
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);
    
    setCards(prev =>
      prev.map(c => (c.id === id ? { ...c, isFlipped: true } : c))
    );

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsLocked(true);

      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId
                ? { ...c, isMatched: true }
                : c
            )
          );
          setMatches(m => {
            const newMatches = m + 1;
            if (newMatches === CARD_SYMBOLS.length) {
              setGameWon(true);
              updateHighScore(moves + 1);
            }
            return newMatches;
          });
          setFlippedCards([]);
          setIsLocked(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const getScoreFromMoves = () => {
    return Math.max(0, 100 - moves * 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-transparent to-red-900/20 pointer-events-none" />

      <header className="relative z-10 border-b border-orange-500/20 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-gaming text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              MEMORY
            </h1>
          </Link>
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="gap-2 border-orange-500/50 hover:bg-orange-500/10">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="bg-card/60 backdrop-blur-sm px-5 py-3 rounded-xl border border-orange-500/30">
              <span className="text-orange-400 font-gaming font-bold text-2xl">{moves}</span>
              <span className="text-muted-foreground ml-2 text-sm">moves</span>
            </div>
            <div className="bg-card/60 backdrop-blur-sm px-5 py-3 rounded-xl border border-cyan-500/30">
              <span className="text-cyan-400 font-gaming font-bold text-2xl">{matches}/{CARD_SYMBOLS.length}</span>
              <span className="text-muted-foreground ml-2 text-sm">matches</span>
            </div>
          </div>

          {gameWon && (
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/30 animate-bounce">
              <Sparkles className="w-6 h-6 text-green-400" />
              <span className="text-green-400 font-gaming font-bold text-xl">You Won in {moves} moves!</span>
            </div>
          )}

          {!gameStarted ? (
            <div className="text-center py-10">
              <h2 className="font-gaming text-3xl font-bold text-white mb-4">Memory Match</h2>
              <p className="text-muted-foreground mb-6">Match all pairs with the fewest moves!</p>
              <Button onClick={initializeGame} size="lg" className="gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                <Sparkles className="w-5 h-5" />
                Start Game
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 p-6 bg-gray-900/80 rounded-2xl border-4 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
              {cards.map(card => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`
                    w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl cursor-pointer
                    text-3xl sm:text-4xl transition-all duration-300 transform select-none
                    ${card.isFlipped || card.isMatched
                      ? "bg-gradient-to-br from-orange-400 to-pink-500 scale-100"
                      : "bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 hover:scale-105"
                    }
                    ${card.isMatched ? "opacity-70 scale-95" : ""}
                  `}
                  style={{
                    boxShadow: card.isFlipped || card.isMatched
                      ? "0 0 20px rgba(249, 115, 22, 0.5)"
                      : "none",
                  }}
                >
                  {card.isFlipped || card.isMatched ? card.symbol : "?"}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4">
            {gameStarted && (
              <Button onClick={initializeGame} variant="outline" className="gap-2 border-orange-500/50 hover:bg-orange-500/10">
                <RotateCcw className="w-4 h-4" />
                New Game
              </Button>
            )}
          </div>

          {gameWon && moves <= 30 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30">
              <Trophy className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-bold">+{getScoreFromMoves()} Points!</span>
            </div>
          )}

          <div className="text-sm text-muted-foreground text-center">
            <p>Click cards to flip them and find matching pairs</p>
            <p>Complete in 30 moves or less to earn points!</p>
          </div>
        </div>
      </main>
    </div>
  );
}