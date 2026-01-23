"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-context";
import { Trophy, RotateCcw } from "lucide-react";

const CARD_SYMBOLS = ["🎮", "🎲", "🎯", "🏆", "⚡", "🔥", "💎", "🚀"];

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const { account, claimMemoryReward } = useWeb3();

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
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleCardClick = (id: number) => {
    if (isLocked || gameWon) return;
    
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

  const handleClaimReward = async () => {
    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }
    if (moves > 30) {
      alert("You need to complete the game in 30 moves or less to claim rewards!");
      return;
    }
    setClaiming(true);
    const success = await claimMemoryReward(moves);
    if (success) {
      const multiplier = moves <= 15 ? 3 : moves <= 20 ? 2 : 1;
      alert(`Reward claimed successfully! ${2 * multiplier} GAME tokens added to your wallet.`);
    }
    setClaiming(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="flex items-center gap-8">
        <div className="bg-gray-800 px-6 py-3 rounded-lg">
          <span className="text-orange-400 font-bold text-xl">{moves}</span>
          <span className="text-gray-400 ml-2">moves</span>
        </div>
        <div className="bg-gray-800 px-6 py-3 rounded-lg">
          <span className="text-cyan-400 font-bold text-xl">{matches}/{CARD_SYMBOLS.length}</span>
          <span className="text-gray-400 ml-2">matches</span>
        </div>
      </div>

      {gameWon && (
        <div className="text-2xl font-bold text-green-400 animate-bounce">
          You Won in {moves} moves!
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 p-4 bg-gray-900 rounded-xl border-4 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`
              w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-lg cursor-pointer
              text-3xl sm:text-4xl transition-all duration-300 transform
              ${card.isFlipped || card.isMatched
                ? "bg-gradient-to-br from-orange-400 to-pink-500 rotate-0 scale-100"
                : "bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
              }
              ${card.isMatched ? "opacity-70" : ""}
              ${!card.isFlipped && !card.isMatched ? "hover:scale-105" : ""}
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

      <div className="flex gap-4">
        <Button onClick={initializeGame} variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          New Game
        </Button>

        {gameWon && moves <= 30 && (
          <Button
            onClick={handleClaimReward}
            disabled={claiming || !account}
            className="gap-2 bg-gradient-to-r from-orange-500 to-pink-500"
          >
            <Trophy className="w-4 h-4" />
            {claiming ? "Claiming..." : "Claim Reward"}
          </Button>
        )}
      </div>

      <div className="text-xs text-gray-400 text-center">
        <p>Match all pairs in 30 moves or less to earn rewards!</p>
        <p>Fewer moves = bigger rewards</p>
      </div>
    </div>
  );
}
