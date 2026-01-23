"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useWeb3 } from "@/lib/web3-context";
import { Users, Trophy, ArrowLeft, UserPlus, Copy, Check, Shield } from "lucide-react";

interface Team {
  _id: string;
  teamName: string;
  ownerUsername: string;
  ownerWallet: string;
  inviteCode: string;
  members: Array<{ username: string; walletAddress: string; joinedAt: Date }>;
  totalScore: number;
  totalGames: number;
  totalWins: number;
  createdAt: Date;
}

export default function TeamsPage() {
  const router = useRouter();
  const { account } = useWeb3();
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("");
  const [view, setView] = useState<"list" | "create" | "join">("list");
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const res = await fetch("/api/teams");
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams);
        if (account && data.teams) {
          const userTeam = data.teams.find((t: Team) => 
            t.members.some(m => m.walletAddress?.toLowerCase() === account.toLowerCase())
          );
          setMyTeam(userTeam || null);
        }
      }
    } catch (err) {
      console.error("Failed to load teams:", err);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setError("Please enter a team name");
      return;
    }

    if (!username) {
      setError("Username not found");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/teams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: teamName.trim(),
          ownerUsername: username,
          ownerWallet: account || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create team");
      }

      alert(`Team created! Your invite code is: ${data.inviteCode}`);
      await loadTeams();
      setView("list");
      setTeamName("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      return;
    }

    if (!username) {
      setError("Username not found");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: inviteCode.trim().toUpperCase(),
          username,
          walletAddress: account || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to join team");
      }

      alert(`Successfully joined ${data.team.teamName}!`);
      await loadTeams();
      setView("list");
      setInviteCode("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />

      <div className="relative z-10">
        <header className="border-b border-purple-500/20 bg-black/40 backdrop-blur-xl">
          <div className="container mx-auto px-4 h-20 flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push("/dashboard")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="font-[family-name:var(--font-orbitron)] text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              Teams
            </h1>
            <div className="w-32" />
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          {view === "list" && (
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  onClick={() => setView("create")}
                  className="flex-1 h-14 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                  disabled={!!myTeam}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Create Team
                </Button>
                <Button
                  onClick={() => setView("join")}
                  variant="outline"
                  className="flex-1 h-14 border-purple-500/30 hover:bg-purple-500/10"
                  disabled={!!myTeam}
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Join Team
                </Button>
              </div>

              {myTeam && (
                <Card className="p-6 mb-8 bg-gradient-to-br from-purple-900/40 to-violet-900/40 border-purple-500/30 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--font-orbitron)] text-xl font-bold text-white">
                        {myTeam.teamName}
                      </h3>
                      <p className="text-sm text-purple-300">Your Team</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-black/40 rounded-lg p-3 border border-purple-500/20">
                      <p className="text-xs text-gray-400">Members</p>
                      <p className="text-2xl font-bold text-white">{myTeam.members.length}</p>
                    </div>
                    <div className="bg-black/40 rounded-lg p-3 border border-purple-500/20">
                      <p className="text-xs text-gray-400">Total Score</p>
                      <p className="text-2xl font-bold text-purple-400">{myTeam.totalScore}</p>
                    </div>
                    <div className="bg-black/40 rounded-lg p-3 border border-purple-500/20">
                      <p className="text-xs text-gray-400">Wins</p>
                      <p className="text-2xl font-bold text-green-400">{myTeam.totalWins}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-purple-500/20">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Invite Code</p>
                      <code className="text-purple-300 font-mono font-bold">{myTeam.inviteCode}</code>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(myTeam.inviteCode)}>
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">Members:</p>
                    <div className="space-y-2">
                      {myTeam.members.map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-black/30 rounded-lg">
                          <span className="text-white font-medium">{member.username}</span>
                          {member.walletAddress && (
                            <code className="text-xs text-purple-400">
                              {member.walletAddress.slice(0, 6)}...{member.walletAddress.slice(-4)}
                            </code>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              <h2 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-white mb-6">
                All Teams
              </h2>

              <div className="grid gap-4">
                {teams.map((team, idx) => (
                  <Card
                    key={team._id}
                    className="p-6 bg-black/60 backdrop-blur-xl border-purple-500/20 hover:border-purple-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-purple-500/30">#{idx + 1}</div>
                        <div>
                          <h3 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white">
                            {team.teamName}
                          </h3>
                          <p className="text-sm text-gray-400">Owner: {team.ownerUsername}</p>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Members</p>
                          <p className="text-xl font-bold text-purple-400">{team.members.length}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Score</p>
                          <p className="text-xl font-bold text-white">{team.totalScore}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Wins</p>
                          <p className="text-xl font-bold text-green-400">{team.totalWins}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {view === "create" && (
            <div className="max-w-md mx-auto">
              <Card className="p-8 bg-black/60 backdrop-blur-xl border-purple-500/30">
                <h2 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-white mb-6 text-center">
                  Create Your Team
                </h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Team Name</label>
                    <Input
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Enter team name"
                      className="bg-black/50 border-purple-500/30 focus:border-purple-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setView("list")}
                      className="flex-1 border-purple-500/30"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateTeam}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600"
                    >
                      {loading ? "Creating..." : "Create Team"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {view === "join" && (
            <div className="max-w-md mx-auto">
              <Card className="p-8 bg-black/60 backdrop-blur-xl border-purple-500/30">
                <h2 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-white mb-6 text-center">
                  Join a Team
                </h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Invite Code</label>
                    <Input
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="Enter 8-character code"
                      maxLength={8}
                      className="bg-black/50 border-purple-500/30 focus:border-purple-500 font-mono"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setView("list")}
                      className="flex-1 border-purple-500/30"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleJoinTeam}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600"
                    >
                      {loading ? "Joining..." : "Join Team"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
