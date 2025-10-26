# Smart Contracts - Green Hash Maroc

Documentation technique détaillée des smart contracts Solidity de Green Hash Maroc.

## 📋 Vue d'Ensemble

### Architecture des Contrats

```
Green Hash Maroc Smart Contracts
├── GreenHashToken.sol          # Token principal ERC20/BEP20
├── GreenStakingPool.sol        # Pool de staking avec récompenses
└── Libraries/
    └── SafeMath.sol            # Bibliothèque mathématique sécurisée
```

## 🔧 GreenHashToken.sol

### Caractéristiques Principales

- **Standard**: ERC20/BEP20
- **Nom**: Green Hash Token
- **Symbole**: GREENHASH
- **Décimales**: 18
- **Supply Total**: 100,000,000 GHT

### Fonctionnalités

#### 1. Taxe Écologique (0.1%)
```solidity
uint256 public constant ECOLOGICAL_TAX = 10; // 0.1% = 10 / 10000
uint256 public constant TAX_DENOMINATOR = 10000;
```

Chaque transfert (sauf exceptions) est soumis à une taxe de 0.1% qui est envoyée au wallet écologique.

#### 2. Contrôle d'Accès
- **Owner**: Peut mint, brûler, et gérer le contrat
- **Pausing**: Fonctionnalité de pause d'urgence
- **Whitelist**: Exonération de taxe pour certaines adresses

#### 3. Fonctions Principales

```solidity
// Transfert avec taxe écologique
function _transfer(address sender, address recipient, uint256 amount) internal override whenNotPaused

// Minting (uniquement owner)
function mint(address to, uint256 amount) external onlyOwner

// Brûlage (uniquement owner)
function burnFrom(address account, uint256 amount) public override onlyOwner

// Gestion du wallet écologique
function setEcologicalWallet(address _newWallet) external onlyOwner
```

### Événements

```solidity
event EcologicalTaxCollected(address indexed from, address indexed to, uint256 amount);
event EcologicalWalletChanged(address indexed oldWallet, address indexed newWallet);
```

## 🏊‍♂️ GreenStakingPool.sol

### Caractéristiques Principales

- **Type**: Pool de staking avec récompenses variables
- **Token de Staking**: GREENHASH
- **Token de Récompense**: GREENHASH
- **APR**: Variable (50-80%)

### Architecture des Données

#### Struct UserInfo
```solidity
struct StakeInfo {
    uint256 amount;           // Montant staké
    uint256 rewardDebt;       // Dette de récompenses
    uint256 depositTime;      // Timestamp du dépôt
    uint256 lockEndTime;      // Fin du lock (0 si pas de lock)
    uint256 lastClaimTime;    // Dernier claim
}
```

#### Struct PoolInfo
```solidity
struct PoolInfo {
    IERC20 stakingToken;      // Token à staker
    uint256 allocPoint;       // Points d'allocation
    uint256 lastRewardTime;   // Dernier calcul de récompenses
    uint256 accRewardPerShare; // Récompenses accumulées par share
    uint256 totalStaked;      // Total staké dans le pool
    uint256 minimumStake;     // Montant minimum à staker
    uint256 lockPeriod;       // Période de lock en secondes
}
```

### Fonctionnalités

#### 1. Système de Récompenses
```solidity
uint256 public rewardPerSecond; // Récompenses par seconde
uint256 public targetAPR;       // APR cible (base 10000)
```

Le système ajuste automatiquement les récompenses pour maintenir l'APR cible.

#### 2. Gestion des Stakes

```solidity
// Dépôt de tokens
function deposit(uint256 amount) external nonReentrant whenNotPaused

// Retrait de tokens
function withdraw(uint256 amount) external nonReentrant

// Réclamation des récompenses
function claim() external nonReentrant

// Retrait d'urgence (sans récompenses)
function emergencyWithdraw() external nonReentrant
```

#### 3. Calcul des Récompenses

```solidity
// Mettre à jour le pool
function updatePool() public

// Obtenir les récompenses en attente
function pendingReward(address user) external view returns (uint256)

// Obtenir l'APR actuelle
function getCurrentAPR() external view returns (uint256)
```

### Sécurité

