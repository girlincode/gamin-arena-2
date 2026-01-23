"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-context";
import {
  Gamepad2,
  Trophy,
  Medal,
  Crown,
  ArrowLeft,
  TrendingUp,
  Target,
  Flame,
  Wallet,
  Coins,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface LeaderboardEntry {
  username: string;
  totalScore: number;
  gamesPlayed: number;
  wins: number;
  walletAddress?: string;
  scores: { chess: number; tetris: number; snake: number; memory: number; game2048: number };
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentWallet, setCurrentWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { account } = useWeb3();

  useEffect(() => {
    const wallet = localStorage.getItem("gaming_wallet");
    setCurrentWallet(wallet);
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-300" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{index + 1}</span>;
  };

  const getRankBg = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30";
    if (index === 1) return "bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30";
    if (index === 2) return "bg-gradient-to-r from-amber-600/20 to-orange-500/10 border-amber-600/30";
    return "bg-black/40 border-purple-500/20";
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-3)}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none" />

      <header className="relative z-10 border-b border-purple-500/20 bg-black/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
                <span className="text-[6px] font-bold text-white">POL</span>
              </div>
            </div>
            <h1 className="font-[family-name:var(--font-orbitron)] text-lg font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              GAMING ARENA
            </h1>
          </Link>
          <Button variant="outline" onClick={() => router.back()} className="gap-2 border-purple-500/30 hover:bg-purple-500/10">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <h2 className="font-[family-name:var(--font-orbitron)] text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              Leaderboard
            </h2>
          </div>
          <p className="text-gray-500">Top players ranked by total score</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">No players yet!</h3>
            <p className="text-gray-500 mb-6">Be the first to join and start playing!</p>
            <Button onClick={() => router.push("/")} className="bg-gradient-to-r from-purple-600 to-violet-600">
              Start Playing
            </Button>
          </div>
        ) : (
          <>
            {leaderboard.length >= 3 && (
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                {[1, 0, 2].map((pos) => {
                  const entry = leaderboard[pos];
                  if (!entry) return null;
                  const isFirst = pos === 0;
                  const isCurrentUser = entry.walletAddress?.toLowerCase() === currentWallet?.toLowerCase();
                  return (
                    <div
                      key={entry.walletAddress}
                      className={`relative ${isFirst ? "md:-mt-4" : ""}`}
                    >
                      <div className={`p-6 rounded-2xl border ${getRankBg(pos)} ${isCurrentUser ? "ring-2 ring-purple-400" : ""}`}>
                        <div className="flex justify-center mb-4">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            pos === 0 ? "bg-yellow-500/30" : pos === 1 ? "bg-gray-400/30" : "bg-amber-600/30"
                          }`}>
                            {getRankIcon(pos)}
                          </div>
                        </div>
                        <div className="text-center">
                          <h3 className={`font-[family-name:var(--font-orbitron)] text-xl font-bold mb-1 ${isCurrentUser ? "text-purple-400" : "text-white"}`}>
                            {entry.username}
                          </h3>
                          {entry.walletAddress && (
                            <a 
                              href={`https://amoy.polygonscan.com/address/${entry.walletAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mb-2"
                            >
                              <Wallet className="w-3 h-3" />
                              {shortenAddress(entry.walletAddress)}
                              <ExternalLink className="w-2 h-2" />
                            </a>
                          )}
                          <p className={`font-[family-name:var(--font-orbitron)] text-3xl font-bold ${
                            pos === 0 ? "text-yellow-400" : pos === 1 ? "text-gray-300" : "text-amber-500"
                          }`}>
                            {entry.totalScore.toLocaleString()}
                          </p>
                          <div className="flex justify-center gap-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              {entry.gamesPlayed}
                            </span>
                            <span className="flex items-center gap-1">
                              <Flame className="w-4 h-4" />
                              {entry.wins} wins
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-3">
              {leaderboard.slice(leaderboard.length >= 3 ? 3 : 0).map((entry, idx) => {
                const isCurrentUser = entry.walletAddress?.toLowerCase() === currentWallet?.toLowerCase();
                return (
                  <div
                    key={entry.walletAddress}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:bg-black/60 ${
                      isCurrentUser
                        ? "bg-purple-500/10 border-purple-500/30 ring-1 ring-purple-500/50"
                        : "bg-black/40 border-purple-500/20"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <span className="font-bold text-gray-500">{leaderboard.length >= 3 ? idx + 4 : idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold ${isCurrentUser ? "text-purple-400" : "text-white"}`}>
                        {entry.username}
                      </h4>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>{entry.gamesPlayed} games</span>
                        <span>{entry.wins} wins</span>
                        {entry.walletAddress && (
                          <a 
                            href={`https://amoy.polygonscan.com/address/${entry.walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                          >
                            <Wallet className="w-3 h-3" />
                            {shortenAddress(entry.walletAddress)}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-[family-name:var(--font-orbitron)] text-xl font-bold text-purple-400">{entry.totalScore.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-12 bg-gradient-to-r from-purple-900/30 to-violet-900/30 rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Coins className="w-6 h-6 text-purple-400" />
            <h3 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white">On-Chain Rewards</h3>
          </div>
          <p className="text-gray-500 mb-4">
            Connect your wallet and play games to earn GAT tokens on Polygon! All rewards are stored permanently on the blockchain.
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href="https://amoy.polygonscan.com/address/0xB0B49B050ffeE857A2664B2cb5c8E08553ed08FD"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-colors text-sm"
            >
              View Contract
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {currentWallet && (
          <div className="mt-8 text-center">
            <Button
              onClick={() => router.push("/dashboard")}
              size="lg"
              className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
            >
              <TrendingUp className="w-5 h-5" />
              Play More Games
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}