"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ethers } from "ethers";
import { GAMING_ARENA_ABI, GAMING_ARENA_ADDRESS, POLYGON_AMOY_TESTNET } from "./contract";

interface Web3ContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  contract: ethers.Contract | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToPolygon: () => Promise<void>;
  chainId: string | null;
  playerStats: PlayerStats | null;
  refreshStats: () => Promise<void>;
  claimChessReward: () => Promise<boolean>;
  claimTetrisReward: (score: number) => Promise<boolean>;
  claimSnakeReward: (score: number) => Promise<boolean>;
  claimMemoryReward: (moves: number) => Promise<boolean>;
  claim2048Reward: (score: number) => Promise<boolean>;
  claimTicTacToeReward: () => Promise<boolean>;
  claimRockPaperScissorsReward: (wins: number) => Promise<boolean>;
  claimWordleReward: (attempts: number) => Promise<boolean>;
  claimFlappyBirdReward: (score: number) => Promise<boolean>;
  claimMinesweeperReward: (time: number) => Promise<boolean>;
  claimSudokuReward: (time: number) => Promise<boolean>;
}

interface PlayerStats {
  wins: number;
  gamesPlayed: number;
  tokenBalance: string;
  nextClaimTime: number;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask to use this dApp!");
      return;
    }

    setIsConnecting(true);
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const network = await browserProvider.getNetwork();
      
      setProvider(browserProvider);
      setAccount(accounts[0]);
      setChainId("0x" + network.chainId.toString(16));

      const signer = await browserProvider.getSigner();
      const gameContract = new ethers.Contract(
        GAMING_ARENA_ADDRESS,
        GAMING_ARENA_ABI,
        signer
      );
      setContract(gameContract);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setContract(null);
    setChainId(null);
    setPlayerStats(null);
  };

  const switchToPolygon = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: POLYGON_AMOY_TESTNET.chainId }],
      });
    } catch (switchError: unknown) {
      const error = switchError as { code?: number };
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [POLYGON_AMOY_TESTNET],
          });
        } catch (addError) {
          console.error("Failed to add Polygon network:", addError);
        }
      }
    }
  };

  const refreshStats = async () => {
    if (!contract || !account) return;
    
    try {
      const stats = await contract.getPlayerStats(account);
      setPlayerStats({
        wins: Number(stats[0]),
        gamesPlayed: Number(stats[1]),
        tokenBalance: ethers.formatEther(stats[2]),
        nextClaimTime: Number(stats[3]),
      });
    } catch (error) {
      console.error("Failed to fetch player stats:", error);
    }
  };

  const claimChessReward = async (): Promise<boolean> => {
    if (!contract) return false;
    try {
      const tx = await contract.claimChessReward();
      await tx.wait();
      await refreshStats();
      return true;
    } catch (error) {
      console.error("Failed to claim chess reward:", error);
      return false;
    }
  };

  const claimTetrisReward = async (score: number): Promise<boolean> => {
    if (!contract) return false;
    try {
      const tx = await contract.claimTetrisReward(score);
      await tx.wait();
      await refreshStats();
      return true;
    } catch (error) {
      console.error("Failed to claim tetris reward:", error);
      return false;
    }
  };

  const claimSnakeReward = async (score: number): Promise<boolean> => {
    if (!contract) return false;
    try {
      const tx = await contract.claimSnakeReward(score);
      await tx.wait();
      await refreshStats();
      return true;
    } catch (error) {
      console.error("Failed to claim snake reward:", error);
      return false;
    }
  };

  const claimMemoryReward = async (moves: number): Promise<boolean> => {
    if (!contract) return false;
    try {
      const tx = await contract.claimMemoryReward(moves);
      await tx.wait();
      await refreshStats();
      return true;
    } catch (error) {
      console.error("Failed to claim memory reward:", error);
      return false;
    }
  };

  const claim2048Reward = async (score: number): Promise<boolean> => {
    if (!contract) return false;
    try {
      const tx = await contract.claim2048Reward(score);
      await tx.wait();
      await refreshStats();
      return true;
    } catch (error) {
      console.error("Failed to claim 2048 reward:", error);
      return false;
    }
  };

  const claimTicTacToeReward = async (): Promise<boolean> => {
    if (!contract) return false;
    try {
      const tx = await contract.claimTicTacToeReward();
      await tx.wait();
      await refreshStats();
      return true;
    } catch (error) {
      console.error("Failed to claim tictactoe reward:", error);
      return false;
    }
  };

  const claimRockPaperScissorsReward = async (wins: number): Promise<boolean> => {
    if (!contract) return false;
    try {
      const tx = await contract.claimRockPaperScissorsReward(wins);
      await tx.wait();
      await refreshStats();
      return true;
    } catch (error) {
      console.error("Failed to claim rockpaperscissors reward:", error);
      return false;
    }
  };

  const claimWordleReward = async (attempts: number): Promise<boolean> => {
    if (!contract) return false;
    try {
      const tx = await contract.claimWordleReward(attempts);
      await tx.wait();
      await refreshStats();
      return true;
    } catch (error) {
      console.error("Failed to claim wordle reward:", error);
      return false;
    }
  };

  const claimFlappyBirdReward = async (score: number): Promise<boolean> => {
    if (!contract) return false;
    try {
      const tx = await contract.claimFlappyBirdReward(score);
      await tx.wait();
      await refreshStats();
      return true;
    } catch (error) {
      console.error("Failed to claim flappybird reward:", error);
      return false;
    }
  };

  const claimMinesweeperReward = async (time: number): Promise<boolean> => {
    if (!contract) return false;
    try {
      const tx = await contract.claimMinesweeperReward(time);
      await tx.wait();
      await refreshStats();
      return true;
    } catch (error) {
      console.error("Failed to claim minesweeper reward:", error);
      return false;
    }
  };

  const claimSudokuReward = async (time: number): Promise<boolean> => {
    if (!contract) return false;
    try {
      const tx = await contract.claimSudokuReward(time);
      await tx.wait();
      await refreshStats();
      return true;
    } catch (error) {
      console.error("Failed to claim sudoku reward:", error);
      return false;
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (...args: unknown[]) => {
        const accounts = args[0] as string[];
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (...args: unknown[]) => {
        const newChainId = args[0] as string;
        setChainId(newChainId);
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (contract && account) {
      refreshStats();
    }
  }, [contract, account]);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        contract,
        isConnecting,
        connectWallet,
        disconnectWallet,
        switchToPolygon,
        chainId,
        playerStats,
        refreshStats,
        claimChessReward,
        claimTetrisReward,
        claimSnakeReward,
        claimMemoryReward,
        claim2048Reward,
        claimTicTacToeReward,
        claimRockPaperScissorsReward,
        claimWordleReward,
        claimFlappyBirdReward,
        claimMinesweeperReward,
        claimSudokuReward,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}