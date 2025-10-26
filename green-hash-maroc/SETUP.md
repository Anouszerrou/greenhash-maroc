# Guide d'Installation - Green Hash Maroc

Ce guide vous aidera à installer et configurer Green Hash Maroc sur votre machine locale.

## 📋 Prérequis

### Logiciels Requis
- **Node.js**: 18.0.0 ou supérieur
- **Python**: 3.8.0 ou supérieur
- **Git**: Dernière version stable
- **MetaMask**: Extension navigateur

### Système d'Exploitation
- Windows 10/11
- macOS 10.15+
- Ubuntu 20.04+ / Debian 10+

## 🚀 Installation Étapes par Étapes

### 1. Cloner le Repository

```bash
# Cloner le projet
git clone https://github.com/yourusername/green-hash-maroc.git

# Entrer dans le dossier
cd green-hash-maroc
```

### 2. Configuration de l'Environnement

#### Frontend (React)

```bash
# Naviguer dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local
```

#### Backend (Flask)

```bash
# Naviguer dans le dossier backend
cd ../backend

# Créer un environnement virtuel Python
python -m venv venv

# Activer l'environnement virtuel
# Sur Windows:
venv\Scripts\activate
# Sur macOS/Linux:
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Copier le fichier d'environnement
cp .env.example .env
```

#### Smart Contracts

```bash
# Naviguer dans le dossier contracts
cd ../contracts

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env
```

### 3. Configuration des Variables d'Environnement

#### Frontend (.env.local)

```env
# Configuration Blockchain
VITE_APP_CHAIN_ID=97
VITE_APP_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
VITE_APP_CONTRACT_ADDRESS=your_token_contract_address_here

# Configuration API
VITE_APP_API_URL=http://localhost:5000/api
```

#### Backend (.env)

```env
# Configuration Blockchain
PRIVATE_KEY=your_private_key_here
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/
CHAIN_ID=97

# Configuration Backend
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
DATABASE_URL=sqlite:///greenhash.db
SECRET_KEY=your_secret_key_here

# Configuration API
COINGECKO_API_URL=https://api.coingecko.com/api/v3

# Adresses des Contrats
GREENHASH_TOKEN_ADDRESS=your_token_contract_address
STAKING_POOL_ADDRESS=your_staking_pool_address
```

#### Smart Contracts (.env)

```env
# Clé privée pour le déploiement
PRIVATE_KEY=your_private_key_here

# RPC URLs
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/
BSC_MAINNET_RPC=https://bsc-dataseed.binance.org/

# Clés API
BSCSCAN_API_KEY=your_bscscan_api_key

# Wallet écologique
ECOLOGICAL_WALLET=your_ecological_wallet_address
```

### 4. Configuration de la Base de Données

```bash
# Naviguer dans le dossier backend
cd backend

# Créer la base de données
python
>>> from app import db, app
>>> with app.app_context():
...     db.create_all()
...     print("Base de données créée avec succès!")
>>> exit()
```

### 5. Configuration de MetaMask

1. **Installer MetaMask** depuis le Chrome Web Store
2. **Créer un nouveau wallet** ou importer un wallet existant
3. **Ajouter le réseau BSC Testnet**:
   - Network Name: BSC Testnet
   - RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
   - Chain ID: 97
   - Currency Symbol: BNB
   - Block Explorer URL: https://testnet.bscscan.com
4. **Obtenir des BNB de testnet** depuis [BNB Faucet](https://testnet.binance.org/faucet-smart)

## 🏃‍♂️ Démarrage Local

### 1. Démarrer le Backend

```bash
cd backend
python app.py
```

Le backend démarrera sur `http://localhost:5000`

### 2. Démarrer le Frontend

Dans un nouveau terminal:
```bash
cd frontend
npm run dev
```

Le frontend démarrera sur `http://localhost:3000`

### 3. Déployer les Contrats (Optionnel)

```bash
cd contracts
npm run deploy:testnet
```

## 🧪 Tests

### Tests Frontend
```bash
cd frontend
npm test
```

### Tests Backend
```bash
cd backend
python -m pytest
```

### Tests Smart Contracts
```bash
cd contracts
npm test
```

## 🛠️ Commandes Utiles

### Frontend
```bash
npm run dev          # Démarrer en mode développement
npm run build        # Construire pour la production
npm run preview      # Prévisualiser la build de production
npm run lint         # Linter le code
```

### Backend
```bash
python app.py        # Démarrer le serveur Flask
flask shell          # Console Python avec contexte Flask
```

### Smart Contracts
```bash
npm run compile      # Compiler les contrats
npm run deploy       # Déployer sur le réseau local
npm run deploy:testnet  # Déployer sur BSC Testnet
npm test             # Exécuter les tests
```

## 🔧 Dépannage

### Problèmes Courants

#### 1. Erreur de connexion MetaMask
- Vérifiez que MetaMask est installé
- Assurez-vous d'être sur le bon réseau (BSC Testnet)
- Vérifiez que vous avez des BNB de testnet

#### 2. Erreur CORS
- Vérifiez que le backend est démarré
- Vérifiez la configuration CORS dans `app.py`

#### 3. Erreur de compilation Solidity
- Vérifiez la version de Solidity (0.8.19)
- Nettoyez le cache: `npx hardhat clean`

#### 4. Erreur de base de données
- Vérifiez les permissions du fichier SQLite
- Supprimez et recréez la base de données si nécessaire

### Ressources d'Aide

- [Documentation MetaMask](https://docs.metamask.io/)
- [Documentation Hardhat](https://hardhat.org/docs)
- [Documentation Flask](https://flask.palletsprojects.com/)
- [Documentation React](https://react.dev/)

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifiez la [FAQ](docs/FAQ.md)
2. Consultez les [issues GitHub](https://github.com/yourusername/green-hash-maroc/issues)
3. Contactez le support: contact@greenhashmaroc.com

## 🎉 Félicitations!

Vous avez maintenant Green Hash Maroc installé et fonctionnel sur votre machine locale. 
Commencez à explorer les fonctionnalités et contribuez à un avenir plus vert! 🌱

---

**Note**: N'oubliez pas de garder vos clés privées sécurisées et ne jamais les partager!