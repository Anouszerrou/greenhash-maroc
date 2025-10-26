import React from 'react';
import { motion } from 'framer-motion';
import { Target, Leaf, Zap, Shield, Globe, TrendingUp } from 'lucide-react';

const Vision = () => {
  const missions = [
    {
      icon: <Leaf className="w-8 h-8 text-primary-400" />,
      title: "Minage Durable",
      description: "Utiliser exclusivement des énergies renouvelables pour alimenter nos opérations de minage, réduisant l'empreinte carbone de 100% par rapport au minage traditionnel."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary-400" />,
      title: "Innovation Blockchain",
      description: "Développer des solutions blockchain avancées qui récompensent les utilisateurs tout en contribuant à des initiatives environnementales concrètes."
    },
    {
      icon: <Globe className="w-8 h-8 text-primary-400" />,
      title: "Impact Social",
      description: "Créer des emplois verts au Maroc et soutenir les communautés locales grâce à des partenariats avec des fournisseurs d'énergie renouvelable."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-400" />,
      title: "Transparence Totale",
      description: "Garantir une transparence complète dans nos opérations, nos calculs d'impact environnemental et la distribution des récompenses."
    }
  ];

  const values = [
    {
      title: "Durabilité",
      description: "Chaque décision est guidée par notre engagement envers l'environnement et les générations futures.",
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Innovation",
      description: "Nous repoussons les limites de la technologie blockchain pour créer des solutions durables.",
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Communauté",
      description: "Construire une communauté mondiale d'investisseurs éco-responsables et innovants.",
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Transparence",
      description: "Une opacité zéro dans nos opérations, nos finances et notre impact environnemental.",
      color: "from-orange-500 to-red-600"
    }
  ];

  const stats = [
    { label: "Réduction CO₂", value: "100%", desc: "vs minage traditionnel" },
    { label: "Énergie Renouvelable", value: "100%", desc: "de notre consommation" },
    { label: "Arbres Plantés", value: "10,000+", desc: "par an" },
    { label: "Communauté", value: "5,000+", desc: "membres actifs" }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-900/20 via-transparent to-neon-green/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="gradient-text">Notre Vision</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Révolutionner l'industrie du minage crypto en créant un écosystème 
              où la rentabilité financière rime avec la responsabilité environnementale.
            </motion.p>

            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="card text-center">
                  <div className="text-3xl font-bold gradient-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stat.desc}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Notre Mission
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Quatre piliers fondamentaux qui guident chaque aspect de notre développement
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {missions.map((mission, index) => (
              <motion.div 
                key={index} 
                className="card"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center">
                    {mission.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary-400">
                      {mission.title}
                    </h3>
                    <p className="text-gray-300">
                      {mission.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-dark-200 to-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Nos Valeurs
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Les principes qui définissent notre identité et guident nos actions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div 
                key={index} 
                className="card relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${value.color} opacity-10`}></div>
                <div className="relative">
                  <h3 className="text-2xl font-bold mb-4 text-white">
                    {value.title}
                  </h3>
                  <p className="text-gray-300">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-900/20 to-neon-green/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-4xl font-bold gradient-text mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Rejoignez la révolution verte
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-300 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Ensemble, construisons un avenir où la technologie blockchain et 
            la durabilité environnementale vont main dans la main.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button className="btn-primary flex items-center justify-center space-x-2 text-lg px-8 py-4">
              <TrendingUp className="w-5 h-5" />
              <span>Commencer l'aventure</span>
            </button>
            <button className="btn-secondary flex items-center justify-center space-x-2 text-lg px-8 py-4">
              <Target className="w-5 h-5" />
              <span>En savoir plus</span>
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Vision;