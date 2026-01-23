"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-context";
import { Trophy, RotateCcw, Keyboard } from "lucide-react";
import { toast } from "sonner";

const WORDS = [
  "BLOCK", "CHAIN", "TOKEN", "GAMER", "ARENA", "REWARD", "WALLET",
  "ASSET", "TRADE", "MINING", "STAKING", "DEFI", "SMART", "CRYPTO",
  "ETHER", "POLYGON", "BITCOIN", "DOGECOIN", "LITECOIN", "TRONCOIN",
  "AVALANCHE", "CARDANO", "POLKADOT", "CHAINLINK", "UNISWAP", "PANCKE",
  "METAMASK", "WALLET", "BLOCKCHAIN", "DECENTRALIZED", "TRANSACTION", "NETWORK"
].filter(word => word.length === 5);

const WORD_LENGTH = 5;

type LetterStatus = "correct" | "present" | "absent" | null;

export function WordleGame() {
  const [word, setWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [claiming, setClaiming] = useState(false);
  const { account, claimWordleReward } = useWeb3();

  useEffect(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();
    setWord(randomWord);
  }, []);

  const getLetterStatus = (letter: string, index: number, guess: string): LetterStatus => {
    if (word[index] === letter) return "correct";
    if (word.includes(letter)) return "present";
    return "absent";
  };

  const handleKeyPress = (key: string) => {
    if (gameStatus !== "playing") return;

    if (key === "ENTER") {
      if (currentGuess.length === WORD_LENGTH) {
        handleGuess();
      }
    } else if (key === "BACKSPACE") {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (key.length === 1 && /[A-Z]/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(currentGuess + key);
    }
  };

  const handleGuess = () => {
    if (currentGuess.length !== WORD_LENGTH) return;

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setAttempts(attempts + 1);

    if (currentGuess === word) {
      setGameStatus("won");
    } else if (attempts + 1 >= 6) {
      setGameStatus("lost");
    }

    setCurrentGuess("");
  };

  const handleClaimReward = async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    if (gameStatus !== "won") {
      toast.error("You need to win the game first");
      return;
    }

    setClaiming(true);
    try {
      await claimWordleReward(attempts);
      toast.success(`Reward claimed! Solved in ${attempts} attempts!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to claim reward");
    } finally {
      setClaiming(false);
    }
  };

  const resetGame = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();
    setWord(randomWord);
    setGuesses([]);
    setCurrentGuess("");
    setAttempts(0);
    setGameStatus("playing");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") handleKeyPress("ENTER");
      else if (e.key === "Backspace") handleKeyPress("BACKSPACE");
      else if (/^[A-Za-z]$/.test(e.key)) handleKeyPress(e.key.toUpperCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess, gameStatus]);

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Wordle</h2>
        <p className="text-gray-400">Guess the 5-letter word!</p>
        <p className="text-sm text-gray-500 mt-2">Attempts: {attempts}/6</p>
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, rowIndex) => {
          const guess = guesses[rowIndex] || (rowIndex === guesses.length ? currentGuess : "");
          return (
            <div key={rowIndex} className="flex gap-2">
              {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                const letter = guess[colIndex] || "";
                const status = guess.length === WORD_LENGTH && guesses.includes(guess)
                  ? getLetterStatus(letter, colIndex, guess)
                  : null;
                
                return (
                  <div
                    key={colIndex}
                    className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center text-xl font-bold ${
                      status === "correct"
                        ? "bg-green-500 border-green-500 text-white"
                        : status === "present"
                        ? "bg-yellow-500 border-yellow-500 text-white"
                        : status === "absent"
                        ? "bg-gray-700 border-gray-700 text-white"
                        : "bg-black/40 border-purple-500/30 text-gray-400"
                    }`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {gameStatus === "won" && (
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400 mb-4">Congratulations! 🎉</p>
          <p className="text-gray-400 mb-4">You solved it in {attempts} attempts!</p>
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

      {gameStatus === "lost" && (
        <div className="text-center">
          <p className="text-2xl font-bold text-red-400 mb-2">Game Over!</p>
          <p className="text-gray-400">The word was: <span className="font-bold text-purple-400">{word}</span></p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((row, i) => (
          <div key={i} className="flex gap-1 justify-center">
            {row.split("").map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                disabled={gameStatus !== "playing"}
                className="px-3 py-2 bg-black/40 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {key}
              </button>
            ))}
          </div>
        ))}
        <div className="flex gap-1 justify-center">
          <button
            onClick={() => handleKeyPress("ENTER")}
            disabled={gameStatus !== "playing" || currentGuess.length !== WORD_LENGTH}
            className="px-6 py-2 bg-purple-600 border border-purple-500 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ENTER
          </button>
          <button
            onClick={() => handleKeyPress("BACKSPACE")}
            disabled={gameStatus !== "playing" || currentGuess.length === 0}
            className="px-6 py-2 bg-red-600 border border-red-500 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ⌫
          </button>
        </div>
      </div>

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
