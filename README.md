# Green Hash Maroc 🌿

La première plateforme Web3 de minage écologique au Maroc, combinant investissement crypto et protection de l'environnement.

## 🚀 Fonctionnalités

- **Minage Écologique**: Utilisation d'énergies renouvelables à 100%
- **Staking Pool**: Gagnez jusqu'à 80% APR avec vos tokens GREENHASH
- **Exchange Décentralisé**: Swap BNB ↔ USDT ↔ GREENHASH avec 0.1% de frais écologiques
- **Simulateur de Minage**: Calculez votre rentabilité et impact environnemental
- **Système de Gouvernance**: Votez pour les initiatives écologiques
- **Transparence Totale**: Toutes les transactions sont traçables sur la blockchain

## 🛠️ Technologies Utilisées

### Frontend
- React 18 + Vite
- TailwindCSS
- Framer Motion (animations)
- Ethers.js (Web3)
- React Router DOM

### Backend
- Flask (Python)
- SQLAlchemy
- Flask-CORS
- Web3.py

### Blockchain
- Solidity 0.8.19
- Hardhat
- OpenZeppelin Contracts
- BNB Smart Chain (Testnet)

### Base de Données
- SQLite (développement)
- PostgreSQL (production)

## 📁 Structure du Projet

```
green-hash-maroc/
├── frontend/                 # Application React
│   ├── src/
│   │   ├── components/      # Composants React
│   │   ├── pages/           # Pages de l'application
│   │   ├── hooks/           # Hooks personnalisés
│   │   ├── utils/           # Utilitaires
│   │   └── context/         # Contexte Web3
│   └── public/              # Fichiers statiques
├── backend/                 # API Flask
│   ├── api/                 # Endpoints API
│   ├── models/              # Modèles SQLAlchemy
│   └── utils/               # Utilitaires backend
├── contracts/               # Smart contracts Solidity
│   ├── contracts/           # Fichiers .sol
│   ├── scripts/             # Scripts de déploiement
│   └── test/                # Tests
└── docs/                    # Documentation
```

## 🚦 Démarrage Rapide

### Prérequis
- Node.js 18+
- Python 3.8+
- MetaMask
- Git

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/yourusername/green-hash-maroc.git
cd green-hash-maroc
```

2. **Installer les dépendances frontend**
```bash
cd frontend
npm install
```

3. **Installer les dépendances backend**
```bash
cd ../backend
pip install -r requirements.txt
```

4. **Installer les dépendances des contrats**
```bash
cd ../contracts
npm install
```

5. **Configurer les variables d'environnement**
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Remplir les variables dans .env
```

### Développement Local

1. **Démarrer le backend**
```bash
cd backend
python app.py
```

2. **Démarrer le frontend**
```bash
cd frontend
npm run dev
```

3. **Déployer les contrats (testnet)**
```bash
cd contracts
npm run deploy:testnet
```

L'application sera accessible sur `http://localhost:3000`

## 🔗 Configuration Blockchain

### Réseau BSC Testnet
- **Chain ID**: 97
- **RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545/
- **Explorateur**: https://testnet.bscscan.com

### Contrats Déployés
- **GreenHashToken**: `0x...` (à remplacer après déploiement)
- **GreenStakingPool**: `0x...` (à remplacer après déploiement)

## 📊 API Endpoints

### Prix
- `GET /api/prices/live` - Prix en temps réel des cryptomonnaies
- `GET /api/prices/history/<crypto_id>` - Historique des prix

### DEX
- `GET /api/dex/quote` - Devis pour un échange
- `GET /api/dex/tokens` - Liste des tokens supportés

### Minage
- `POST /api/mining/calculate` - Calculer la rentabilité du minage
- `GET /api/mining/equipment` - Liste des équipements de minage

### Transactions
- `POST /api/transactions/log` - Enregistrer une transaction
- `GET /api/transactions/history/<address>` - Historique des transactions

### Pool
- `GET /api/pool/stats` - Statistiques du pool de staking
- `GET /api/pool/leaderboard` - Classement des stakers

## 🌱 Impact Écologique

- **Réduction CO₂**: 100% par rapport au minage traditionnel
- **Énergie Renouvelable**: 100% de notre consommation
- **Taxe Écologique**: 0.1% sur chaque transaction
- **Reforestation**: 1 arbre planté pour chaque 1000 transactions

## 🔐 Sécurité

- Smart contracts audités
- Tests unitaires complets
- Protection contre les attaques courantes
- Transparence totale des opérations

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues! Veuillez lire [CONTRIBUTING.md](CONTRIBUTING.md) pour les détails.

## 📞 Support

- **Email**: contact@greenhashmaroc.com
- **Discord**: [Rejoindre notre serveur](https://discord.gg/greenhash)
- **Telegram**: [Rejoindre notre groupe](https://t.me/greenhashmaroc)

## 🗺️ Feuille de Route

### Q1 2024
- [x] Lancement du MVP
- [x] Déploiement sur BSC Testnet
- [x] Interface utilisateur complète

### Q2 2024
- [ ] Audit des smart contracts
- [ ] Lancement sur BSC Mainnet
- [ ] Partenariats énergétiques

### Q3 2024
- [ ] Expansion internationale
- [ ] Mobile app
- [ ] Système de gouvernance DAO

### Q4 2024
- [ ] Intégration d'autres blockchains
- [ ] Marketplace NFT écologiques
- [ ] Programme de parrainage

---

**Green Hash Maroc** - Miner vert, investir intelligent, protéger la planète. 🌍✨