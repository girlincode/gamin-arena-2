"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-context";
import { Trophy, RotateCcw, Hand, Scissors } from "lucide-react";
import { toast } from "sonner";

type Choice = "rock" | "paper" | "scissors";

const CHOICES: Choice[] = ["rock", "paper", "scissors"];

function getWinner(playerChoice: Choice, aiChoice: Choice): "win" | "lose" | "draw" {
  if (playerChoice === aiChoice) return "draw";
  
  if (
    (playerChoice === "rock" && aiChoice === "scissors") ||
    (playerChoice === "paper" && aiChoice === "rock") ||
    (playerChoice === "scissors" && aiChoice === "paper")
  ) {
    return "win";
  }
  
  return "lose";
}

function getAIChoice(): Choice {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

export function RockPaperScissorsGame() {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [aiChoice, setAiChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null);
  const [wins, setWins] = useState(0);
  const [round, setRound] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const { account, claimRockPaperScissorsReward } = useWeb3();

  const handleChoice = (choice: Choice) => {
    if (result !== null) return;

    const ai = getAIChoice();
    setPlayerChoice(choice);
    setAiChoice(ai);
    
    const gameResult = getWinner(choice, ai);
    setResult(gameResult);
    setRound(round + 1);
    
    if (gameResult === "win") {
      setWins(wins + 1);
    }
  };

  const handleClaimReward = async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    if (wins < 3) {
      toast.error("You need at least 3 wins to claim a reward");
      return;
    }

    setClaiming(true);
    try {
      await claimRockPaperScissorsReward(wins);
      toast.success(`Reward claimed for ${wins} wins!`);
      setWins(0);
      setRound(0);
    } catch (error: any) {
      toast.error(error.message || "Failed to claim reward");
    } finally {
      setClaiming(false);
    }
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setAiChoice(null);
    setResult(null);
    setWins(0);
    setRound(0);
  };

  const getChoiceIcon = (choice: Choice) => {
    switch (choice) {
      case "rock":
        return <Hand className="w-12 h-12" />;
      case "paper":
        return <Hand className="w-12 h-12 rotate-90" />;
      case "scissors":
        return <Scissors className="w-12 h-12" />;
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Rock Paper Scissors</h2>
        <p className="text-gray-400">Win 3+ rounds to claim rewards!</p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="bg-purple-500/20 px-4 py-2 rounded-lg">
            <p className="text-sm text-gray-400">Wins</p>
            <p className="text-2xl font-bold text-green-400">{wins}</p>
          </div>
          <div className="bg-purple-500/20 px-4 py-2 rounded-lg">
            <p className="text-sm text-gray-400">Round</p>
            <p className="text-2xl font-bold text-purple-400">{round}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-gray-400 mb-4">You</p>
          <div className="w-32 h-32 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center">
            {playerChoice ? (
              <div className="text-purple-400">{getChoiceIcon(playerChoice)}</div>
            ) : (
              <p className="text-gray-600">?</p>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-400 capitalize">{playerChoice || "Choose"}</p>
        </div>

        <div className="text-4xl font-bold text-gray-600">VS</div>

        <div className="text-center">
          <p className="text-gray-400 mb-4">AI</p>
          <div className="w-32 h-32 bg-orange-500/20 border border-orange-500/30 rounded-xl flex items-center justify-center">
            {aiChoice ? (
              <div className="text-orange-400">{getChoiceIcon(aiChoice)}</div>
            ) : (
              <p className="text-gray-600">?</p>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-400 capitalize">{aiChoice || "Waiting"}</p>
        </div>
      </div>

      {result && (
        <div className="text-center">
          {result === "win" && (
            <p className="text-2xl font-bold text-green-400">You Win! 🎉</p>
          )}
          {result === "lose" && (
            <p className="text-2xl font-bold text-red-400">You Lose!</p>
          )}
          {result === "draw" && (
            <p className="text-2xl font-bold text-yellow-400">It's a Draw!</p>
          )}
        </div>
      )}

      <div className="flex gap-4">
        {CHOICES.map((choice) => (
          <button
            key={choice}
            onClick={() => handleChoice(choice)}
            disabled={result !== null}
            className="w-24 h-24 bg-black/40 border border-purple-500/30 rounded-xl flex items-center justify-center hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all capitalize"
          >
            {getChoiceIcon(choice)}
          </button>
        ))}
      </div>

      {wins >= 3 && account && (
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
              Claim Reward ({wins} wins)
            </>
          )}
        </Button>
      )}

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
