"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  username: string;
  createdAt: number;
  scores: {
    chess: number;
    tetris: number;
    snake: number;
    memory: number;
    game2048: number;
  };
  totalGames: number;
  totalWins: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string) => void;
  logout: () => void;
  updateScore: (game: keyof User["scores"], score: number, isWin: boolean) => void;
  getLeaderboard: () => LeaderboardEntry[];
}

interface LeaderboardEntry {
  username: string;
  totalScore: number;
  gamesPlayed: number;
  wins: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("gaming_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (username: string) => {
    const existingUsers = JSON.parse(localStorage.getItem("gaming_users") || "{}");
    
    if (existingUsers[username]) {
      setUser(existingUsers[username]);
      localStorage.setItem("gaming_user", JSON.stringify(existingUsers[username]));
    } else {
      const newUser: User = {
        username,
        createdAt: Date.now(),
        scores: { chess: 0, tetris: 0, snake: 0, memory: 0, game2048: 0 },
        totalGames: 0,
        totalWins: 0,
      };
      existingUsers[username] = newUser;
      localStorage.setItem("gaming_users", JSON.stringify(existingUsers));
      localStorage.setItem("gaming_user", JSON.stringify(newUser));
      setUser(newUser);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("gaming_user");
  };

  const updateScore = (game: keyof User["scores"], score: number, isWin: boolean) => {
    if (!user) return;

    const existingUsers = JSON.parse(localStorage.getItem("gaming_users") || "{}");
    const updatedUser = {
      ...user,
      scores: {
        ...user.scores,
        [game]: Math.max(user.scores[game], score),
      },
      totalGames: user.totalGames + 1,
      totalWins: isWin ? user.totalWins + 1 : user.totalWins,
    };

    existingUsers[user.username] = updatedUser;
    localStorage.setItem("gaming_users", JSON.stringify(existingUsers));
    localStorage.setItem("gaming_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const getLeaderboard = (): LeaderboardEntry[] => {
    const existingUsers = JSON.parse(localStorage.getItem("gaming_users") || "{}");
    return Object.values(existingUsers)
      .map((u: unknown) => {
        const usr = u as User;
        return {
          username: usr.username,
          totalScore: Object.values(usr.scores).reduce((a, b) => a + b, 0),
          gamesPlayed: usr.totalGames,
          wins: usr.totalWins,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateScore, getLeaderboard }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
