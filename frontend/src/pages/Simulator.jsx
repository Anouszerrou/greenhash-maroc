import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Zap, DollarSign, TrendingUp, Leaf, Clock } from 'lucide-react';

const Simulator = () => {
  const [hashrate, setHashrate] = useState('100');
  const [powerCost, setPowerCost] = useState('0.1');
  const [hardwareCost, setHardwareCost] = useState('2500');
  const [poolFee, setPoolFee] = useState('2');
  const [maintenanceCost, setMaintenanceCost] = useState('100');
  const [difficulty, setDifficulty] = useState('1');
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    setIsCalculating(true);
    
    // Simuler le calcul côté backend
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Calcul simulé
    const hashrateNum = parseFloat(hashrate) || 0;
    const powerCostNum = parseFloat(powerCost) || 0;
    const hardwareCostNum = parseFloat(hardwareCost) || 0;
    const poolFeeNum = parseFloat(poolFee) || 0;
    const maintenanceCostNum = parseFloat(maintenanceCost) || 0;
    
    // Calculs de rentabilité (simplifiés)
    const dailyRevenue = hashrateNum * 0.15; // Revenue simulé par TH/s
    const dailyPowerCost = (hashrateNum * 3.25 * 24 * powerCostNum) / 1000; // Coût électricité
    const dailyPoolFee = dailyRevenue * (poolFeeNum / 100);
    const dailyMaintenance = maintenanceCostNum / 30;
    
    const dailyProfit = dailyRevenue - dailyPowerCost - dailyPoolFee - dailyMaintenance;
    const monthlyProfit = dailyProfit * 30;
    const yearlyProfit = dailyProfit * 365;
    
    const roi = (yearlyProfit / hardwareCostNum) * 100;
    const breakEven = hardwareCostNum / dailyProfit;
    
    // Impact environnemental
    const co2Saved = (hashrateNum * 3.25 * 24 * 365 * 0.5) / 1000; // kg CO2/an
    const treesCompensated = co2Saved / 21; // arbres par an
    
    setResults({
      dailyRevenue,
      dailyProfit,
      monthlyProfit,
      yearlyProfit,
      roi,
      breakEven: breakEven > 0 ? breakEven : Infinity,
      co2Saved,
      treesCompensated,
      dailyPowerCost,
      dailyPoolFee,
      dailyMaintenance
    });
    
    setIsCalculating(false);
  };

  const inputFields = [
    { label: "Hashrate", value: hashrate, setter: setHashrate, unit: "TH/s", icon: <Zap className="w-5 h-5" /> },
    { label: "Coût Électricité", value: powerCost, setter: setPowerCost, unit: "$/kWh", icon: <Zap className="w-5 h-5" /> },
    { label: "Coût Matériel", value: hardwareCost, setter: setHardwareCost, unit: "$", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Frais Pool", value: poolFee, setter: setPoolFee, unit: "%", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Maintenance", value: maintenanceCost, setter: setMaintenanceCost, unit: "$/mois", icon: <Clock className="w-5 h-5" /> },
    { label: "Difficulté", value: difficulty, setter: setDifficulty, unit: "facteur", icon: <TrendingUp className="w-5 h-5" /> }
  ];

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
            <span className="gradient-text">Simulateur de Minage</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Calculez la rentabilité de votre équipement de minage et découvrez 
            votre impact environnemental positif.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Parameters */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-bold mb-6 gradient-text flex items-center space-x-2">
              <Calculator className="w-6 h-6" />
              <span>Paramètres du Minage</span>
            </h3>
            
            <div className="space-y-4">
              {inputFields.map((field, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                    {field.icon}
                    <span>{field.label}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-4 py-3 pr-16 bg-dark-100 border border-primary-500/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                      {field.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full mt-6 btn-primary flex items-center justify-center space-x-2"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Calcul en cours...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  <span>Calculer la rentabilité</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Results */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold mb-6 gradient-text flex items-center space-x-2">
              <TrendingUp className="w-6 h-6" />
              <span>Résultats du Calcul</span>
            </h3>
            
            {results ? (
              <div className="space-y-4">
                {/* Profits */}
                <div className="bg-primary-500/10 rounded-lg p-4">
                  <h4 className="font-semibold text-primary-400 mb-3">Profits</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Revenu quotidien:</span>
                      <span className="text-green-400">${results.dailyRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Profit quotidien:</span>
                      <span className={results.dailyProfit >= 0 ? "text-green-400" : "text-red-400"}>
                        ${results.dailyProfit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Profit mensuel:</span>
                      <span className={results.monthlyProfit >= 0 ? "text-green-400" : "text-red-400"}>
                        ${results.monthlyProfit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Profit annuel:</span>
                      <span className={results.yearlyProfit >= 0 ? "text-green-400" : "text-red-400"}>
                        ${results.yearlyProfit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ROI */}
                <div className="bg-blue-500/10 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-400 mb-3">Retour sur Investissement</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">ROI Annuel:</span>
                      <span className={results.roi >= 0 ? "text-blue-400" : "text-red-400"}>
                        {results.roi.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Break-even:</span>
                      <span className="text-white">
                        {results.breakEven !== Infinity ? `${Math.ceil(results.breakEven)} jours` : 'Jamais'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Environmental Impact */}
                <div className="bg-green-500/10 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-3 flex items-center space-x-2">
                    <Leaf className="w-4 h-4" />
                    <span>Impact Environnemental</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">CO₂ économisé/an:</span>
                      <span className="text-green-400">{results.co2Saved.toFixed(0)} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Arbres compensés/an:</span>
                      <span className="text-green-400">{results.treesCompensated.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Costs Breakdown */}
                <div className="bg-orange-500/10 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-400 mb-3">Décomposition des Coûts</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Électricité/jour:</span>
                      <span className="text-orange-400">${results.dailyPowerCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Frais pool/jour:</span>
                      <span className="text-orange-400">${results.dailyPoolFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Maintenance/jour:</span>
                      <span className="text-orange-400">${results.dailyMaintenance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calculator className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <p className="text-gray-300">Entrez vos paramètres et cliquez sur calculer pour voir les résultats</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Equipment Comparison */}
        <motion.div 
          className="mt-12 card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold mb-6 gradient-text">Équipements Populaires</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Antminer S19 Pro",
                hashrate: "110 TH/s",
                power: "3250W",
                price: "$2,500",
                profit: "$15.50/jour"
              },
              {
                name: "WhatsMiner M30S++",
                hashrate: "112 TH/s",
                power: "3472W",
                price: "$2,200",
                profit: "$14.80/jour"
              },
              {
                name: "Antminer S9",
                hashrate: "14 TH/s",
                power: "1372W",
                price: "$300",
                profit: "$1.20/jour"
              }
            ].map((equipment, index) => (
              <div key={index} className="bg-dark-100 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">{equipment.name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hashrate:</span>
                    <span className="text-white">{equipment.hashrate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Puissance:</span>
                    <span className="text-white">{equipment.power}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Prix:</span>
                    <span className="text-white">{equipment.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Profit:</span>
                    <span className="text-green-400">{equipment.profit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Simulator;