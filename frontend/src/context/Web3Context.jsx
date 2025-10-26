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

  // Sepolia (Ethereum testnet) chain id
  const SEPOLIA_CHAIN_ID = 11155111;

  // Read RPC keys from Vite environment variables (VITE_ prefix)
  const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;
  const INFURA_ID = import.meta.env.VITE_INFURA_PROJECT_ID;

  const getSepoliaRpcUrl = () => {
    if (ALCHEMY_KEY) return `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`;
    if (INFURA_ID) return `https://sepolia.infura.io/v3/${INFURA_ID}`;
    return 'https://rpc.sepolia.org';
  };

  const connectWallet = async () => {
    try {
      setLoading(true);

      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);

        // Demander l'accès aux comptes
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) {
          toast.error('Aucun compte trouvé');
          return;
        }

        const web3Signer = web3Provider.getSigner();
        setSigner(web3Signer);
        setAccount(accounts[0]);

        const network = await web3Provider.getNetwork();
        setChainId(network.chainId);

        if (network.chainId !== SEPOLIA_CHAIN_ID) {
          toast.info('Connectez-vous au réseau Sepolia (testnet) pour tester la dApp');
        }

        const bal = await web3Provider.getBalance(accounts[0]);
        setBalance(ethers.utils.formatEther(bal));
        toast.success('Wallet connecté avec succès!');
      } else {
        // No injected provider — use a read-only JsonRpcProvider (Sepolia) as fallback
        const rpc = getSepoliaRpcUrl();
        const jsonProvider = new ethers.providers.JsonRpcProvider(rpc);
        setProvider(jsonProvider);
        setSigner(null);
        setAccount(null);
        const network = await jsonProvider.getNetwork();
        setChainId(network.chainId);
        toast.info('Fournisseur en lecture seule connecté à Sepolia');
      }
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

  const connectSepoliaRpc = (prefer = 'alchemy') => {
    const rpc = getSepoliaRpcUrl();
    const jsonProvider = new ethers.providers.JsonRpcProvider(rpc);
    setProvider(jsonProvider);
    setSigner(null);
    setAccount(null);
    jsonProvider.getNetwork().then((n) => setChainId(n.chainId)).catch(() => {});
    return jsonProvider;
  };

  const value = {
    account,
    provider,
    signer,
    chainId,
    loading,
    balance,
    connectWallet,
    disconnectWallet,
    switchToBSCNetwork,
    connectSepoliaRpc,
    // helper to connect a token contract once address & ABI are known
    connectTokenContract: (tokenAddress, tokenAbi) => {
      if (!tokenAddress || !tokenAbi) return null;
      try {
        const ctr = signer
          ? new ethers.Contract(tokenAddress, tokenAbi, signer)
          : new ethers.Contract(tokenAddress, tokenAbi, provider);
        return ctr;
      } catch (err) {
        console.error('Erreur création contrat token:', err);
        return null;
      }
    }
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};