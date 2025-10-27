import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../context/Web3Context';
import { Package, Zap, Shield, TrendingUp, Clock, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { useNetwork } from 'wagmi';
import PendingTransactionsList from '../components/PendingTransactionsList';

// Investment contract ABI
const INVESTMENT_CONTRACT_ABI = [
  "function invest(uint256 packageId, uint256 amount) payable returns (bool)",
  "function getPackageDetails(uint256 packageId) view returns (uint256 minAmount, uint256 maxAmount, uint256 apr, uint256 duration)",
  "function getUserInvestment(address user) view returns (uint256 amount, uint256 packageId, uint256 startTime, uint256 endTime)",
  "function withdraw() external returns (bool)",
  "function getRewards() view returns (uint256)",
  "function claimRewards() external returns (bool)"
];

const Invest = () => {
  const { account, connectWallet, safeContractCall, connectContract } = useWeb3();
  const { chain } = useNetwork();

  // Contract addresses based on network
  const INVESTMENT_CONTRACT_ADDRESS = chain?.id === 11155111 // Sepolia
    ? import.meta.env.VITE_SEPOLIA_INVESTMENT_ADDRESS
    : import.meta.env.VITE_BSC_INVESTMENT_ADDRESS;

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isInvesting, setIsInvesting] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [userInvestment, setUserInvestment] = useState(null);
  const [availableRewards, setAvailableRewards] = useState('0');
  const [isLoading, setIsLoading] = useState(true);

  // Load user's investment data
  useEffect(() => {
    const loadUserInvestment = async () => {
      if (!account || !INVESTMENT_CONTRACT_ADDRESS) return;
      
      try {
        const contract = connectContract(INVESTMENT_CONTRACT_ADDRESS, INVESTMENT_CONTRACT_ABI);
        if (!contract) throw new Error('Cannot connect to investment contract');

        const [investment, rewards] = await Promise.all([
          contract.getUserInvestment(account),
          contract.getRewards()
        ]);

        setUserInvestment({
          amount: ethers.utils.formatEther(investment.amount),
          packageId: investment.packageId.toNumber(),
          startTime: new Date(investment.startTime.toNumber() * 1000),
          endTime: new Date(investment.endTime.toNumber() * 1000)
        });

        setAvailableRewards(ethers.utils.formatEther(rewards));
      } catch (error) {
        console.error('Error loading investment data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInvestment();
  }, [account, INVESTMENT_CONTRACT_ADDRESS]);
  const handleInvest = async () => {
    if (!account) {
      toast.error('Veuillez connecter votre wallet');
      return;
    }

    if (!selectedPackage) {
      toast.error('Veuillez sélectionner un package');
      return;
    }

    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      toast.error('Veuillez entrer un montant valide');
      return;
    }

    const minAmount = parseFloat(selectedPackage.minInvestment.replace(',', ''));
    const maxAmount = parseFloat(selectedPackage.maxInvestment.replace(',', ''));
    const amount = parseFloat(investmentAmount);

    if (amount < minAmount || amount > maxAmount) {
      toast.error(`Le montant doit être entre ${minAmount} et ${maxAmount} BNB`);
      return;
    }

    setIsInvesting(true);

    try {
      if (INVESTMENT_CONTRACT_ADDRESS) {
        const contract = connectContract(INVESTMENT_CONTRACT_ADDRESS, INVESTMENT_CONTRACT_ABI);
        if (!contract) throw new Error('Cannot connect to investment contract');

        // Get package ID from selected package
        const packageId = ['starter', 'advanced', 'premium'].indexOf(selectedPackage.id);
        if (packageId === -1) throw new Error('Invalid package');

        const receipt = await safeContractCall(async ({ signer, estimateGasWithPrice }) => {
          const contractWithSigner = contract.connect(signer);
          const amountInWei = ethers.utils.parseEther(investmentAmount);

          // Populate transaction for gas estimation
          const populated = await contractWithSigner.populateTransaction.invest(
            packageId,
            amountInWei,
            { value: amountInWei }
          );

          // Estimate gas
          const { gasLimit, gasPrice } = await estimateGasWithPrice(() => populated);

          // Execute investment
          const tx = await contractWithSigner.invest(
            packageId,
            amountInWei,
            { 
              value: amountInWei,
              gasLimit,
              gasPrice
            }
          );

          return tx;
        });

        if (receipt) {
          toast.success(`Investissement de ${investmentAmount} BNB confirmé!`);
          setInvestmentAmount('');
          setSelectedPackage(null);
          // Reload user investment data
          await loadUserInvestment();
        }
      } else {
        // FIX: Fallback to simulation for testing
        const fakeReceipt = await safeContractCall(() => {
          const fakeTx = {
            hash: '0x' + Math.random().toString(16).slice(2, 66),
            wait: async () => new Promise(resolve => setTimeout(() => resolve({ 
              status: 1, 
              transactionHash: '0xsimulated-investment' 
            }), 2000))
          };
          return Promise.resolve(fakeTx);
        });

        if (fakeReceipt) {
          toast.success(`Investissement de ${investmentAmount} BNB (simulation) réussi!`);
          setInvestmentAmount('');
          setSelectedPackage(null);
        }
      }
    } catch (error) {
      toast.error(`Erreur lors de l'investissement: ${error.message}`);
    } finally {
      setIsInvesting(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!account) {
      toast.error('Veuillez connecter votre wallet');
      return;
    }

    try {
      if (INVESTMENT_CONTRACT_ADDRESS) {
        const contract = connectContract(INVESTMENT_CONTRACT_ADDRESS, INVESTMENT_CONTRACT_ABI);
        if (!contract) throw new Error('Cannot connect to investment contract');

        const receipt = await safeContractCall(async ({ signer, estimateGasWithPrice }) => {
          const contractWithSigner = contract.connect(signer);

          // Populate transaction for gas estimation
          const populated = await contractWithSigner.populateTransaction.claimRewards();

          // Estimate gas
          const { gasLimit, gasPrice } = await estimateGasWithPrice(() => populated);

          // Execute claim
          const tx = await contractWithSigner.claimRewards({ 
            gasLimit,
            gasPrice
          });

          return tx;
        });

        if (receipt) {
          toast.success('Récompenses réclamées avec succès!');
          // Reload rewards data
          await loadUserInvestment();
        }
      } else {
        // Simulation fallback
        const fakeReceipt = await safeContractCall(() => {
          const fakeTx = {
            hash: '0x' + Math.random().toString(16).slice(2, 66),
            wait: async () => new Promise(resolve => setTimeout(() => resolve({ 
              status: 1, 
              transactionHash: '0xsimulated-claim' 
            }), 2000))
          };
          return Promise.resolve(fakeTx);
        });

        if (fakeReceipt) {
          toast.success('Récompenses réclamées avec succès! (simulation)');
          setAvailableRewards('0');
        }
      }
    } catch (error) {
      toast.error(`Erreur lors de la réclamation: ${error.message}`);
    }
  };

  const investmentPackages = [
    {
      id: 'starter',
      name: 'Starter',
      icon: <Package className="w-8 h-8 text-primary-400" />,
      minInvestment: '100',
      maxInvestment: '1,000',
      apr: '50%',
      duration: '30 jours',
      features: [
        'Accès au staking pool',
        'Récompenses quotidiennes',
        'Support communautaire',
        'Aucun lock-in'
      ],
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'advanced',
      name: 'Advanced',
      icon: <Zap className="w-8 h-8 text-primary-400" />,
      minInvestment: '1,000',
      maxInvestment: '10,000',
      apr: '65%',
      duration: '60 jours',
      features: [
        'APR boosté',
        'Récompenses composées',
        'Accès prioritaire',
        'Bonus écologique'
      ],
      color: 'from-blue-500 to-indigo-600',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: <Shield className="w-8 h-8 text-primary-400" />,
      minInvestment: '10,000',
      maxInvestment: '100,000',
      apr: '80%',
      duration: '90 jours',
      features: [
        'APR maximum',
        'Gouvernance DAO',
        'Support VIP',
        'Partage des revenus'
      ],
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const handleInvest = async (packageId) => {
    if (!account) {
      toast.error('Veuillez connecter votre wallet');
      return;
    }

    setSelectedPackage(packageId);
    setIsInvesting(true);

    try {
      // Simuler la transaction d'investissement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedPkg = investmentPackages.find(p => p.id === packageId);
      toast.success(`Investissement ${selectedPkg.name} réussi!`);
      setSelectedPackage(null);
    } catch (error) {
      toast.error('Erreur lors de l\'investissement');
    } finally {
      setIsInvesting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Transaction List */}
        <PendingTransactionsList />

        {/* Investment Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {investmentPackages.map((pkg) => (
            <motion.div
              key={pkg.id}
              whileHover={{ scale: 1.02 }}
              className={`relative bg-gradient-to-br ${pkg.color} rounded-xl overflow-hidden shadow-xl`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  Populaire
                </div>
              )}
              <div className="p-8">
                <div className="flex items-center mb-4">
                  {pkg.icon}
                  <h3 className="text-2xl font-bold text-white ml-3">{pkg.name}</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-white/80">Investissement</p>
                    <p className="text-xl font-semibold text-white">
                      {pkg.minInvestment} - {pkg.maxInvestment} BNB
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white/80">APR</p>
                    <p className="text-xl font-semibold text-white">{pkg.apr}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/80">Durée</p>
                    <p className="text-xl font-semibold text-white">{pkg.duration}</p>
                  </div>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-white">
                        <Check className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {selectedPackage?.id === pkg.id ? (
                    <div className="mt-6 space-y-4">
                      <input
                        type="number"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        placeholder={`${pkg.minInvestment} - ${pkg.maxInvestment} BNB`}
                        className="w-full px-4 py-2 rounded-lg border-2 border-white/20 bg-white/10 text-white placeholder-white/50"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleInvest}
                          disabled={isInvesting}
                          className="flex-1 px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50"
                        >
                          {isInvesting ? 'Investissement...' : 'Confirmer'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPackage(null);
                            setInvestmentAmount('');
                          }}
                          className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-opacity-30"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedPackage(pkg)}
                      className="mt-6 w-full px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50"
                      disabled={isInvesting || (userInvestment && userInvestment.packageId >= 0)}
                    >
                      {userInvestment && userInvestment.packageId >= 0
                        ? 'Investissement actif'
                        : 'Investir maintenant'
                      }
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
          {/* Transaction List */}
          <PendingTransactionsList />

        {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Investir dans Green Hash
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Rejoignez notre communauté d'investisseurs et participez à la révolution du minage écologique
            </p>
          </div>

          {/* User Investment Status */}
          {account && (
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Votre investissement</h2>
              {isLoading ? (
                <p>Chargement...</p>
              ) : userInvestment ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Montant investi</p>
                      <p className="text-lg font-semibold">{userInvestment.amount} BNB</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Package</p>
                      <p className="text-lg font-semibold">
                        {investmentPackages[userInvestment.packageId]?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date de début</p>
                      <p className="text-lg font-semibold">
                        {userInvestment.startTime.toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date de fin</p>
                      <p className="text-lg font-semibold">
                        {userInvestment.endTime.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                
                  {/* Rewards Section */}
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Récompenses disponibles</p>
                        <p className="text-xl font-semibold text-green-600">
                          {availableRewards} GREENHASH
                        </p>
                      </div>
                      <button
                        onClick={handleClaimRewards}
                        disabled={parseFloat(availableRewards) <= 0}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Réclamer
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Aucun investissement actif</p>
              )}
            </div>
          )}
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="gradient-text">Investir dans le Vert</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Choisissez votre pack d'investissement et rejoignez la révolution 
            écologique tout en gagnant des récompenses attractives.
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {[
            { label: "Investisseurs Actifs", value: "2,847" },
            { label: "Capital Total", value: "$2.5M" },
            { label: "Récompenses Distribuées", value: "$890K" },
            { label: "Arbres Plantés", value: "15,000+" }
          ].map((stat, index) => (
            <div key={index} className="card text-center">
              <div className="text-2xl font-bold gradient-text mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Investment Packages */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {investmentPackages.map((pkg, index) => (
            <motion.div 
              key={pkg.id} 
              className={`card relative overflow-hidden ${pkg.popular ? 'border-2 border-primary-500' : ''}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-primary-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                  POPULAIRE
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${pkg.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {pkg.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                <div className="text-3xl font-bold gradient-text mb-1">{pkg.apr}</div>
                <div className="text-sm text-gray-400">APR</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Investissement:</span>
                  <span className="text-white">{pkg.minInvestment}$ - {pkg.maxInvestment}$</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Durée:</span>
                  <span className="text-white">{pkg.duration}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {pkg.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleInvest(pkg.id)}
                disabled={isInvesting && selectedPackage === pkg.id}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  pkg.popular 
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white' 
                    : 'bg-dark-200 hover:bg-dark-300 text-white border border-primary-500/30 hover:border-primary-500'
                }`}
              >
                {isInvesting && selectedPackage === pkg.id ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span>Investissement...</span>
                  </div>
                ) : (
                  `Investir maintenant`
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Investment Process */}
        <motion.div 
          className="card mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-2xl font-bold mb-8 gradient-text text-center">Comment Investir</h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, title: "Connecter Wallet", desc: "Connectez votre MetaMask à la plateforme" },
              { step: 2, title: "Choisir Pack", desc: "Sélectionnez le pack qui correspond à vos objectifs" },
              { step: 3, title: "Confirmer", desc: "Validez la transaction dans votre wallet" },
              { step: 4, title: "Gagner", desc: "Commencez à gagner des récompenses immédiatement" }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-neon-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">{step.step}</span>
                </div>
                <h4 className="font-semibold text-white mb-2">{step.title}</h4>
                <p className="text-sm text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Risk Warning */}
        <motion.div 
          className="card bg-orange-500/10 border border-orange-500/20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h3 className="text-xl font-bold mb-4 text-orange-400 flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Avertissement sur les Risques</span>
          </h3>
          
          <div className="text-sm text-gray-300 space-y-2">
            <p>
              Les investissements dans les cryptomonnaies comportent des risques, 
              y compris la perte partielle ou totale du capital investi.
            </p>
            <p>
              Les rendements passés ne garantissent pas les rendements futurs. 
              Veuillez investir de manière responsable et ne jamais investir plus que ce que vous ne pouvez vous permettre de perdre.
            </p>
            <p>
              Green Hash Maroc s'engage à fournir des informations transparentes, 
              mais chaque investisseur doit effectuer ses propres recherches.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Invest;