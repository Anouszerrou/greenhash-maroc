# Configuration Web3 - Green Hash Maroc

Ce document explique comment configurer et utiliser les fonctionnalités Web3 de Green Hash Maroc.

## 🔗 Configuration Blockchain

### Réseaux Supportés

#### BSC Testnet (Recommandé pour le développement)
- **Chain ID**: 97
- **RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545/
- **Currency Symbol**: BNB
- **Block Explorer**: https://testnet.bscscan.com

#### BSC Mainnet (Production)
- **Chain ID**: 56
- **RPC URL**: https://bsc-dataseed.binance.org/
- **Currency Symbol**: BNB
- **Block Explorer**: https://bscscan.com

### Smart Contracts

#### GreenHashToken (ERC20/BEP20)
- **Nom**: Green Hash Token
- **Symbole**: GREENHASH
- **Décimales**: 18
- **Supply Total**: 100,000,000 GHT
- **Taxe Écologique**: 0.1%

#### GreenStakingPool
- **Type**: Pool de staking avec récompenses
- **APR**: Variable (50-80%)
- **Lock Period**: 7 jours minimum
- **Récompenses**: Distribuées automatiquement

## 🔐 Intégration MetaMask

### 1. Configuration du Réseau

```javascript
// Configuration BSC Testnet
const BSC_TESTNET_CONFIG = {
  chainId: '0x61', // 97 en hexadécimal
  chainName: 'BNB Smart Chain Testnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  blockExplorerUrls: ['https://testnet.bscscan.com/']
};

// Fonction pour ajouter le réseau
async function addBSCNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [BSC_TESTNET_CONFIG]
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du réseau:', error);
  }
}
```

### 2. Connexion du Wallet

```javascript
import { ethers } from 'ethers';

async function connectWallet() {
  try {
    // Vérifier si MetaMask est installé
    if (!window.ethereum) {
      throw new Error('MetaMask n\'est pas installé');
    }
    
    // Demander l'accès aux comptes
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    
    // Créer le provider et signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Vérifier le réseau
    const network = await provider.getNetwork();
    if (network.chainId !== 97) {
      await addBSCNetwork();
    }
    
    return {
      account: accounts[0],
      provider,
      signer
    };
    
  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
}
```

## 📱 Utilisation des Smart Contracts

### 1. GreenHashToken

#### ABI Simplifié
```javascript
const GREENHASH_TOKEN_ABI = [
  // Lecture
  "function balanceOf(address account) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  
  // Écriture
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // Événements
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event EcologicalTaxCollected(address indexed from, address indexed to, uint256 amount)"
];
```

#### Exemple d'Utilisation
```javascript
// Obtenir le solde
tokenContract.balanceOf(userAddress).then(balance => {
  console.log('Solde:', ethers.utils.formatEther(balance));
});

// Transférer des tokens
const amount = ethers.utils.parseEther('1000');
tokenContract.transfer(recipientAddress, amount).then(tx => {
  console.log('Transaction:', tx.hash);
  return tx.wait();
}).then(receipt => {
  console.log('Transaction confirmée:', receipt.status);
});
```

### 2. GreenStakingPool

#### ABI Simplifié
```javascript
const STAKING_POOL_ABI = [
  // Lecture
  "function userInfo(address user) view returns (uint256 amount, uint256 rewardDebt, uint256 depositTime, uint256 lockEndTime, uint256 lastClaimTime)",
  "function pendingReward(address user) view returns (uint256)",
  "function poolInfo() view returns (address stakingToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accRewardPerShare, uint256 totalStaked, uint256 minimumStake, uint256 lockPeriod)",
  "function getCurrentAPR() view returns (uint256)",
  
  // Écriture
  "function deposit(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function claim()",
  "function emergencyWithdraw()",
  
  // Événements
  "event Deposit(address indexed user, uint256 amount)",
  "event Withdraw(address indexed user, uint256 amount)",
  "event Claim(address indexed user, uint256 amount)",
  "event EmergencyWithdraw(address indexed user, uint256 amount)"
];
```

#### Exemple d'Utilisation
```javascript
// Staker des tokens
const stakeAmount = ethers.utils.parseEther('1000');
stakingPoolContract.deposit(stakeAmount).then(tx => {
  console.log('Staking transaction:', tx.hash);
  return tx.wait();
});

// Réclamer les récompenses
stakingPoolContract.claim().then(tx => {
  console.log('Claim transaction:', tx.hash);
  return tx.wait();
});

// Obtenir les récompenses en attente
stakingPoolContract.pendingReward(userAddress).then(pending => {
  console.log('Récompenses en attente:', ethers.utils.formatEther(pending));
});
```

## 🔄 Écouter les Événements

### 1. Événements du Token

