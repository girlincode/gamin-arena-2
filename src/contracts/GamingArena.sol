// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GamingArenaToken
 * @notice ERC20 token contract for Gaming Arena platform
 * @dev Supports 11 games with on-chain reward claiming
 * @dev Ready for Polygon Mainnet deployment (Chain ID: 137)
 * @dev Testnet: Polygon Amoy (Chain ID: 80002)
 */

 
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GamingArenaToken is ERC20, Ownable {
    uint256 public constant CHESS_WIN_REWARD = 10 * 10**18;
    uint256 public constant TETRIS_WIN_REWARD = 5 * 10**18;
    uint256 public constant SNAKE_WIN_REWARD = 3 * 10**18;
    uint256 public constant MEMORY_WIN_REWARD = 2 * 10**18;
    uint256 public constant GAME2048_WIN_REWARD = 20 * 10**18;
    uint256 public constant TICTACTOE_WIN_REWARD = 8 * 10**18;
    uint256 public constant ROCKPAPERSCISSORS_WIN_REWARD = 5 * 10**18;
    uint256 public constant WORDLE_WIN_REWARD = 15 * 10**18;
    uint256 public constant FLAPPYBIRD_WIN_REWARD = 4 * 10**18;
    uint256 public constant MINESWEEPER_WIN_REWARD = 12 * 10**18;
    uint256 public constant SUDOKU_WIN_REWARD = 18 * 10**18;
    
    mapping(address => uint256) public playerWins;
    mapping(address => uint256) public totalGamesPlayed;
    mapping(address => uint256) public lastClaimTime;
    
    uint256 public constant CLAIM_COOLDOWN = 1 minutes;
    
    event GameWon(address indexed player, string gameType, uint256 reward);
    event RewardClaimed(address indexed player, uint256 amount);
    
    constructor() ERC20("Gaming Arena Token", "GAME") Ownable(msg.sender) {
        _mint(address(this), 1000000 * 10**18);
    }
    
    function claimChessReward() external {
        require(block.timestamp >= lastClaimTime[msg.sender] + CLAIM_COOLDOWN, "Cooldown not passed");
        require(balanceOf(address(this)) >= CHESS_WIN_REWARD, "Insufficient contract balance");
        
        lastClaimTime[msg.sender] = block.timestamp;
        playerWins[msg.sender]++;
        totalGamesPlayed[msg.sender]++;
        
        _transfer(address(this), msg.sender, CHESS_WIN_REWARD);
        emit GameWon(msg.sender, "chess", CHESS_WIN_REWARD);
    }
    
    function claimTetrisReward(uint256 score) external {
        require(block.timestamp >= lastClaimTime[msg.sender] + CLAIM_COOLDOWN, "Cooldown not passed");
        require(score >= 1000, "Score too low");
        
        uint256 reward = TETRIS_WIN_REWARD;
        if (score >= 5000) reward = reward * 2;
        if (score >= 10000) reward = reward * 3;
        
        require(balanceOf(address(this)) >= reward, "Insufficient contract balance");
        
        lastClaimTime[msg.sender] = block.timestamp;
        playerWins[msg.sender]++;
        totalGamesPlayed[msg.sender]++;
        
        _transfer(address(this), msg.sender, reward);
        emit GameWon(msg.sender, "tetris", reward);
    }
    
    function claimSnakeReward(uint256 score) external {
        require(block.timestamp >= lastClaimTime[msg.sender] + CLAIM_COOLDOWN, "Cooldown not passed");
        require(score >= 50, "Score too low");
        
        uint256 reward = SNAKE_WIN_REWARD;
        if (score >= 100) reward = reward * 2;
        if (score >= 200) reward = reward * 3;
        
        require(balanceOf(address(this)) >= reward, "Insufficient contract balance");
        
        lastClaimTime[msg.sender] = block.timestamp;
        playerWins[msg.sender]++;
        totalGamesPlayed[msg.sender]++;
        
        _transfer(address(this), msg.sender, reward);
        emit GameWon(msg.sender, "snake", reward);
    }
    
    function claimMemoryReward(uint256 moves) external {
        require(block.timestamp >= lastClaimTime[msg.sender] + CLAIM_COOLDOWN, "Cooldown not passed");
        require(moves <= 30, "Too many moves");
        
        uint256 reward = MEMORY_WIN_REWARD;
        if (moves <= 20) reward = reward * 2;
        if (moves <= 15) reward = reward * 3;
        
        require(balanceOf(address(this)) >= reward, "Insufficient contract balance");
        
        lastClaimTime[msg.sender] = block.timestamp;
        playerWins[msg.sender]++;
        totalGamesPlayed[msg.sender]++;
        
        _transfer(address(this), msg.sender, reward);
        emit GameWon(msg.sender, "memory", reward);
    }

    function claim2048Reward(uint256 score) external {
        require(block.timestamp >= lastClaimTime[msg.sender] + CLAIM_COOLDOWN, "Cooldown not passed");
        require(score >= 2000, "Score too low"); // Require at least 2000 score
        
        uint256 reward = GAME2048_WIN_REWARD;
        if (score >= 5000) reward = reward * 2;
        if (score >= 10000) reward = reward * 3;
        
        require(balanceOf(address(this)) >= reward, "Insufficient contract balance");
        
        lastClaimTime[msg.sender] = block.timestamp;
        playerWins[msg.sender]++;
        totalGamesPlayed[msg.sender]++;
        
        _transfer(address(this), msg.sender, reward);
        emit GameWon(msg.sender, "2048", reward);
    }
    
    function claimTicTacToeReward() external {
        require(block.timestamp >= lastClaimTime[msg.sender] + CLAIM_COOLDOWN, "Cooldown not passed");
        require(balanceOf(address(this)) >= TICTACTOE_WIN_REWARD, "Insufficient contract balance");
        
        lastClaimTime[msg.sender] = block.timestamp;
        playerWins[msg.sender]++;
        totalGamesPlayed[msg.sender]++;
        
        _transfer(address(this), msg.sender, TICTACTOE_WIN_REWARD);
        emit GameWon(msg.sender, "tictactoe", TICTACTOE_WIN_REWARD);
    }
    
    function claimRockPaperScissorsReward(uint256 wins) external {
        require(block.timestamp >= lastClaimTime[msg.sender] + CLAIM_COOLDOWN, "Cooldown not passed");
        require(wins >= 3, "Need at least 3 wins");
        
        uint256 reward = ROCKPAPERSCISSORS_WIN_REWARD;
        if (wins >= 5) reward = reward * 2;
        if (wins >= 10) reward = reward * 3;
        
        require(balanceOf(address(this)) >= reward, "Insufficient contract balance");
        
        lastClaimTime[msg.sender] = block.timestamp;
        playerWins[msg.sender]++;
        totalGamesPlayed[msg.sender]++;
        
        _transfer(address(this), msg.sender, reward);
        emit GameWon(msg.sender, "rockpaperscissors", reward);
    }
    
    function claimWordleReward(uint256 attempts) external {
        require(block.timestamp >= lastClaimTime[msg.sender] + CLAIM_COOLDOWN, "Cooldown not passed");
        require(attempts <= 6, "Too many attempts");
        require(attempts >= 1, "Invalid attempts");
        
        uint256 reward = WORDLE_WIN_REWARD;
        if (attempts <= 3) reward = reward * 2;
        if (attempts <= 2) reward = reward * 3;
        
        require(balanceOf(address(this)) >= reward, "Insufficient contract balance");
        
        lastClaimTime[msg.sender] = block.timestamp;
        playerWins[msg.sender]++;
        totalGamesPlayed[msg.sender]++;
        
        _transfer(address(this), msg.sender, reward);
        emit GameWon(msg.sender, "wordle", reward);
    }
    
    function claimFlappyBirdReward(uint256 score) external {
        require(block.timestamp >= lastClaimTime[msg.sender] + CLAIM_COOLDOWN, "Cooldown not passed");
        require(score >= 20, "Score too low");
        
        uint256 reward = FLAPPYBIRD_WIN_REWARD;
        if (score >= 50) reward = reward * 2;
        if (score >= 100) reward = reward * 3;
        
        require(balanceOf(address(this)) >= reward, "Insufficient contract balance");
        
        lastClaimTime[msg.sender] = block.timestamp;
        playerWins[msg.sender]++;
        totalGamesPlayed[msg.sender]++;
        
        _transfer(address(this), msg.sender, reward);
        emit GameWon(msg.sender, "flappybird", reward);
    }
    
    function claimMinesweeperReward(uint256 time) external {
        require(block.timestamp >= lastClaimTime[msg.sender] + CLAIM_COOLDOWN, "Cooldown not passed");
        require(time <= 300, "Time too high"); // 5 minutes max
        
        uint256 reward = MINESWEEPER_WIN_REWARD;
        if (time <= 120) reward = reward * 2; // 2 minutes
        if (time <= 60) reward = reward * 3; // 1 minute
        
        require(balanceOf(address(this)) >= reward, "Insufficient contract balance");
        
        lastClaimTime[msg.sender] = block.timestamp;
        playerWins[msg.sender]++;
        totalGamesPlayed[msg.sender]++;
        
        _transfer(address(this), msg.sender, reward);
        emit GameWon(msg.sender, "minesweeper", reward);
    }
    
    function claimSudokuReward(uint256 time) external {
        require(block.timestamp >= lastClaimTime[msg.sender] + CLAIM_COOLDOWN, "Cooldown not passed");
        require(time <= 600, "Time too high"); // 10 minutes max
        
        uint256 reward = SUDOKU_WIN_REWARD;
        if (time <= 300) reward = reward * 2; // 5 minutes
        if (time <= 180) reward = reward * 3; // 3 minutes
        
        require(balanceOf(address(this)) >= reward, "Insufficient contract balance");
        
        lastClaimTime[msg.sender] = block.timestamp;
        playerWins[msg.sender]++;
        totalGamesPlayed[msg.sender]++;
        
        _transfer(address(this), msg.sender, reward);
        emit GameWon(msg.sender, "sudoku", reward);
    }
    
    function getPlayerStats(address player) external view returns (
        uint256 wins,
        uint256 gamesPlayed,
        uint256 tokenBalance,
        uint256 nextClaimTime
    ) {
        wins = playerWins[player];
        gamesPlayed = totalGamesPlayed[player];
        tokenBalance = balanceOf(player);
        nextClaimTime = lastClaimTime[player] + CLAIM_COOLDOWN;
    }
    
    function getContractBalance() external view returns (uint256) {
        return balanceOf(address(this));
    }
    
    function addRewardPool(uint256 amount) external onlyOwner {
        _mint(address(this), amount);
    }
}