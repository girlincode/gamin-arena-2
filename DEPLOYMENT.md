# 🚀 Deployment Checklist

## Pre-Deployment Checklist

### ✅ Build Status
- [x] Project builds successfully (`npm run build`)
- [x] No TypeScript errors
- [x] No linting errors
- [x] All 11 games implemented and functional
- [x] Smart contract ready for mainnet

### Environment Variables Required

Create a `.env` file with the following variables:

```env
# Blockchain Configuration
PRIVATE_KEY=your_private_key_here
POLYGON_AMOY_RPC=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY
# For mainnet: POLYGON_MAINNET_RPC=https://polygon-rpc.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gaming-arena?retryWrites=true&w=majority

# SideShift API (Optional - for multi-coin deposits)
SIDESHIFT_SECRET=your_sideshift_secret
SIDESHIFT_AFFILIATE_ID=your_affiliate_id

# Optional APIs
GEMINI_API_KEY=your_gemini_api_key
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

### Smart Contract Deployment

#### For Testnet (Polygon Amoy):
```bash
npx hardhat run scripts/deploy.js --network amoy
```

#### For Mainnet (Polygon):
1. Update `hardhat.config.cjs` to include mainnet network:
```javascript
networks: {
  amoy: { ... },
  polygon: {
    url: process.env.POLYGON_MAINNET_RPC || "https://polygon-rpc.com",
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    chainId: 137
  }
}
```

2. Deploy:
```bash
npx hardhat run scripts/deploy.js --network polygon
```

3. Update contract address in `src/lib/contract.ts`:
```typescript
export const GAMING_ARENA_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### Deployment Platforms

#### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Set build command: `npm run build`
4. Set output directory: `.next`
5. Deploy!

#### Other Platforms
- **Netlify**: Similar to Vercel, supports Next.js out of the box
- **Railway**: Good for full-stack apps with MongoDB
- **Render**: Supports Next.js and MongoDB

### Post-Deployment Steps

1. **Verify Contract Deployment**
   - Check contract on PolygonScan
   - Verify contract address matches in code
   - Test contract functions

2. **Test All Games**
   - Test each of the 11 games
   - Verify reward claiming works
   - Check leaderboard updates

3. **Database Setup**
   - Ensure MongoDB collections are created automatically
   - Verify indexes if needed

4. **Monitor**
   - Set up error tracking (Sentry, etc.)
   - Monitor contract balance
   - Track user activity

### Security Checklist

- [ ] Private keys stored securely (never commit to git)
- [ ] Environment variables set in deployment platform
- [ ] Contract owner address secured
- [ ] Rate limiting on API routes (if needed)
- [ ] CORS configured properly
- [ ] Input validation on all API endpoints

### Performance Optimization

- [x] Dynamic API routes configured
- [x] Error boundaries implemented
- [x] Lazy loading where applicable
- [ ] CDN configured (if using Vercel, automatic)
- [ ] Image optimization (Next.js Image component)

### Testing Checklist

- [ ] All 11 games load correctly
- [ ] Wallet connection works
- [ ] Network switching works
- [ ] Reward claiming works for all games
- [ ] Leaderboard displays correctly
- [ ] Teams functionality works
- [ ] Deposit flow works (if SideShift configured)
- [ ] Mobile responsiveness verified

## Games Included

1. ✅ Chess - AI opponent with minimax
2. ✅ Tetris - Classic block stacking
3. ✅ Snake - Classic snake game
4. ✅ Memory - Card matching game
5. ✅ 2048 - Number puzzle
6. ✅ Tic Tac Toe - AI opponent
7. ✅ Rock Paper Scissors - Win streaks
8. ✅ Wordle - Word guessing game
9. ✅ Flappy Bird - Score-based game
10. ✅ Minesweeper - Mine clearing puzzle
11. ✅ Sudoku - Number puzzle

## Contract Functions

All reward functions are implemented:
- `claimChessReward()`
- `claimTetrisReward(uint256 score)`
- `claimSnakeReward(uint256 score)`
- `claimMemoryReward(uint256 moves)`
- `claim2048Reward(uint256 score)`
- `claimTicTacToeReward()`
- `claimRockPaperScissorsReward(uint256 wins)`
- `claimWordleReward(uint256 attempts)`
- `claimFlappyBirdReward(uint256 score)`
- `claimMinesweeperReward(uint256 time)`
- `claimSudokuReward(uint256 time)`

## Support

For issues or questions:
- Check contract on PolygonScan
- Review API logs
- Check MongoDB connection
- Verify environment variables

---

**Ready for Production! 🎉**
