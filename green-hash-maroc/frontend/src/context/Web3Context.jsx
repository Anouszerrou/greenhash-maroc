import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState('0');

  const BSC_TESTNET_CHAIN_ID = 97;
  const BSC_MAINNET_CHAIN_ID = 56;

  const connectWallet = async () => {
    try {
      setLoading(true);
      
      if (!window.ethereum) {
        toast.error('Veuillez installer MetaMask pour continuer');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      // Demander l'accès aux comptes
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        toast.error('Aucun compte trouvé');
        return;
      }

      const signer = provider.getSigner();
      setSigner(signer);
      setAccount(accounts[0]);

      // Vérifier le réseau
      const network = await provider.getNetwork();
      setChainId(network.chainId);

      // Vérifier si on est sur le bon réseau
      if (network.chainId !== BSC_TESTNET_CHAIN_ID) {
        await switchToBSCNetwork();
      }

      // Obtenir le solde
      const balance = await provider.getBalance(accounts[0]);
      setBalance(ethers.utils.formatEther(balance));

      toast.success('Wallet connecté avec succès!');
      
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast.error('Erreur lors de la connexion au wallet');
    } finally {
      setLoading(false);
    }
  };

  const switchToBSCNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BSC_TESTNET_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError) {
      // Si le réseau n'est pas ajouté, l'ajouter
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${BSC_TESTNET_CHAIN_ID.toString(16)}`,
              chainName: 'BNB Smart Chain Testnet',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
              },
              rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
              blockExplorerUrls: ['https://testnet.bscscan.com/']
            }]
          });
        } catch (addError) {
          console.error('Erreur lors de l\'ajout du réseau:', addError);
        }
      }
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance('0');
    toast.info('Wallet déconnecté');
  };

  // Écouter les changements de compte
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Rafraîchir le solde toutes les 5 secondes
  useEffect(() => {
    if (account && provider) {
      const interval = setInterval(async () => {
        try {
          const balance = await provider.getBalance(account);
          setBalance(ethers.utils.formatEther(balance));
        } catch (error) {
          console.error('Erreur lors de la récupération du solde:', error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [account, provider]);

  const value = {
    account,
    provider,
    signer,
    chainId,
    loading,
    balance,
    connectWallet,
    disconnectWallet,
    switchToBSCNetwork
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};