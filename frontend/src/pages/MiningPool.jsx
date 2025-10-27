import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../context/Web3Context';
import { Zap, TrendingUp, Clock, Shield, DollarSign, Leaf } from 'lucide-react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import PendingTransactionsList from '../components/PendingTransactionsList';

// FIX: Add staking contract ABI
const STAKING_POOL_ABI = [
  "function deposit(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function claim()",
  "function userInfo(address) view returns (uint256 amount, uint256 rewardDebt, uint256 depositTime)"
];

const MiningPool = () => {
  const { 
    account, 
    connectWallet, 
    safeContractCall, 
    connectContract,
    estimateGasWithPrice,
    balance 
  } = useWeb3();

  // FIX: Get staking contract address from env
  const STAKING_POOL_ADDRESS = import.meta.env.VITE_STAKING_POOL_ADDRESS || 
    import.meta.env.VITE_APP_STAKING_POOL_ADDRESS || null;

  const [stakeAmount, setStakeAmount] = useState('');
  const [userStaked, setUserStaked] = useState('0');
  const [totalStaked, setTotalStaked] = useState('1250000');
  const [currentAPR, setCurrentAPR] = useState('65');
  const [userRewards, setUserRewards] = useState('0');
  const [isStaking, setIsStaking] = useState(false);
  const [poolStats, setPoolStats] = useState({
    activeStakers: 2847,
    totalRewardsDistributed: '890000',
    averageAPY: '72.5',
    lockPeriod: '7 jours'
  });

  useEffect(() => {
    // Simuler la récupération des données du pool
    if (account) {
      // Dans une vraie implémentation, on récupérerait depuis le smart contract
      setUserStaked('15000');
      setUserRewards('2500');
    }
  }, [account]);

  const handleStake = async () => {
    if (!account) {
      toast.error('Veuillez connecter votre wallet');
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Veuillez entrer un montant valide');
      return;
    }

    setIsStaking(true);
    try {
      if (STAKING_POOL_ADDRESS) {
        const contract = connectContract(STAKING_POOL_ADDRESS, STAKING_POOL_ABI);
        if (!contract) throw new Error('Impossible de connecter le contrat de staking');

        const receipt = await safeContractCall(async ({ signer, estimateGasWithPrice }) => {
          const contractWithSigner = contract.connect(signer);
          const amount = ethers.utils.parseUnits(stakeAmount.toString(), 18);
          const populated = await contractWithSigner.populateTransaction.deposit(amount);
          const { gasLimit, gasPrice } = await estimateGasWithPrice(() => populated);
          const tx = await contractWithSigner.deposit(amount, { gasLimit, gasPrice });
          return tx;
        });

        if (receipt) {
          toast.success(`Staking de ${stakeAmount} GREENHASH confirmé!`);
          setUserStaked((prev) => ethers.utils.formatUnits(
            ethers.utils.parseUnits(prev).add(
              ethers.utils.parseUnits(stakeAmount)
            )
          ));
          setStakeAmount('');
        }
      } else {
        // FIX: Fallback to simulation via safeContractCall
        const fakeReceipt = await safeContractCall(() => {
          const fakeTx = {
            hash: '0x' + Math.random().toString(16).slice(2, 66),
            wait: async () => new Promise(resolve => setTimeout(() => resolve({ 
              status: 1, 
              transactionHash: '0xsimulated'
            }), 2000))
          };
          return Promise.resolve(fakeTx);
        });

        if (fakeReceipt) {
          toast.success(`Staking de ${stakeAmount} GREENHASH (simulation) réussi!`);
          setUserStaked((parseFloat(userStaked) + parseFloat(stakeAmount)).toString());
          setStakeAmount('');
        }
      }
    } catch (error) {
      toast.error('Erreur lors du staking');
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!account || parseFloat(userRewards) <= 0) {
      toast.error('Aucune récompense à réclamer');
      return;
    }

    try {
      if (STAKING_POOL_ADDRESS) {
        const contract = connectContract(STAKING_POOL_ADDRESS, STAKING_POOL_ABI);
        const receipt = await safeContractCall(async ({ signer, estimateGasWithPrice }) => {
          const contractWithSigner = contract.connect(signer);
          const populated = await contractWithSigner.populateTransaction.claim();
          const { gasLimit, gasPrice } = await estimateGasWithPrice(() => populated);
          const tx = await contractWithSigner.claim({ gasLimit, gasPrice });
          return tx;
        });

        if (receipt) {
          toast.success(`Récompenses de ${userRewards} GREENHASH réclamées!`);
          setUserRewards('0');
        }
      } else {
        const fakeReceipt = await safeContractCall(() => {
          const fakeTx = {
            hash: '0x' + Math.random().toString(16).slice(2, 66),
            wait: async () => new Promise(resolve => setTimeout(() => resolve({ 
              status: 1, 
              transactionHash: '0xsimulated-claim'
            }), 1500))
          };
          return Promise.resolve(fakeTx);
        });

        if (fakeReceipt) {
          toast.success(`Récompenses de ${userRewards} GREENHASH (simulation) réclamées!`);
          setUserRewards('0');
        }
      }
    } catch (error) {
      toast.error(`Erreur lors de la réclamation: ${error.message}`);
    }
  };

  const handleUnstake = async () => {
    if (!account || parseFloat(userStaked) <= 0) {
      toast.error('Aucun montant à retirer');
      return;
    }

    try {
      if (STAKING_POOL_ADDRESS) {
        const contract = connectContract(STAKING_POOL_ADDRESS, STAKING_POOL_ABI);
        const amount = ethers.utils.parseUnits(userStaked.toString(), 18);
        const receipt = await safeContractCall(async ({ signer, estimateGasWithPrice }) => {
          const contractWithSigner = contract.connect(signer);
          const populated = await contractWithSigner.populateTransaction.withdraw(amount);
          const { gasLimit, gasPrice } = await estimateGasWithPrice(() => populated);
          const tx = await contractWithSigner.withdraw(amount, { gasLimit, gasPrice });
          return tx;
        });

        if (receipt) {
          toast.success(`Retrait de ${userStaked} GREENHASH confirmé!`);
          setUserStaked('0');
        }
      } else {
        const fakeReceipt = await safeContractCall(() => {
          const fakeTx = {
            hash: '0x' + Math.random().toString(16).slice(2, 66),
            wait: async () => new Promise(resolve => setTimeout(() => resolve({ 
              status: 1, 
              transactionHash: '0xsimulated-unstake' 
            }), 2000))
          };
          return Promise.resolve(fakeTx);
        });

        if (fakeReceipt) {
          toast.success(`Retrait de ${userStaked} GREENHASH (simulation) confirmé!`);
          setUserStaked('0');
        }
      }
    } catch (error) {
      toast.error(`Erreur lors du retrait: ${error.message}`);
    }

  };

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "APR Élevé",
      value: `${currentAPR}%`,
      description: "Gagnez jusqu'à 80% APR avec notre pool de staking"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Sécurisé",
      value: "100%",
      description: "Smart contract audité et sécurisé"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Lock Period",
      value: poolStats.lockPeriod,
      description: "Période de lock minimale pour les récompenses"
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Écologique",
      value: "0.1%",
      description: "Taxe écologique sur chaque transaction"
    }
  ];

  // FIX: Display native balance if available
  const nativeBalanceDisplay = balance ? 
    `${parseFloat(balance).toFixed(4)} ${import.meta.env.VITE_NATIVE_SYMBOL || 'BNB'}` : 
    null;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <PendingTransactionsList />
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="gradient-text">Mining Pool</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Stakez vos tokens GREENHASH et gagnez des récompenses écologiques 
            tout en contribuant à la durabilité environnementale.
          </motion.p>
        </div>

        {/* Pool Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="card text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <div className="flex justify-center mb-4 text-primary-400">
                {feature.icon}
              </div>
              <div className="text-2xl font-bold gradient-text mb-2">
                {feature.value}
              </div>
              <div className="text-sm text-gray-400 mb-2">
                {feature.title}
              </div>
              <div className="text-xs text-gray-500">
                {feature.description}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Staking Interface */}
          <div className="lg:col-span-2">
            <motion.div 
              className="card mb-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-2xl font-bold mb-6 gradient-text">Stakez vos GREENHASH</h3>
              
              {!account ? (
                <div className="text-center py-8">
                  <Zap className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-6">Connectez votre wallet pour commencer le staking</p>
                  <button 
                    onClick={connectWallet}
                    className="btn-primary"
                  >
                    Connecter Wallet
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Montant à staker (GREENHASH)
                    </label>
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="Entrez le montant"
                      className="w-full px-4 py-3 bg-dark-100 border border-primary-500/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                    />
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
                      <span>Minimum: 100 GREENHASH</span>
                      <span>Balance: 50,000 GREENHASH</span>
                    </div>
                  </div>

                  <div className="bg-primary-500/10 rounded-lg p-4">
                    <h4 className="font-semibold text-primary-400 mb-2">Récompenses Estimées</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Journalier:</span>
                        <span className="text-white ml-2">
                          {stakeAmount ? (parseFloat(stakeAmount) * currentAPR / 100 / 365).toFixed(2) : '0'} GREENHASH
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Mensuel:</span>
                        <span className="text-white ml-2">
                          {stakeAmount ? (parseFloat(stakeAmount) * currentAPR / 100 / 12).toFixed(2) : '0'} GREENHASH
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleStake}
                    disabled={isStaking || !stakeAmount}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    {isStaking ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Staking en cours...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Staker maintenant</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>

            {/* Your Staking */}
            {account && (
              <motion.div 
                className="card"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold mb-6 gradient-text">Vos Stakes</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-dark-100 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-400">Montant Staké</div>
                      <div className="text-xl font-bold text-white">{userStaked} GREENHASH</div>
                    </div>
                    <button
                      onClick={handleUnstake}
                      disabled={parseFloat(userStaked) === 0}
                      className="btn-secondary text-sm px-4 py-2"
                    >
                      Retirer
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-dark-100 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-400">Récompenses en attente</div>
                      <div className="text-xl font-bold text-primary-400">{userRewards} GREENHASH</div>
                    </div>
                    <button
                      onClick={handleClaimRewards}
                      disabled={parseFloat(userRewards) === 0}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Réclamer
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Pool Statistics */}
          <div className="space-y-6">
            <motion.div 
              className="card"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold mb-6 gradient-text">Statistiques du Pool</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Staké</span>
                  <span className="font-semibold text-white">{totalStaked} GREENHASH</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Stakers Actifs</span>
                  <span className="font-semibold text-white">{poolStats.activeStakers.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Récompenses Distribuées</span>
                  <span className="font-semibold text-primary-400">{poolStats.totalRewardsDistributed} GREENHASH</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">APY Moyen</span>
                  <span className="font-semibold text-white">{poolStats.averageAPY}%</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="card"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h3 className="text-xl font-bold mb-6 gradient-text">Impact Écologique</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">CO₂ Économisé</span>
                  <span className="font-semibold text-green-400">2,500 kg</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Arbres Compensés</span>
                  <span className="font-semibold text-green-400">125</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Taxe Écologique</span>
                  <span className="font-semibold text-primary-400">1,250 GREENHASH</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-500/10 rounded-lg">
                <p className="text-sm text-green-400 text-center">
                  Chaque transaction contribue à la reforestation au Maroc
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="card"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <h3 className="text-xl font-bold mb-4 gradient-text">Guide Rapide</h3>
              
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-xs text-white font-bold">1</div>
                  <span>Connectez votre wallet MetaMask</span>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-xs text-white font-bold">2</div>
                  <span>Entrez le montant à staker (minimum 100)</span>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-xs text-white font-bold">3</div>
                  <span>Confirmez la transaction dans MetaMask</span>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-xs text-white font-bold">4</div>
                  <span>Réclamez vos récompenses quand vous voulez</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiningPool;