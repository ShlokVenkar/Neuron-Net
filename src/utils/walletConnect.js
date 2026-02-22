// MetaMask wallet connection utility for Monad blockchain

export const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    const walletAddress = accounts[0];
    
    // Get balance
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [walletAddress, 'latest']
    });
    
    // Convert balance from wei to ETH (MON uses same units)
    const balanceInMON = parseInt(balance, 16) / Math.pow(10, 18);
    
    return {
      address: walletAddress,
      balance: balanceInMON,
      connected: true
    };
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('Connection request rejected by user');
    }
    throw error;
  }
};

export const disconnectWallet = () => {
  // Clear wallet data from localStorage
  localStorage.removeItem('walletAddress');
  localStorage.removeItem('walletConnected');
  return { connected: false, address: null };
};

export const getConnectedWallet = () => {
  const address = localStorage.getItem('walletAddress');
  const connected = localStorage.getItem('walletConnected') === 'true';
  return { address, connected };
};

export const saveWalletConnection = (address) => {
  localStorage.setItem('walletAddress', address);
  localStorage.setItem('walletConnected', 'true');
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Listen for account changes
export const setupWalletListeners = (onAccountChange, onDisconnect) => {
  if (typeof window.ethereum === 'undefined') return;

  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      onDisconnect();
    } else {
      onAccountChange(accounts[0]);
    }
  });

  window.ethereum.on('chainChanged', () => {
    window.location.reload();
  });
};
