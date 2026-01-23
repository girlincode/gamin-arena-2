"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-context";
import { POLYGON_AMOY_TESTNET } from "@/lib/contract";
import {
  Gamepad2,
  Trophy,
  Crown,
  Zap,
  Star,
  LogOut,
  Play,
  TrendingUp,
  Target,
  Medal,
  Wallet,
  Coins,
  ExternalLink,
  Grid3X3,
  Loader2,
  Users,
  Download,
  X,
  Circle,
  Hand,
  Keyboard,
  Bird,
  Bomb,
  Hash,
} from "lucide-react";

interface User {
  username: string;
  walletAddress?: string;
  scores: { 
    chess: number; 
    tetris: number; 
    snake: number; 
    memory: number; 
    game2048: number;
    tictactoe?: number;
    rockpaperscissors?: number;
    wordle?: number;
    flappybird?: number;
    minesweeper?: number;
    sudoku?: number;
  };
  totalGames: number;
  totalWins: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { account, isConnecting, connectWallet, disconnectWallet, switchToPolygon, chainId, playerStats } = useWeb3();
  
  const isCorrectNetwork = chainId === POLYGON_AMOY_TESTNET.chainId;

  useEffect(() => {
    fetchUserData();
  }, [account]);

  const fetchUserData = async () => {
    const wallet = localStorage.getItem("gaming_wallet");
    if (!wallet && !account) {
      router.push("/");
      return;
    }

    const walletAddress = wallet || account;
    if (!walletAddress) {
      router.push("/");
      return;
    }

    try {
      const response = await fetch(`/api/users?wallet=${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem("gaming_wallet");
        router.push("/");
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("gaming_wallet");
    disconnectWallet();
    router.push("/");
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalScore = Object.values(user.scores).reduce((a, b) => a + b, 0);
  const games = [
    { id: "chess", name: "Chess", icon: Crown, color: "from-amber-500 to-orange-600", borderColor: "border-amber-500/20", score: user.scores.chess, href: "/games/chess", reward: "10 GAT" },
    { id: "tetris", name: "Tetris", icon: Gamepad2, color: "from-purple-500 to-pink-600", borderColor: "border-purple-500/20", score: user.scores.tetris, href: "/games/tetris", reward: "5 GAT" },
    { id: "snake", name: "Snake", icon: Zap, color: "from-green-500 to-emerald-600", borderColor: "border-green-500/20", score: user.scores.snake, href: "/games/snake", reward: "3 GAT" },
    { id: "memory", name: "Memory", icon: Star, color: "from-orange-500 to-red-600", borderColor: "border-orange-500/20", score: user.scores.memory, href: "/games/memory", reward: "2 GAT" },
    { id: "2048", name: "2048", icon: Grid3X3, color: "from-cyan-500 to-blue-600", borderColor: "border-cyan-500/20", score: user.scores.game2048, href: "/games/2048", reward: "20 GAT" },
    { id: "tictactoe", name: "Tic Tac Toe", icon: X, color: "from-purple-500 to-violet-600", borderColor: "border-purple-500/20", score: user.scores.tictactoe || 0, href: "/games/tictactoe", reward: "8 GAT" },
    { id: "rockpaperscissors", name: "Rock Paper Scissors", icon: Hand, color: "from-orange-500 to-red-600", borderColor: "border-orange-500/20", score: user.scores.rockpaperscissors || 0, href: "/games/rockpaperscissors", reward: "5 GAT" },
    { id: "wordle", name: "Wordle", icon: Keyboard, color: "from-blue-500 to-cyan-600", borderColor: "border-blue-500/20", score: user.scores.wordle || 0, href: "/games/wordle", reward: "15 GAT" },
    { id: "flappybird", name: "Flappy Bird", icon: Bird, color: "from-cyan-500 to-blue-600", borderColor: "border-cyan-500/20", score: user.scores.flappybird || 0, href: "/games/flappybird", reward: "4 GAT" },
    { id: "minesweeper", name: "Minesweeper", icon: Bomb, color: "from-red-500 to-orange-600", borderColor: "border-red-500/20", score: user.scores.minesweeper || 0, href: "/games/minesweeper", reward: "12 GAT" },
    { id: "sudoku", name: "Sudoku", icon: Hash, color: "from-indigo-500 to-purple-600", borderColor: "border-indigo-500/20", score: user.scores.sudoku || 0, href: "/games/sudoku", reward: "18 GAT" },
  ];

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
            <div>
              <h1 className="font-[family-name:var(--font-orbitron)] text-lg font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                GAMING ARENA
              </h1>
              <p className="text-[9px] text-purple-400/60 uppercase tracking-widest">Dashboard</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {account ? (
              <div className="flex items-center gap-2">
                {!isCorrectNetwork && (
                  <Button onClick={switchToPolygon} size="sm" variant="destructive" className="gap-1 text-xs">
                    Switch Network
                  </Button>
                )}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-purple-300 font-mono">{shortenAddress(account)}</span>
                </div>
              </div>
            ) : (
              <Button 
                onClick={connectWallet} 
                disabled={isConnecting}
                size="sm"
                className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
              >
                {isConnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wallet className="w-3 h-3" />}
                {isConnecting ? "..." : "Connect"}
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push("/teams")} className="gap-2 border-purple-500/30 hover:bg-purple-500/10">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Teams</span>
            </Button>
            <Button variant="outline" onClick={() => router.push("/deposit")} className="gap-2 border-purple-500/30 hover:bg-purple-500/10">
              <Download className="w-4 h-4 text-green-400" />
              <span className="hidden sm:inline">Deposit</span>
            </Button>
            <Button variant="outline" onClick={() => router.push("/leaderboard")} className="gap-2 border-purple-500/30 hover:bg-purple-500/10">
              <Trophy className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="font-[family-name:var(--font-orbitron)] text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome, <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">{user.username}</span>
          </h2>
          <p className="text-gray-500">Choose a game and start earning rewards</p>
        </div>

        {account && playerStats && (
          <div className="mb-8 bg-gradient-to-r from-purple-900/30 to-violet-900/30 rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-6 h-6 text-purple-400" />
              <h3 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white">On-Chain Stats</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/30 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">GAT Balance</p>
                <p className="text-2xl font-bold text-purple-400">{parseFloat(playerStats.tokenBalance).toFixed(2)}</p>
              </div>
              <div className="bg-black/30 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">On-Chain Wins</p>
                <p className="text-2xl font-bold text-green-400">{playerStats.wins}</p>
              </div>
              <div className="bg-black/30 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Games Recorded</p>
                <p className="text-2xl font-bold text-cyan-400">{playerStats.gamesPlayed}</p>
              </div>
              <div className="bg-black/30 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Wallet</p>
                <a 
                  href={`https://amoy.polygonscan.com/address/${account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  {shortenAddress(account)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {!account && (
          <div className="mb-8 bg-gradient-to-r from-purple-900/20 to-violet-900/20 rounded-2xl p-6 border border-purple-500/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Connect Wallet for On-Chain Rewards</h3>
                  <p className="text-sm text-gray-500">Link MetaMask to earn GAT tokens for your victories</p>
                </div>
              </div>
              <Button 
                onClick={connectWallet}
                disabled={isConnecting}
                className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
              >
                {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                Connect Wallet
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-black/40 backdrop-blur-sm p-5 rounded-xl border border-purple-500/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-gray-500 text-sm">Total Score</span>
            </div>
            <p className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-white">{totalScore.toLocaleString()}</p>
          </div>
          <div className="bg-black/40 backdrop-blur-sm p-5 rounded-xl border border-cyan-500/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-gray-500 text-sm">Games Played</span>
            </div>
            <p className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-white">{user.totalGames}</p>
          </div>
          <div className="bg-black/40 backdrop-blur-sm p-5 rounded-xl border border-green-500/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-gray-500 text-sm">Wins</span>
            </div>
            <p className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-white">{user.totalWins}</p>
          </div>
          <div className="bg-black/40 backdrop-blur-sm p-5 rounded-xl border border-amber-500/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Medal className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-gray-500 text-sm">Win Rate</span>
            </div>
            <p className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-white">
              {user.totalGames > 0 ? Math.round((user.totalWins / user.totalGames) * 100) : 0}%
            </p>
          </div>
        </div>

        <h3 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-white mb-6">Select a Game</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-5">
          {games.map((game) => (
            <Link key={game.id} href={game.href}>
              <div className={`group bg-black/40 backdrop-blur-sm rounded-2xl p-6 border ${game.borderColor} hover:border-opacity-50 transition-all hover:scale-[1.02] cursor-pointer h-full`}>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <game.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-[family-name:var(--font-orbitron)] font-bold text-lg text-white mb-1">{game.name}</h4>
                <p className="text-sm text-gray-500 mb-3">High Score: {game.score.toLocaleString()}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400 group-hover:text-cyan-300">
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-medium">Play</span>
                  </div>
                  <span className="text-xs text-purple-400 px-2 py-1 rounded bg-purple-500/10">{game.reward}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-purple-900/30 to-violet-900/30 rounded-2xl p-8 border border-purple-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-white mb-2">Ready to compete?</h3>
              <p className="text-gray-500">Check out the leaderboard and see where you rank globally!</p>
            </div>
            <Button
              onClick={() => router.push("/leaderboard")}
              size="lg"
              className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
            >
              <Trophy className="w-5 h-5" />
              View Leaderboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}