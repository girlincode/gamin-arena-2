# 🎮 Gaming Arena - Blockchain Gaming Platform

A decentralized gaming platform built on **Polygon** that combines 11 exciting games with blockchain rewards. Play games, earn tokens, compete on leaderboards, form teams, and deposit crypto seamlessly. **Ready for mainnet deployment!**

![Built on Polygon](https://img.shields.io/badge/Built%20on-Polygon-8247E5?style=for-the-badge&logo=polygon)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## 🌟 Features

### 🎯 Games Collection (11 Games!)
- **Chess** - Play against AI with minimax algorithm and alpha-beta pruning (10 GAT reward)
- **Tetris** - Classic block stacking with score tracking (5 GAT base, multipliers for high scores)
- **Snake** - Navigate and grow your snake (3 GAT base, multipliers for high scores)
- **Memory** - Match pairs in minimum moves (2 GAT base, efficiency bonuses)
- **2048** - Combine tiles to reach 2048 (20 GAT base, multipliers for high scores)
- **Tic Tac Toe** - Beat the AI in this classic game (8 GAT reward)
- **Rock Paper Scissors** - Win rounds against AI (5 GAT base, multipliers for streaks)
- **Wordle** - Guess the 5-letter word (15 GAT base, bonuses for fewer attempts)
- **Flappy Bird** - Fly through obstacles and score points (4 GAT base, multipliers for high scores)
- **Minesweeper** - Clear the minefield without hitting bombs (12 GAT base, time bonuses)
- **Sudoku** - Solve the classic number puzzle (18 GAT base, time bonuses)

### ⛓️ Blockchain Integration
- **On-Chain Rewards**: Earn GAT tokens for game victories
- **Wallet Connection**: MetaMask integration with Polygon
- **Smart Contract**: Ready for mainnet deployment
- **Network**: Polygon Mainnet (Chain ID: 137) / Polygon Amoy Testnet (Chain ID: 80002)
- **Claim Rewards**: Direct on-chain claiming for game achievements
- **Gas Optimized**: Efficient contract design for low transaction costs

### 💰 Multi-Coin Deposits via SideShift API

**What is SideShift?**

SideShift.ai is a cryptocurrency exchange service that allows instant, automatic conversion between different cryptocurrencies without requiring accounts or registration. It's integrated into Gaming Arena to provide seamless multi-cryptocurrency deposit functionality.

**How It Works:**

1. **Choose Your Crypto**: Select any supported cryptocurrency (BTC, ETH, USDT, USDC, DAI, SOL, LTC, DOGE, TRX, and 30+ more)
2. **Get Quote**: The system fetches real-time exchange rates from SideShift API
3. **Generate Address**: SideShift creates a unique deposit address for your transaction
4. **Send Funds**: Send your chosen cryptocurrency to the provided address
5. **Automatic Conversion**: SideShift automatically converts your deposit to MATIC
6. **Receive MATIC**: MATIC arrives directly in your connected wallet on Polygon network

**Benefits:**
- ✅ **No Sign-Up Required**: No accounts or KYC needed
- ✅ **Instant Conversion**: Automatic exchange happens in minutes
- ✅ **Wide Support**: 30+ cryptocurrencies supported
- ✅ **Transparent Rates**: Real-time quotes with no hidden fees
- ✅ **Decentralized**: Non-custodial - you control your funds
- ✅ **Tracking**: Monitor your shift status in real-time

**Technical Implementation:**
- Uses SideShift API v2 for quote generation and shift creation
- Supports both fixed-rate and variable-rate shifts
- Affiliate integration for platform revenue
- Real-time status tracking via webhooks
- Secure API key authentication

**Supported Coins Include:**
Bitcoin (BTC), Ethereum (ETH), USDT, USDC, DAI, Polygon (MATIC), Solana (SOL), Litecoin (LTC), Dogecoin (DOGE), Tron (TRX), Binance Coin (BNB), Cardano (ADA), Polkadot (DOT), Avalanche (AVAX), Chainlink (LINK), and many more.

### 👥 Team System
- **Create Teams**: Form your own gaming team
- **Invite Members**: Share unique invite codes
- **Team Leaderboard**: Compete as a team with combined scores
- **Member Management**: View all team members and their stats
- **MongoDB Storage**: All team data persisted in database

### 📊 Leaderboard & Stats
- Global player rankings by total score
- Real-time stat tracking (games played, wins, win rate)
- On-chain stats (GAT balance, verified wins)
- Username-based authentication
- Wallet address verification on PolygonScan

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Blockchain**: [Ethers.js v6](https://docs.ethers.org/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **Crypto Payments**: [SideShift.ai API](https://sideshift.ai/)
- **Network**: Polygon Amoy Testnet
- **Smart Contract**: Solidity + Hardhat

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MetaMask wallet
- MongoDB database
- SideShift API credentials (optional for deposits)

### Installation

1. **Clone the repository**
    ```bash
    git clone <your-repo-url>
    cd orchids-gaming-platform
    ```

2. **Install dependencies**
    ```bash
    npm install
    ```

3. **Set up environment variables**

    Create a `.env` file in the root directory:

    ```env
    # Blockchain
    PRIVATE_KEY=your_private_key_here
    POLYGON_AMOY_RPC=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
    
    # Database
    MONGODB_URI=your_mongodb_connection_string
    
    # SideShift API (for multi-coin deposits)
    SIDESHIFT_SECRET=your_sideshift_secret
    SIDESHIFT_AFFILIATE_ID=your_affiliate_id
    
    # Optional APIs
    GEMINI_API_KEY=your_gemini_api_key
    PINATA_API_KEY=your_pinata_api_key
    PINATA_SECRET_KEY=your_pinata_secret_key
    ```

4. **Run the development server**
    ```bash
    npm run dev
    ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📋 How to Use

### 1️⃣ **Create Account & Connect Wallet**
- Enter a username on the home page
- Click "Connect Wallet" to link your MetaMask
- Switch to Polygon Amoy Testnet when prompted

### 2️⃣ **Get Test MATIC**
- Visit [Polygon Faucet](https://faucet.polygon.technology/)
- Request test MATIC for Amoy Testnet
- Use for on-chain transactions

### 3️⃣ **Play Games & Earn**
- Select any of 11 games from the dashboard
- Play and achieve high scores or complete objectives
- Claim on-chain GAT token rewards for wins
- Higher scores/faster times = bigger rewards!

### 4️⃣ **Deposit Crypto (Optional)**
- Navigate to "Deposit" page
- Select your preferred cryptocurrency
- Enter amount and wallet address
- Send to the provided SideShift address
- Receive MATIC on Polygon automatically
- Track conversion status in real-time

### 5️⃣ **Join or Create Teams**
- Click "Teams" in the navigation
- Create your own team or join existing ones
- Invite friends with your unique team code
- Compete together on team leaderboard

### 6️⃣ **Check Leaderboard**
- View global rankings
- See top players and teams
- Track your progress

## 🎮 Game Rewards

| Game | Base Reward | Condition | Multipliers |
|------|-------------|-----------|-------------|
| Chess | 10 GAT | Beat AI opponent | - |
| Tetris | 5 GAT | Score ≥ 1000 | 2x (≥5000), 3x (≥10000) |
| Snake | 3 GAT | Score ≥ 50 | 2x (≥100), 3x (≥200) |
| Memory | 2 GAT | Moves ≤ 30 | 2x (≤20), 3x (≤15) |
| 2048 | 20 GAT | Score ≥ 2000 | 2x (≥5000), 3x (≥10000) |
| Tic Tac Toe | 8 GAT | Beat AI opponent | - |
| Rock Paper Scissors | 5 GAT | Win 3+ rounds | 2x (≥5 wins), 3x (≥10 wins) |
| Wordle | 15 GAT | Solve in ≤6 attempts | 2x (≤3 attempts), 3x (≤2 attempts) |
| Flappy Bird | 4 GAT | Score ≥ 20 | 2x (≥50), 3x (≥100) |
| Minesweeper | 12 GAT | Complete in ≤300s | 2x (≤120s), 3x (≤60s) |
| Sudoku | 18 GAT | Complete in ≤600s | 2x (≤300s), 3x (≤180s) |

## 🔗 Blockchain Details

### Smart Contract
- **Address**: `0xB0B49B050ffeE857A2664B2cb5c8E08553ed08FD`
- **Network**: Polygon Amoy Testnet
- **Chain ID**: 80002
- **Token**: GAT (Gaming Arena Token)

### Contract Functions
- `claimChessReward()` - Claim reward for chess victory
- `claimTetrisReward(uint256 score)` - Claim Tetris rewards
- `claimSnakeReward(uint256 score)` - Claim Snake rewards
- `claimMemoryReward(uint256 moves)` - Claim Memory rewards
- `claim2048Reward(uint256 score)` - Claim 2048 rewards
- `claimTicTacToeReward()` - Claim reward for Tic Tac Toe victory
- `claimRockPaperScissorsReward(uint256 wins)` - Claim Rock Paper Scissors rewards
- `claimWordleReward(uint256 attempts)` - Claim Wordle rewards
- `claimFlappyBirdReward(uint256 score)` - Claim Flappy Bird rewards
- `claimMinesweeperReward(uint256 time)` - Claim Minesweeper rewards
- `claimSudokuReward(uint256 time)` - Claim Sudoku rewards
- `getPlayerStats(address player)` - View player statistics
- `getContractBalance()` - View contract token balance
- `addRewardPool(uint256 amount)` - Owner function to add rewards (onlyOwner)

### View on Explorer
- [PolygonScan Amoy](https://amoy.polygonscan.com/address/0xB0B49B050ffeE857A2664B2cb5c8E08553ed08FD)

## 💡 Why Polygon?

Gaming Arena is built on **Polygon Amoy Testnet** for several key reasons:

1. **⚡ Fast Transactions**: Sub-second block times ensure instant game rewards
2. **💰 Low Fees**: Near-zero gas costs make micro-transactions viable for gaming
3. **🔐 Secure**: Inherits Ethereum's security while maintaining high performance
4. **🌍 Scalable**: Can handle thousands of players and transactions
5. **♻️ Eco-Friendly**: Energy-efficient Proof-of-Stake consensus
6. **🛠️ Developer-Friendly**: EVM-compatible with excellent tooling

Perfect for gaming applications that require frequent on-chain interactions!

## 🔄 SideShift Integration Details

### API Endpoints

**Create Quote**: `/api/sideshift/quote`
- Method: POST
- Parameters: depositCoin, settleCoin, depositAmount, settleAddress
- Returns: Quote ID, rates, deposit address

**Create Shift**: `/api/sideshift/shift`
- Method: POST
- Parameters: quoteId
- Returns: Shift ID, deposit address, tracking info

**Check Status**: `/api/sideshift/status/[shiftId]`
- Method: GET
- Returns: Current status, transaction hashes, timestamps

### Flow Diagram
```
User Selects Coin → Get Quote → Create Shift → Display Address → 
User Sends Crypto → SideShift Converts → MATIC Received
```

## 📁 Project Structure

```
orchids-gaming-platform/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Home/Login page
│   │   ├── dashboard/         # User dashboard
│   │   ├── leaderboard/       # Global rankings
│   │   ├── teams/             # Team management
│   │   ├── deposit/           # Crypto deposit page (SideShift)
│   │   ├── games/             # Individual game pages
│   │   │   ├── chess/
│   │   │   ├── tetris/
│   │   │   ├── snake/
│   │   │   ├── memory/
│   │   │   └── 2048/
│   │   └── api/               # API routes
│   │       ├── sideshift/     # SideShift integration
│   │       │   ├── quote/     # Get exchange quote
│   │       │   ├── shift/     # Create shift order
│   │       │   └── status/    # Check shift status
│   │       └── teams/         # Team management APIs
│   ├── components/            # React components
│   │   ├── games/            # Game components
│   │   └── ui/               # UI components
│   ├── lib/                  # Utilities
│   │   ├── web3-context.tsx  # Web3 provider
│   │   ├── mongodb.ts        # Database connection
│   │   ├── sideshift.ts      # SideShift API client
│   │   └── contract.ts       # Smart contract config
│   └── contracts/            # Solidity smart contracts
├── public/                   # Static assets
├── hardhat.config.cjs       # Hardhat configuration
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Smart Contract**: [0xB0B49B050ffeE857A2664B2cb5c8E08553ed08FD](https://amoy.polygonscan.com/address/0xB0B49B050ffeE857A2664B2cb5c8E08553ed08FD)
- **Polygon Faucet**: https://faucet.polygon.technology/
- **SideShift**: https://sideshift.ai/
- **SideShift Docs**: https://docs.sideshift.ai/

## 🆘 Support

For issues or questions:
- Open an issue on GitHub
- Check the [Polygon documentation](https://docs.polygon.technology/)
- Visit [SideShift docs](https://docs.sideshift.ai/)

---

**Built with ❤️ on Polygon** | Play, Earn, Compete!
