import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../context/Web3Context';
import { Package, Zap, Shield, TrendingUp, Clock, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const Invest = () => {
  const { account } = useWeb3();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isInvesting, setIsInvesting] = useState(false);

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
        {/* Header */}
        <div className="text-center mb-12">
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