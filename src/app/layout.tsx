import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { Web3Provider } from "@/lib/web3-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Gaming Arena | Play 11 Games & Earn on Polygon",
  description: "Play 11 exciting games including Chess, Tetris, Snake, Memory, 2048, Tic Tac Toe, Rock Paper Scissors, Wordle, Flappy Bird, Minesweeper & Sudoku. Earn GAT tokens on Polygon blockchain!",
  keywords: ["blockchain gaming", "Polygon", "Web3 games", "NFT gaming", "crypto rewards", "on-chain gaming"],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' }
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} antialiased`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <Web3Provider>
            {children}
          </Web3Provider>
        </ErrorBoundary>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}