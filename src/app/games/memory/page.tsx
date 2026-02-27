"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MemoryGame } from "@/components/games/MemoryGame";
import { Gamepad2, Home } from "lucide-react";
import { useEffect } from "react";

export default function MemoryPage() {
  const router = useRouter();

  useEffect(() => {
    const savedWallet = localStorage.getItem("gaming_wallet");
    if (!savedWallet) {
      router.push("/");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-red-900/20 pointer-events-none" />

      <header className="relative z-10 border-b border-orange-500/20 bg-black/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-[family-name:var(--font-orbitron)] text-lg font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              MEMORY
            </h1>
          </Link>
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="gap-2 border-orange-500/30 hover:bg-orange-500/10">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        <MemoryGame />
      </main>
    </div>
  );
}
