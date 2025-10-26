import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Leaf, TrendingUp, Shield, Globe } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

const Home = () => {
  const { account } = useWeb3();

  const features = [
    {
      icon: <Leaf className="w-8 h-8 text-primary-400" />,
      title: 'Minage Écologique',
      description: 'Utilisation d\'énergies renouvelables pour un minage durable et respectueux de l\'environnement.'
    },
    {
      icon: <Zap className="w-8 h-8 text-primary-400" />,
      title: 'DeFi Intégré',
      description: 'Stakez vos tokens GREENHASH et gagnez jusqu\'à 80% APR avec notre pool de staking.'
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-400" />,
      title: 'Sécurité Blockchain',
      description: 'Sécurité maximale grâce à la technologie blockchain BNB Smart Chain.'
    },
    {
      icon: <Globe className="w-8 h-8 text-primary-400" />,
      title: 'Impact Environnemental',
      description: 'Chaque transaction contribue à la reforestation et la réduction des émissions CO₂.'
    }
  ];

  const stats = [
    { label: 'APR Staking', value: '50-80%', suffix: '' },
    { label: 'Tokens Totaux', value: '100M', suffix: ' GHT' },
    { label: 'Économie CO₂', value: '2.5T', suffix: ' kg/an' },
    { label: 'Arbres Plantés', value: '10K', suffix: '+' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-neon-green/10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="gradient-text animate-glow">Green Hash Maroc</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              La première plateforme Web3 de minage écologique au Maroc. 
              Combinez investissement crypto et protection de l'environnement.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link 
                to={account ? "/mining-pool" : "/"}
                onClick={() => !account && alert('Veuillez connecter votre wallet pour continuer')}
                className="btn-primary flex items-center space-x-2 text-lg px-8 py-4"
              >
                <span>Commencer</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/vision" className="btn-secondary text-lg px-8 py-4">
                En savoir plus
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="card text-center">
                  <div className="text-3xl font-bold gradient-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Pourquoi Green Hash Maroc ?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Notre plateforme combine technologie blockchain et engagement écologique 
              pour créer un écosystème minable durable et rentable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="card text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-primary-400">
                  {feature.title}
                </h3>
                <p className="text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-900/20 to-neon-green/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold gradient-text mb-6">
            Prêt à rejoindre la révolution verte ?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Commencez votre aventure dans le minage écologique et contribuez 
            à un avenir plus durable tout en gagnant des récompenses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/mining-pool"
              className="btn-primary flex items-center justify-center space-x-2 text-lg px-8 py-4"
            >
              <TrendingUp className="w-5 h-5" />
              <span>Voir le Mining Pool</span>
            </Link>
            <Link 
              to="/exchange"
              className="btn-secondary flex items-center justify-center space-x-2 text-lg px-8 py-4"
            >
              <span>Échanger des Tokens</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;