#### Protection contre les Attaques
- **ReentrancyGuard**: Protection contre les attaques de réentrance
- **Pausable**: Possibilité de pauser en cas d'urgence
- **Access Control**: Contrôle d'accès par rôles

#### Limites de Sécurité
- **Minimum Stake**: 100 GHT
- **Lock Period**: 7 jours minimum
- **Slippage Protection**: Protection contre les variations de prix

### Événements

```solidity
event Deposit(address indexed user, uint256 amount);
event Withdraw(address indexed user, uint256 amount);
event EmergencyWithdraw(address indexed user, uint256 amount);
event Claim(address indexed user, uint256 amount);
event RewardPerSecondUpdated(uint256 newRewardPerSecond);
event TargetAPRUpdated(uint256 newTargetAPR);
```

## 🚀 Déploiement

### 1. Configuration Hardhat

```javascript
// hardhat.config.js
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC,
      chainId: 97,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

### 2. Script de Déploiement

```javascript
// scripts/deploy.js
async function main() {
  const [deployer] = await ethers.getSigners();
  
  // Déployer le token
  const GreenHashToken = await ethers.getContractFactory("GreenHashToken");
  const token = await GreenHashToken.deploy(ecologicalWallet);
  
  // Déployer le pool de staking
  const GreenStakingPool = await ethers.getContractFactory("GreenStakingPool");
  const pool = await GreenStakingPool.deploy(
    token.address,      // Token de récompense
    token.address,      // Token à staker
    rewardPerSecond     // Récompenses par seconde
  );
  
  // Transférer des tokens pour les récompenses
  await token.transfer(pool.address, rewardAmount);
}
```

### 3. Vérification des Contrats

```bash
# Compiler les contrats
npx hardhat compile

# Déployer sur le testnet
npx hardhat run scripts/deploy.js --network bscTestnet

# Vérifier sur BscScan
npx hardhat verify --network bscTestnet CONTRACT_ADDRESS
```

## 🧪 Tests

### Tests Unitaires

```solidity
// test/GreenHashToken.test.js
describe("GreenHashToken", function () {
  it("Should deploy with correct initial supply", async function () {
    const Token = await ethers.getContractFactory("GreenHashToken");
    const token = await Token.deploy(owner.address);
    
    expect(await token.totalSupply()).to.equal(
      ethers.utils.parseEther("100000000")
    );
  });
  
  it("Should collect ecological tax on transfer", async function () {
    const amount = ethers.utils.parseEther("1000");
    await token.transfer(addr1.address, amount);
    
    const taxAmount = amount.mul(10).div(10000);
    expect(await token.balanceOf(ecologicalWallet.address))
      .to.equal(taxAmount);
  });
});
```

### Tests d'Intégration

```solidity
// test/GreenStakingPool.test.js
describe("GreenStakingPool", function () {
  it("Should allow staking and earning rewards", async function () {
    const stakeAmount = ethers.utils.parseEther("1000");
    
    // Approuver le pool
    await token.approve(pool.address, stakeAmount);
    
    // Staker
    await pool.deposit(stakeAmount);
    
    // Avancer dans le temps
    await ethers.provider.send("evm_increaseTime", [86400]); // 1 jour
    await ethers.provider.send("evm_mine");
    
    // Vérifier les récompenses
    const pending = await pool.pendingReward(owner.address);
    expect(pending).to.be.gt(0);
  });
});
```

## 🔐 Sécurité

### Bonnes Pratiques Implémentées

1. **Checks-Effects-Interactions Pattern**
```solidity
function withdraw(uint256 amount) external nonReentrant {
    // Checks
    require(user.amount >= amount, "Insufficient balance");
    require(block.timestamp >= user.lockEndTime, "Tokens locked");
    
    // Effects
    user.amount -= amount;
    user.rewardDebt = (user.amount * pool.accRewardPerShare) / 1e12;
    pool.totalStaked -= amount;
    
    // Interactions
    pool.stakingToken.safeTransfer(msg.sender, amount);
    
    emit Withdraw(msg.sender, amount);
}
```

2. **Utilisation de SafeERC20**
```solidity
using SafeERC20 for IERC20;
// Utiliser safeTransfer au lieu de transfer
pool.stakingToken.safeTransfer(msg.sender, amount);
```

3. **Protection contre les Dépassements**
```solidity
// Utilisation de SafeMath (intégré dans Solidity 0.8+)
uint256 reward = multiplier.mul(rewardPerSecond);
```

### Vérifications de Sécurité

#### 1. ReentrancyGuard
```solidity
contract GreenStakingPool is ReentrancyGuard {
    function deposit(uint256 amount) external nonReentrant {
        // Code protégé contre la réentrance
    }
}
```

#### 2. Pausable
```solidity
function deposit(uint256 amount) external nonReentrant whenNotPaused {
    // Code qui ne s'exécute que si le contrat n'est pas en pause
}
```

#### 3. Access Control
```solidity
function setRewardPerSecond(uint256 _rewardPerSecond) external onlyOwner {
    // Seulement le propriétaire peut appeler cette fonction
}
```

## 📊 Optimisation des Performances

### 1. Réduction des Coûts de Gaz

```solidity
// Utilisation de structs packés
struct UserInfo {
    uint128 amount;        // Réduit la taille
    uint128 rewardDebt;    // Réduit la taille
    uint64 depositTime;    // Suffisant pour les timestamps
    uint64 lockEndTime;    // Suffisant pour les timestamps
    uint64 lastClaimTime;  // Suffisant pour les timestamps
}
```

### 2. Batch Operations

```solidity
// Pour les opérations multiples
function batchUpdateUsers(address[] calldata users) external onlyOwner {
    for (uint i = 0; i < users.length; i++) {
        _updateUser(users[i]);
    }
}
```

## 🌐 Intégration Frontend

### 1. Configuration Ethers.js

```javascript
import { ethers } from 'ethers';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const tokenContract = new ethers.Contract(
  TOKEN_ADDRESS,
  GREENHASH_TOKEN_ABI,
  signer
);

