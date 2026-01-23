"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWeb3 } from "@/lib/web3-context";
import { ArrowLeft, Coins, Loader2, ExternalLink, Check, AlertCircle, Copy } from "lucide-react";
import { getSupportedCoins } from "@/lib/sideshift";

export default function DepositPage() {
  const router = useRouter();
  const { account } = useWeb3();
  const [mounted, setMounted] = useState(false);
  const [depositCoin, setDepositCoin] = useState("btc");
  const [depositAmount, setDepositAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [shift, setShift] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const supportedCoins = getSupportedCoins();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateShift = async () => {
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const quoteRes = await fetch("/api/sideshift/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depositCoin,
          settleCoin: "matic",
          depositAmount,
          settleAddress: account,
        }),
      });

      const quoteData = await quoteRes.json();

      if (!quoteRes.ok) {
        throw new Error(quoteData.error || "Failed to create quote");
      }

      const shiftRes = await fetch("/api/sideshift/shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId: quoteData.id,
          settleAddress: account,
        }),
      });

      const shiftData = await shiftRes.json();

      if (!shiftRes.ok) {
        throw new Error(shiftData.error || "Failed to create shift");
      }

      setShift(shiftData);
    } catch (err: any) {
      setError(err.message || "Failed to create deposit");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) {
    return null;
  }

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
              Deposit Crypto
            </h1>
            <div className="w-32" />
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-2xl">
          {!shift ? (
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-6">
                <Coins className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-center text-white mb-2">
                Deposit Any Crypto
              </h2>
              <p className="text-gray-400 text-center mb-8">
                Convert any cryptocurrency to MATIC on Polygon
              </p>

              {error && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 mb-6">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {!account ? (
                <div className="text-center p-6 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <AlertCircle className="w-12 h-12 mx-auto text-purple-400 mb-3" />
                  <p className="text-purple-300 mb-4">Please connect your wallet to deposit crypto</p>
                  <Button onClick={() => router.push("/")} className="bg-gradient-to-r from-purple-600 to-violet-600">
                    Go to Home
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Cryptocurrency
                    </label>
                    <Select value={depositCoin} onValueChange={setDepositCoin}>
                      <SelectTrigger className="w-full bg-black/50 border-purple-500/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedCoins.map((coin) => (
                          <SelectItem key={coin.coin} value={coin.coin}>
                            {coin.name} ({coin.coin.toUpperCase()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount to Deposit
                    </label>
                    <Input
                      type="number"
                      step="0.00000001"
                      placeholder="0.001"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="bg-black/50 border-purple-500/30 focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      You will receive MATIC on Polygon network
                    </p>
                  </div>

                  <Button
                    onClick={handleCreateShift}
                    disabled={loading || !depositAmount}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating Deposit...
                      </>
                    ) : (
                      "Create Deposit"
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-center text-white mb-2">
                Deposit Created!
              </h2>
              <p className="text-gray-400 text-center mb-8">
                Send {depositCoin.toUpperCase()} to the address below
              </p>

              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <p className="text-sm text-gray-400 mb-2">Deposit Address</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-purple-300 font-mono text-sm break-all">
                      {shift.depositAddress}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(shift.depositAddress)}
                      className="flex-shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-black/40 border border-purple-500/20">
                    <p className="text-sm text-gray-400 mb-1">Send Amount</p>
                    <p className="text-lg font-bold text-white">
                      {shift.depositAmount} {depositCoin.toUpperCase()}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-black/40 border border-purple-500/20">
                    <p className="text-sm text-gray-400 mb-1">You Receive</p>
                    <p className="text-lg font-bold text-green-400">
                      ~{shift.settleAmount} MATIC
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <p className="text-sm text-orange-300">
                    <strong>Important:</strong> Send exactly {shift.depositAmount} {depositCoin.toUpperCase()} to the address above. 
                    Your MATIC will be sent to {account?.slice(0, 6)}...{account?.slice(-4)} after confirmation.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShift(null)}
                    variant="outline"
                    className="flex-1 border-purple-500/30"
                  >
                    Create Another
                  </Button>
                  <Button
                    onClick={() => router.push("/dashboard")}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600"
                  >
                    Go to Dashboard
                  </Button>
                </div>

                <a
                  href={`https://sideshift.ai/orders/${shift.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Track on SideShift.ai
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