```javascript
// Écouter les transferts
tokenContract.on('Transfer', (from, to, value, event) => {
  console.log(`Transfert de ${ethers.utils.formatEther(value)} GHT`);
  console.log(`De: ${from} vers: ${to}`);
});

// Écouter la taxe écologique
tokenContract.on('EcologicalTaxCollected', (from, to, amount) => {
  console.log(`Taxe écologique collectée: ${ethers.utils.formatEther(amount)} GHT`);
});
```

### 2. Événements du Pool

```javascript
// Écouter les dépôts
stakingPoolContract.on('Deposit', (user, amount) => {
  console.log(`Nouveau staking de ${ethers.utils.formatEther(amount)} GHT par ${user}`);
});

// Écouter les retraits
stakingPoolContract.on('Withdraw', (user, amount) => {
  console.log(`Retrait de ${ethers.utils.formatEther(amount)} GHT par ${user}`);
});
```

## 💰 Calcul des Frais

### Taxe Écologique (0.1%)
```javascript
function calculateEcologicalTax(amount) {
  const taxRate = 10; // 0.1% = 10 / 10000
  const tax = amount.mul(taxRate).div(10000);
  return tax;
}

// Exemple d'utilisation
const amount = ethers.utils.parseEther('1000');
const tax = calculateEcologicalTax(amount);
console.log(`Taxe écologique: ${ethers.utils.formatEther(tax)} GHT`);
```

### Frais de Gaz

```javascript
// Estimer les frais de gaz pour une transaction
async function estimateGas(contract, method, params) {
  try {
    const gasEstimate = await contract.estimateGas[method](...params);
    const gasPrice = await contract.provider.getGasPrice();
    const gasFee = gasEstimate.mul(gasPrice);
    
    return {
      gasEstimate,
      gasPrice,
      gasFee
    };
  } catch (error) {
    console.error('Erreur lors de l\estimation du gaz:', error);
    throw error;
  }
}
```

## 🛡️ Bonnes Pratiques de Sécurité

### 1. Validation des Adresses
```javascript
function isValidAddress(address) {
  return ethers.utils.isAddress(address);
}

function validateAddress(address) {
  if (!isValidAddress(address)) {
    throw new Error('Adresse invalide');
  }
  return ethers.utils.getAddress(address); // Checksum
}
```

### 2. Protection contre les Attaques de Frontrunning
```javascript
// Utiliser des valeurs de slippage raisonnables
const SLIPPAGE_TOLERANCE = 50; // 0.5% = 50 / 10000

function calculateMinimumAmount(amount) {
  return amount.mul(10000 - SLIPPAGE_TOLERANCE).div(10000);
}
```

### 3. Gestion des Erreurs
```javascript
async function safeContractCall(contract, method, params, value = 0) {
  try {
    const tx = await contract[method](...params, { value });
    console.log('Transaction hash:', tx.hash);
    
    const receipt = await tx.wait();
    if (receipt.status === 0) {
      throw new Error('Transaction échouée');
    }
    
    return receipt;
  } catch (error) {
    console.error('Erreur lors de l\'appel du contrat:', error);
    throw error;
  }
}
```

## 📊 Outils de Débogage

### 1. Vérifier les Logs
```javascript
// Activer les logs détaillés
window.ethereum.on('message', (message) => {
  console.log('MetaMask Message:', message);
});

window.ethereum.on('error', (error) => {
  console.error('MetaMask Error:', error);
});
```

### 2. Vérifier les Balances
```javascript
async function checkBalances(address) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  // Balance BNB
  const bnbBalance = await provider.getBalance(address);
  console.log('BNB Balance:', ethers.utils.formatEther(bnbBalance));
  
  // Balance GREENHASH
  const tokenBalance = await tokenContract.balanceOf(address);
  console.log('GREENHASH Balance:', ethers.utils.formatEther(tokenBalance));
}
```

## 🌐 Déploiement en Production

### 1. Configuration du Réseau Mainnet
```javascript
const BSC_MAINNET_CONFIG = {
  chainId: '0x38', // 56 en hexadécimal
  chainName: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/']
};
```

### 2. Vérification des Contrats
```javascript
// Vérifier que le contrat est bien déployé
async function verifyContract(contractAddress, abi) {
  try {
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const name = await contract.name();
    const symbol = await contract.symbol();
    
    console.log('Contrat vérifié:', { name, symbol });
    return true;
  } catch (error) {
    console.error('Erreur de vérification:', error);
    return false;
  }
}
```

## 📚 Ressources Supplémentaires

- [Documentation Ethers.js](https://docs.ethers.io/)
- [Documentation MetaMask](https://docs.metamask.io/)
- [Guide Solidity](https://docs.soliditylang.org/)
- [Best Practices Web3](https://consensys.github.io/smart-contract-best-practices/)

---

**Note**: Toujours tester sur le testnet avant de déployer en production!