import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../context/Web3Context';
import { ArrowDownUp, Wallet, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Exchange = () => {
  const { account, connectWallet } = useWeb3();
  const [fromToken, setFromToken] = useState('BNB');
  const [toToken, setToToken] = useState('GREENHASH');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState('6000');
  const [isSwapping, setIsSwapping] = useState(false);
  const [priceImpact, setPriceImpact] = useState('0.1');
  const [minimumReceived, setMinimumReceived] = useState('');

  const tokens = [
    { symbol: 'BNB', name: 'BNB', balance: '2.5', price: '300' },
    { symbol: 'USDT', name: 'Tether', balance: '1500', price: '1' },
    { symbol: 'GREENHASH', name: 'Green Hash Token', balance: '50000', price: '0.05' }
  ];

  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      calculateExchange();
    }
  }, [fromAmount, fromToken, toToken]);

  const calculateExchange = () => {
    const rates = {
      'BNB-USDT': 300,
      'USDT-BNB': 1/300,
      'BNB-GREENHASH': 6000,
      'GREENHASH-BNB': 1/6000,
      'USDT-GREENHASH': 20,
      'GREENHASH-USDT': 1/20
    };

    const pair = `${fromToken}-${toToken}`;
    const rate = rates[pair] || 1;
    const amount = parseFloat(fromAmount) || 0;
    
    const output = amount * rate;
    const fee = output * 0.001; // 0.1% fee
    const finalAmount = output - fee;
    
    setToAmount(finalAmount.toFixed(6));
    setExchangeRate(rate.toString());
    setMinimumReceived((finalAmount * 0.99).toFixed(6));
  };

  const handleSwap = async () => {
    if (!account) {
      toast.error('Veuillez connecter votre wallet');
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Veuillez entrer un montant valide');
      return;
    }

    setIsSwapping(true);
    
    try {
      // Simuler la transaction de swap
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success(`Swap réussi! ${fromAmount} ${fromToken} → ${toAmount} ${toToken}`);
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      toast.error('Erreur lors du swap');
    } finally {
      setIsSwapping(false);
    }
  };

  const handleSwitchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const getTokenBalance = (symbol) => {
    const token = tokens.find(t => t.symbol === symbol);
    return token ? token.balance : '0';
  };

  const getTokenPrice = (symbol) => {
    const token = tokens.find(t => t.symbol === symbol);
    return token ? token.price : '0';
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="gradient-text">Exchange Décentralisé</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Échangez vos tokens de manière sécurisée avec des frais minimaux 
            et contribuez à l'écologie avec chaque transaction.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Exchange Interface */}
          <div className="lg:col-span-2">
            <motion.div 
              className="card"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {!account ? (
                <div className="text-center py-12">
                  <Wallet className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-6">Connectez votre wallet pour commencer à échanger</p>
                  <button 
                    onClick={connectWallet}
                    className="btn-primary flex items-center space-x-2 mx-auto"
                  >
                    <Wallet className="w-5 h-5" />
                    <span>Connecter Wallet</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold gradient-text">Swap Tokens</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Zap className="w-4 h-4" />
                      <span>Rapide & Sécurisé</span>
                    </div>
                  </div>

                  {/* From Token */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-300">De</label>
                      <span className="text-sm text-gray-400">
                        Balance: {getTokenBalance(fromToken)} {fromToken}
                      </span>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="number"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        placeholder="0.0"
                        className="w-full px-4 py-4 pr-24 bg-dark-100 border border-primary-500/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white text-xl"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <select
                          value={fromToken}
                          onChange={(e) => setFromToken(e.target.value)}
                          className="bg-primary-500 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                        >
                          {tokens.map(token => (
                            <option key={token.symbol} value={token.symbol}>
                              {token.symbol}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      ≈ ${fromAmount ? (parseFloat(fromAmount) * getTokenPrice(fromToken)).toFixed(2) : '0.00'} USD
                    </div>
                  </div>

                  {/* Switch Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleSwitchTokens}
                      className="p-3 bg-dark-100 hover:bg-dark-200 rounded-full transition-colors duration-200"
                    >
                      <ArrowDownUp className="w-5 h-5 text-primary-400" />
                    </button>
                  </div>

                  {/* To Token */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-300">À</label>
                      <span className="text-sm text-gray-400">
                        Balance: {getTokenBalance(toToken)} {toToken}
                      </span>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="number"
                        value={toAmount}
                        readOnly
                        placeholder="0.0"
                        className="w-full px-4 py-4 pr-24 bg-dark-100 border border-primary-500/30 rounded-lg text-white text-xl"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <select
                          value={toToken}
                          onChange={(e) => setToToken(e.target.value)}
                          className="bg-primary-500 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                        >
                          {tokens.map(token => (
                            <option key={token.symbol} value={token.symbol}>
                              {token.symbol}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      ≈ ${toAmount ? (parseFloat(toAmount) * getTokenPrice(toToken)).toFixed(2) : '0.00'} USD
                    </div>
                  </div>

                  {/* Exchange Info */}
                  <div className="bg-dark-100 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Taux d'échange</span>
                      <span className="text-white">1 {fromToken} = {exchangeRate} {toToken}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Impact prix</span>
                      <span className="text-white">{priceImpact}%</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Frais (0.1%)</span>
                      <span className="text-white">{toAmount ? (parseFloat(toAmount) * 0.001).toFixed(6) : '0'} {toToken}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Minimum reçu</span>
                      <span className="text-white">{minimumReceived} {toToken}</span>
                    </div>
                  </div>

                  {/* Ecological Impact */}
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-semibold text-green-400">Impact Écologique</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Les frais de cette transaction contribueront à planter {toAmount ? Math.floor(parseFloat(toAmount) * 0.001 * 0.1) : '0'} arbres au Maroc.
                    </p>
                  </div>

                  <button
                    onClick={handleSwap}
                    disabled={isSwapping || !fromAmount || parseFloat(fromAmount) <= 0}
                    className="w-full btn-primary flex items-center justify-center space-x-2 py-4"
                  >
                    {isSwapping ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Swap en cours...</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5" />
                        <span>Échanger maintenant</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Market Info */}
          <div className="space-y-6">
            <motion.div 
              className="card"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold mb-6 gradient-text">Marché Actuel</h3>
              
              <div className="space-y-4">
                {tokens.map((token, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-dark-100 rounded-lg">
                    <div>
                      <div className="font-semibold text-white">{token.symbol}</div>
                      <div className="text-xs text-gray-400">{token.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white">${token.price}</div>
                      <div className="text-xs text-gray-400">{token.balance} {token.symbol}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="card"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h3 className="text-xl font-bold mb-6 gradient-text">Liquidity Pools</h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-dark-100 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-semibold">BNB/GREENHASH</span>
                    <span className="text-green-400">$2.5M</span>
                  </div>
                  <div className="text-xs text-gray-400">APR: 0.25% | Volume 24h: $150K</div>
                </div>
                
                <div className="p-3 bg-dark-100 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-semibold">USDT/GREENHASH</span>
                    <span className="text-green-400">$1.8M</span>
                  </div>
                  <div className="text-xs text-gray-400">APR: 0.30% | Volume 24h: $89K</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="card"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <h3 className="text-xl font-bold mb-6 gradient-text">Récent Swaps</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">BNB → GREENHASH</span>
                  <span className="text-white">2.5 → 15,000</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">USDT → BNB</span>
                  <span className="text-white">1,000 → 3.33</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">GREENHASH → USDT</span>
                  <span className="text-white">50,000 → 2,500</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exchange;