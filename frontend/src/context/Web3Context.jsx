import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const Web3Context = createContext();
const CACHED_PROVIDER = 'cachedWeb3Provider';
const TX_TIMEOUT = 60000; // 60 seconds

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
  const [pendingTxs, setPendingTxs] = useState(new Set());

  // Network configuration
  const SEPOLIA_CHAIN_ID = 11155111;
  const BSC_TESTNET_CHAIN_ID = 97;
  const BSC_MAINNET_CHAIN_ID = 56;

  // RPC Configuration
  const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;
  const INFURA_ID = import.meta.env.VITE_INFURA_PROJECT_ID;

  const getSepoliaRpcUrl = () => {
    if (ALCHEMY_KEY) return `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`;
    if (INFURA_ID) return `https://sepolia.infura.io/v3/${INFURA_ID}`;
    return 'https://rpc.sepolia.org';
  };

  // Error handling
  const handleWeb3Error = (error) => {
    if (error.code === 4001) {
      toast.error('Transaction refusée par l\'utilisateur');
    } else if (error.code === -32002) {
      toast.error('Une requête de connexion est déjà en cours');
    } else if (error.code === -32603) {
      toast.error('Erreur interne RPC');
    } else if (error.message?.includes('user rejected')) {
      toast.error('Action annulée par l\'utilisateur');
    } else if (error.message?.includes('insufficient funds')) {
      toast.error('Fonds insuffisants pour effectuer la transaction');
    } else {
      toast.error(`Erreur: ${error.message || 'Erreur inconnue'}`);
    }
    console.error('Web3 Error:', error);
  };

  // Network verification
  const verifyNetwork = async () => {
    try {
      const network = await provider?.getNetwork();
      if (!network) return false;

      if (network.chainId !== SEPOLIA_CHAIN_ID) {
        toast.warning('Changement vers le réseau Sepolia...');
        await switchToSepoliaNetwork();
        return false;
      }
      return true;
    } catch (error) {
      handleWeb3Error(error);
      return false;
    }
  };

  // Transaction management
  const withTimeout = (promise) => {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Transaction timeout')), TX_TIMEOUT)
    );
    return Promise.race([promise, timeout]);
  };

  const withRetry = async (fn, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  };

  const addPendingTx = (txHash) => {
    setPendingTxs(prev => new Set(prev).add(txHash));
  };

  const removePendingTx = (txHash) => {
    setPendingTxs(prev => {
      const newSet = new Set(prev);
      newSet.delete(txHash);
      return newSet;
    });
  };

  // Safe contract call wrapper
  const safeContractCall = async (contractCall) => {
    try {
      if (!await verifyNetwork()) return null;
      
      const tx = await withTimeout(contractCall());
      addPendingTx(tx.hash);
      toast.info('Transaction envoyée...');
      
      const receipt = await tx.wait();
      removePendingTx(tx.hash);
      
      if (receipt.status === 1) {
        toast.success('Transaction confirmée!');
        return receipt;
      } else {
        toast.error('Transaction échouée');
        return null;
      }
    } catch (error) {
      handleWeb3Error(error);
      return null;
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    try {
      setLoading(true);

      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);

        const accounts = await withRetry(() => 
          window.ethereum.request({ method: 'eth_requestAccounts' })
        );

        if (!accounts || accounts.length === 0) {
          toast.error('Aucun compte trouvé');
          return;
        }

        const web3Signer = web3Provider.getSigner();
        setSigner(web3Signer);
        setAccount(accounts[0]);
        localStorage.setItem(CACHED_PROVIDER, 'injected');

        const network = await web3Provider.getNetwork();
        setChainId(network.chainId);

        await verifyNetwork();

        const bal = await web3Provider.getBalance(accounts[0]);
        setBalance(ethers.utils.formatEther(bal));
        
        toast.success('Wallet connecté avec succès!');
      } else {
        // No injected provider - use read-only RPC
        const rpc = getSepoliaRpcUrl();
        const jsonProvider = new ethers.providers.JsonRpcProvider(rpc);
        setProvider(jsonProvider);
        setSigner(null);
        setAccount(null);
        localStorage.removeItem(CACHED_PROVIDER);
        
        const network = await jsonProvider.getNetwork();
        setChainId(network.chainId);
        toast.info('Mode lecture seule (Sepolia)');
      }
    } catch (error) {
      handleWeb3Error(error);
    } finally {
      setLoading(false);
    }
  };

  // Network switching
  const switchToSepoliaNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
              chainName: 'Sepolia',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: [getSepoliaRpcUrl()],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]
          });
        } catch (addError) {
          handleWeb3Error(addError);
        }
      } else {
        handleWeb3Error(switchError);
      }
    }
  };

  // Wallet disconnection
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setBalance('0');
    localStorage.removeItem(CACHED_PROVIDER);
    toast.info('Wallet déconnecté');
  };

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const cachedProvider = localStorage.getItem(CACHED_PROVIDER);
    if (cachedProvider === 'injected') {
      connectWallet();
    }
  }, []);

  // Event listeners
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      const handleDisconnect = () => {
        disconnectWallet();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      };
    }
  }, []);

  // Balance refresh
  useEffect(() => {
    let interval;
    if (account && provider) {
      interval = setInterval(async () => {
        try {
          const bal = await provider.getBalance(account);
          setBalance(ethers.utils.formatEther(bal));
        } catch (error) {
          console.error('Error refreshing balance:', error);
        }
      }, 5000);
    }
    return () => interval && clearInterval(interval);
  }, [account, provider]);

  // Context value
  const value = {
    account,
    provider,
    signer,
    chainId,
    loading,
    balance,
    pendingTxs,
    connectWallet,
    disconnectWallet,
    verifyNetwork,
    safeContractCall,
    // Contract connection helper
    connectContract: (address, ABI) => {
      if (!address || !ABI) return null;
      try {
        return new ethers.Contract(
          address,
          ABI,
          signer || provider
        );
      } catch (error) {
        console.error('Contract creation error:', error);
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