"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWeb3 } from "@/lib/web3-context";
import { POLYGON_AMOY_TESTNET } from "@/lib/contract";
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Zap, 
  Crown, 
  Star,
  ChevronRight,
  Sparkles,
  Wallet,
  Shield,
  Coins,
  Globe,
  ExternalLink,
  Check,
  Loader2,
  Grid3X3,
  X,
  Hand,
  Keyboard,
  Bird,
  Bomb,
  Hash,
} from "lucide-react";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { account, isConnecting, connectWallet, disconnectWallet, switchToPolygon, chainId } = useWeb3();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (account) {
      checkExistingUser();
    }
  }, [account]);

  const checkExistingUser = async () => {
    if (!account) return;
    
    try {
      const response = await fetch(`/api/users?wallet=${account}`);
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          localStorage.setItem('gaming_wallet', account);
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const isCorrectNetwork = chainId === POLYGON_AMOY_TESTNET.chainId;

  const handleStart = () => {
    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }
    setShowLogin(true);
  };

  const handleCreateUser = async () => {
    if (username.trim().length < 2) {
      alert("Username must be at least 2 characters!");
      return;
    }

    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          walletAddress: account
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('gaming_wallet', account);
        router.push('/dashboard');
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-[150px]" />
      
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <header className="relative z-10 border-b border-purple-500/20 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Gamepad2 className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">POL</span>
              </div>
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-orbitron)] text-xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                GAMING ARENA
              </h1>
              <p className="text-[10px] text-purple-400/70 uppercase tracking-widest">Powered by Polygon</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push("/leaderboard")} className="gap-2 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all">
              <Trophy className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Button>
            {mounted && (
              account ? (
                <div className="flex items-center gap-2">
                  {!isCorrectNetwork && (
                    <Button onClick={switchToPolygon} size="sm" variant="destructive" className="gap-2">
                      Switch Network
                    </Button>
                  )}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-purple-300 font-mono">{shortenAddress(account)}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={disconnectWallet} className="text-red-400 hover:text-red-300">
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={connectWallet} 
                  disabled={isConnecting}
                  className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                >
                  {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              )
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="pt-24 pb-20 px-4">
          <div className="container mx-auto text-center max-w-5xl">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/30 mb-10 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">POL</span>
                </div>
                <span className="text-sm text-purple-300 font-medium">Built on Polygon</span>
              </div>
              <div className="w-px h-4 bg-purple-500/30" />
              <span className="text-sm text-purple-400/80">On-Chain Gaming</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>

            <h2 className="font-[family-name:var(--font-orbitron)] text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
                Play Classic Games
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Earn On-Chain Rewards
              </span>
            </h2>

            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Connect your wallet, play 11 exciting games including Chess, Tetris, Snake, Memory, 2048, Tic Tac Toe, Rock Paper Scissors, Wordle, Flappy Bird, Minesweeper & Sudoku! 
              All scores recorded on Polygon blockchain. Compete globally and earn GAT tokens.
            </p>

            {!showLogin ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="gap-3 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 hover:from-purple-700 hover:via-violet-700 hover:to-fuchsia-700 text-lg px-10 py-7 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-105"
                >
                  <Zap className="w-6 h-6" />
                  Start Playing
                  <ChevronRight className="w-5 h-5" />
                </Button>
                {!account && mounted && (
                  <Button
                    onClick={connectWallet}
                    variant="outline"
                    size="lg"
                    className="gap-3 border-purple-500/30 hover:bg-purple-500/10 text-lg px-8 py-7 rounded-xl"
                  >
                    <Wallet className="w-5 h-5" />
                    Connect Wallet First
                  </Button>
                )}
              </div>
            ) : (
              <div className="max-w-md mx-auto bg-black/60 backdrop-blur-xl p-8 rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/10">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
                  <Gamepad2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-white mb-2">Enter the Arena</h3>
                <p className="text-gray-400 mb-6">Choose your username to start playing</p>
                
                {account && (
                  <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 mb-4">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Wallet Connected: {shortenAddress(account)}</span>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Input
                    placeholder="Your username..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateUser()}
                    className="h-12 bg-black/50 border-purple-500/30 focus:border-purple-500 text-lg"
                    maxLength={20}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleCreateUser}
                    disabled={isLoading || !account}
                    className="h-12 px-8 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Play"}
                  </Button>
                </div>
                {!account && mounted && (
                  <p className="text-xs text-red-400 mt-4">
                    Please connect your wallet to continue
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h3 className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              Available Games
            </h3>
            <p className="text-gray-500 text-center mb-12">Choose your game and start earning rewards</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {[
                { icon: Crown, name: "Chess", desc: "Beat the AI", color: "from-amber-500 to-orange-600", reward: "10 GAT" },
                { icon: Gamepad2, name: "Tetris", desc: "Stack & clear", color: "from-purple-500 to-pink-600", reward: "5 GAT" },
                { icon: Zap, name: "Snake", desc: "Eat & grow", color: "from-green-500 to-emerald-600", reward: "3 GAT" },
                { icon: Star, name: "Memory", desc: "Match pairs", color: "from-orange-500 to-red-600", reward: "2 GAT" },
                { icon: Grid3X3, name: "2048", desc: "Merge tiles", color: "from-cyan-500 to-blue-600", reward: "20 GAT" },
                { icon: X, name: "Tic Tac Toe", desc: "Beat AI", color: "from-purple-500 to-violet-600", reward: "8 GAT" },
                { icon: Hand, name: "Rock Paper Scissors", desc: "Win rounds", color: "from-orange-500 to-red-600", reward: "5 GAT" },
                { icon: Keyboard, name: "Wordle", desc: "Guess words", color: "from-blue-500 to-cyan-600", reward: "15 GAT" },
                { icon: Bird, name: "Flappy Bird", desc: "Fly & score", color: "from-cyan-500 to-blue-600", reward: "4 GAT" },
                { icon: Bomb, name: "Minesweeper", desc: "Clear mines", color: "from-red-500 to-orange-600", reward: "12 GAT" },
                { icon: Hash, name: "Sudoku", desc: "Solve puzzle", color: "from-indigo-500 to-purple-600", reward: "18 GAT" },
              ].map((game, i) => (
                <div
                  key={game.name}
                  className="group relative bg-black/40 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <game.icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="font-[family-name:var(--font-orbitron)] font-bold text-lg text-white mb-1 text-center">{game.name}</h4>
                  <p className="text-sm text-gray-500 text-center mb-3">{game.desc}</p>
                  <div className="text-xs text-purple-400 text-center px-2 py-1 rounded-full bg-purple-500/10">
                    {game.reward}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 via-purple-900/10 to-purple-900/5" />
          <div className="container mx-auto max-w-6xl relative">
            <h3 className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              Why Gaming Arena?
            </h3>
            <p className="text-gray-500 text-center mb-12">The future of gaming is on-chain</p>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Shield, title: "On-Chain", desc: "All game results stored permanently on Polygon blockchain" },
                { icon: Coins, title: "Earn Tokens", desc: "Win games to earn GAT tokens as rewards" },
                { icon: Globe, title: "Global Leaderboard", desc: "Compete with players worldwide for top rankings" },
                { icon: Zap, title: "Fast & Cheap", desc: "Near-instant transactions with minimal gas fees" },
              ].map((item) => (
                <div key={item.title} className="text-center p-6 rounded-2xl bg-black/30 border border-purple-500/10 hover:border-purple-500/30 transition-all">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-purple-400" />
                  </div>
                  <h4 className="font-bold text-lg text-white mb-2">{item.title}</h4>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-gradient-to-r from-purple-900/40 to-violet-900/40 rounded-3xl p-10 border border-purple-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">POL</span>
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-white">Built on Polygon</h3>
                    <p className="text-purple-400 text-sm">Polygon Amoy Testnet</p>
                  </div>
                </div>
                <p className="text-gray-400 mb-6 max-w-2xl">
                  Gaming Arena leverages Polygon&apos;s fast and low-cost blockchain to record all game achievements on-chain. 
                  Connect your MetaMask wallet to Polygon Amoy Testnet to start earning GAT tokens.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a 
                    href="https://amoy.polygonscan.com/address/0xB0B49B050ffeE857A2664B2cb5c8E08553ed08FD"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-colors"
                  >
                    View Contract
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a 
                    href="https://faucet.polygon.technology/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-colors"
                  >
                    Get Test MATIC
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 border-t border-purple-500/10">
          <div className="container mx-auto max-w-6xl">
            <h3 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-center mb-8 text-white">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Connect Wallet", desc: "Link your MetaMask to Polygon Amoy" },
                { step: "2", title: "Create Username", desc: "Choose your gaming identity" },
                { step: "3", title: "Play Games", desc: "Compete in Chess, Tetris, Snake & more" },
                { step: "4", title: "Earn Rewards", desc: "Claim GAT tokens for victories" },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-4 text-xl font-bold text-white">
                      {item.step}
                    </div>
                    <h4 className="font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                  {i < 3 && (
                    <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 py-10 border-t border-purple-500/20 bg-black/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-[family-name:var(--font-orbitron)] font-bold text-white">Gaming Arena</span>
                <p className="text-xs text-gray-500">On-Chain Gaming Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a 
                href="https://amoy.polygonscan.com/address/0xB0B49B050ffeE857A2664B2cb5c8E08553ed08FD"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-400 transition-colors flex items-center gap-1"
              >
                Contract: 0xB0B4...08FD
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>Polygon Amoy Testnet</span>
            </div>
            <p className="text-gray-600 text-sm">&copy; 2024 Gaming Arena. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}