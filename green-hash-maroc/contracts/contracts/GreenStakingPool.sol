// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./GreenHashToken.sol";

contract GreenStakingPool is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;
    
    struct StakeInfo {
        uint256 amount;           // Montant staké
        uint256 rewardDebt;       // Dette de récompenses
        uint256 depositTime;      // Timestamp du dépôt
        uint256 lockEndTime;      // Fin du lock (0 si pas de lock)
        uint256 lastClaimTime;    // Dernier claim
    }
    
    struct PoolInfo {
        IERC20 stakingToken;      // Token à staker
        uint256 allocPoint;       // Points d'allocation
        uint256 lastRewardTime;   // Dernier calcul de récompenses
        uint256 accRewardPerShare; // Récompenses accumulées par share
        uint256 totalStaked;      // Total staké dans le pool
        uint256 minimumStake;     // Montant minimum à staker
        uint256 lockPeriod;       // Période de lock en secondes
    }
    
    // Token de récompense (GREENHASH)
    GreenHashToken public rewardToken;
    
    // Informations du pool
    PoolInfo public poolInfo;
    
    // Informations des utilisateurs
    mapping(address => StakeInfo) public userInfo;
    
    // Récompenses par seconde
    uint256 public rewardPerSecond;
    
    // APR cible (50-80%)
    uint256 public targetAPR = 6500; // 65% (base 10000)
    uint256 public constant APR_DENOMINATOR = 10000;
    
    // Minimum de récompenses à distribuer
    uint256 public constant MINIMUM_REWARD = 1000 * 10**18; // 1000 tokens
    
    // Événements
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount);
    event Claim(address indexed user, uint256 amount);
    event RewardPerSecondUpdated(uint256 newRewardPerSecond);
    event TargetAPRUpdated(uint256 newTargetAPR);
    
    constructor(
        address _rewardToken,
        address _stakingToken,
        uint256 _rewardPerSecond
    ) {
        require(_rewardToken != address(0), "Invalid reward token");
        require(_stakingToken != address(0), "Invalid staking token");
        
        rewardToken = GreenHashToken(_rewardToken);
        
        poolInfo = PoolInfo({
            stakingToken: IERC20(_stakingToken),
            allocPoint: 1000,
            lastRewardTime: block.timestamp,
            accRewardPerShare: 0,
            totalStaked: 0,
            minimumStake: 100 * 10**18, // 100 tokens minimum
            lockPeriod: 7 days // Lock de 7 jours
        });
        
        rewardPerSecond = _rewardPerSecond;
    }
    
    // Définir le montant de récompenses par seconde
    function setRewardPerSecond(uint256 _rewardPerSecond) external onlyOwner {
        updatePool();
        rewardPerSecond = _rewardPerSecond;
        emit RewardPerSecondUpdated(_rewardPerSecond);
    }
    
    // Définir l'APR cible
    function setTargetAPR(uint256 _targetAPR) external onlyOwner {
        require(_targetAPR <= 10000, "Target APR cannot exceed 100%");
        targetAPR = _targetAPR;
        emit TargetAPRUpdated(_targetAPR);
    }
    
    // Mettre à jour les récompenses du pool
    function updatePool() public {
        PoolInfo storage pool = poolInfo;
        
        if (block.timestamp <= pool.lastRewardTime) {
            return;
        }
        
        if (pool.totalStaked == 0) {
            pool.lastRewardTime = block.timestamp;
            return;
        }
        
        uint256 multiplier = getMultiplier(pool.lastRewardTime, block.timestamp);
        uint256 reward = multiplier * rewardPerSecond;
        
        pool.accRewardPerShare += (reward * 1e12) / pool.totalStaked;
        pool.lastRewardTime = block.timestamp;
    }
    
    // Calculer le multiplicateur de temps
    function getMultiplier(uint256 _from, uint256 _to) public pure returns (uint256) {
        return _to - _from;
    }
    
    // Obtenir les récompenses en attente pour un utilisateur
    function pendingReward(address _user) external view returns (uint256) {
        PoolInfo memory pool = poolInfo;
        StakeInfo memory user = userInfo[_user];
        
        uint256 accRewardPerShare = pool.accRewardPerShare;
        
        if (block.timestamp > pool.lastRewardTime && pool.totalStaked != 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardTime, block.timestamp);
            uint256 reward = multiplier * rewardPerSecond;
            accRewardPerShare += (reward * 1e12) / pool.totalStaked;
        }
        
        return (user.amount * accRewardPerShare) / 1e12 - user.rewardDebt;
    }
    
    // Déposer des tokens
    function deposit(uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount >= poolInfo.minimumStake, "Deposit amount too low");
        
        PoolInfo storage pool = poolInfo;
        StakeInfo storage user = userInfo[msg.sender];
        
        updatePool();
        
        if (user.amount > 0) {
            uint256 pending = (user.amount * pool.accRewardPerShare) / 1e12 - user.rewardDebt;
            if (pending > 0) {
                safeRewardTransfer(msg.sender, pending);
            }
        }
        
        pool.stakingToken.safeTransferFrom(address(msg.sender), address(this), _amount);
        
        if (user.amount == 0) {
            user.depositTime = block.timestamp;
        }
        
        user.amount += _amount;
        user.lockEndTime = block.timestamp + pool.lockPeriod;
        user.rewardDebt = (user.amount * pool.accRewardPerShare) / 1e12;
        
        pool.totalStaked += _amount;
        
        emit Deposit(msg.sender, _amount);
    }
    
    // Retirer des tokens
    function withdraw(uint256 _amount) external nonReentrant {
        PoolInfo storage pool = poolInfo;
        StakeInfo storage user = userInfo[msg.sender];
        
        require(user.amount >= _amount, "Withdraw amount exceeds staked amount");
        require(block.timestamp >= user.lockEndTime, "Tokens are locked");
        
        updatePool();
        
        uint256 pending = (user.amount * pool.accRewardPerShare) / 1e12 - user.rewardDebt;
        if (pending > 0) {
            safeRewardTransfer(msg.sender, pending);
        }
        
        if (_amount > 0) {
            user.amount -= _amount;
            pool.stakingToken.safeTransfer(address(msg.sender), _amount);
        }
        
        user.rewardDebt = (user.amount * pool.accRewardPerShare) / 1e12;
        pool.totalStaked -= _amount;
        
        emit Withdraw(msg.sender, _amount);
    }
    
    // Réclamer les récompenses
    function claim() external nonReentrant {
        PoolInfo storage pool = poolInfo;
        StakeInfo storage user = userInfo[msg.sender];
        
        updatePool();
        
        uint256 pending = (user.amount * pool.accRewardPerShare) / 1e12 - user.rewardDebt;
        require(pending > 0, "No rewards to claim");
        
        user.rewardDebt = (user.amount * pool.accRewardPerShare) / 1e12;
        user.lastClaimTime = block.timestamp;
        
        safeRewardTransfer(msg.sender, pending);
        
        emit Claim(msg.sender, pending);
    }
    
    // Retrait d'urgence (sans récompenses)
    function emergencyWithdraw() external nonReentrant {
        PoolInfo storage pool = poolInfo;
        StakeInfo storage user = userInfo[msg.sender];
        
        uint256 amount = user.amount;
        require(amount > 0, "No tokens to withdraw");
        
        user.amount = 0;
        user.rewardDebt = 0;
        pool.totalStaked -= amount;
        
        pool.stakingToken.safeTransfer(address(msg.sender), amount);
        
        emit EmergencyWithdraw(msg.sender, amount);
    }
    
    // Transfert sécurisé des récompenses
    function safeRewardTransfer(address _to, uint256 _amount) internal {
        uint256 rewardBalance = rewardToken.balanceOf(address(this));
        
        if (_amount > rewardBalance) {
            rewardToken.transfer(_to, rewardBalance);
        } else {
            rewardToken.transfer(_to, _amount);
        }
    }
    
    // Obtenir les informations d'un utilisateur
    function getUserInfo(address _user) external view returns (StakeInfo memory) {
        return userInfo[_user];
    }
    
    // Obtenir les informations du pool
    function getPoolInfo() external view returns (PoolInfo memory) {
        return poolInfo;
    }
    
    // Obtenir l'APR actuelle
    function getCurrentAPR() external view returns (uint256) {
        if (poolInfo.totalStaked == 0) {
            return 0;
        }
        
        uint256 yearlyRewards = rewardPerSecond * 365 days;
        uint256 yearlyRewardsValue = yearlyRewards * 1e18; // Valeur du token de récompense
        uint256 totalStakedValue = poolInfo.totalStaked * 1e18; // Valeur du token staké
        
        return (yearlyRewardsValue * APR_DENOMINATOR) / totalStakedValue;
    }
    
    // Pause du contrat
    function pause() external onlyOwner {
        _pause();
    }
    
    // Reprise du contrat
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Retirer des tokens égarés
    function rescueTokens(address _token, uint256 _amount) external onlyOwner {
        require(_token != address(poolInfo.stakingToken), "Cannot rescue staking token");
        require(_token != address(rewardToken), "Cannot rescue reward token");
        
        IERC20(_token).safeTransfer(owner(), _amount);
    }
}