const stakingContract = new ethers.Contract(
  STAKING_POOL_ADDRESS,
  STAKING_POOL_ABI,
  signer
);
```

### 2. Gestion des Transactions

```javascript
async function stakeTokens(amount) {
  try {
    // Approuver le contrat
    const approveTx = await tokenContract.approve(
      STAKING_POOL_ADDRESS,
      amount
    );
    await approveTx.wait();
    
    // Staker
    const stakeTx = await stakingContract.deposit(amount);
    await stakeTx.wait();
    
    console.log('Staking réussi!');
  } catch (error) {
    console.error('Erreur lors du staking:', error);
  }
}
```

## 📈 Monitoring et Maintenance

### 1. Événements à Surveiller

```solidity
// Surveiller les grandes transactions
event LargeTransfer(address indexed from, address indexed to, uint256 amount);

function _transfer(address sender, address recipient, uint256 amount) internal override {
    if (amount > LARGE_TRANSFER_THRESHOLD) {
        emit LargeTransfer(sender, recipient, amount);
    }
    super._transfer(sender, recipient, amount);
}
```

### 2. Fonctions de Maintenance

```solidity
// Migration des données si nécessaire
function migrateUserData(address[] calldata users, uint256[] calldata amounts) external onlyOwner {
    require(users.length == amounts.length, "Length mismatch");
    
    for (uint i = 0; i < users.length; i++) {
        userInfo[users[i]].amount = amounts[i];
        userInfo[users[i]].rewardDebt = 0;
    }
}
```

## 🔮 Améliorations Futures

### 1. Système de Gouvernance
```solidity
// Vote pour les paramètres du pool
function voteForAPRChange(uint256 newAPR) external {
    require(userInfo[msg.sender].amount > MINIMUM_VOTE_STAKE);
    // Implémentation du système de vote
}
```

### 2. Récompenses Multi-Tokens
```solidity
// Support de plusieurs tokens de récompense
mapping(address => uint256) public rewardTokens;

function addRewardToken(address token, uint256 allocPoint) external onlyOwner {
    rewardTokens[token] = allocPoint;
}
```

### 3. NFT Staking
```solidity
// Staking avec NFTs pour des boosters
function stakeWithNFT(uint256 amount, uint256 nftId) external {
    uint256 booster = getNFTBooster(nftId);
    uint256 boostedAmount = amount.mul(booster).div(100);
    // Logique de staking avec booster
}
```

---

**Note**: Ces contrats ont été conçus avec une sécurité maximale et une efficacité optimale. Toujours effectuer des audits avant le déploiement en production!