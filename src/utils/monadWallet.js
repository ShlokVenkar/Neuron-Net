import { ethers } from 'ethers';

/**
 * Generates a new Monad-compatible wallet (EVM-compatible)
 * @returns {Object} wallet - Contains address, privateKey, and mnemonic
 */
export const generateMonadWallet = () => {
  try {
    // Generate a random wallet
    const wallet = ethers.Wallet.createRandom();
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic.phrase,
      success: true
    };
  } catch (error) {
    console.error('Error generating wallet:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Encrypts private key with user's password
 * @param {string} privateKey - The wallet's private key
 * @param {string} password - User's password for encryption
 * @returns {Promise<string>} encrypted wallet JSON
 */
export const encryptWalletKey = async (privateKey, password) => {
  try {
    const wallet = new ethers.Wallet(privateKey);
    const encryptedJson = await wallet.encrypt(password);
    return encryptedJson;
  } catch (error) {
    console.error('Error encrypting wallet:', error);
    throw error;
  }
};

/**
 * Decrypts wallet with user's password
 * @param {string} encryptedJson - Encrypted wallet JSON
 * @param {string} password - User's password
 * @returns {Promise<Object>} wallet object
 */
export const decryptWallet = async (encryptedJson, password) => {
  try {
    const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      success: true
    };
  } catch (error) {
    console.error('Error decrypting wallet:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Creates a provider for Monad Testnet
 * @returns {Object} provider
 */
export const getMonadProvider = () => {
  // Monad Testnet RPC URL (replace with actual when available)
  const MONAD_TESTNET_RPC = 'https://testnet.monad.xyz'; // Placeholder
  
  try {
    const provider = new ethers.JsonRpcProvider(MONAD_TESTNET_RPC);
    return provider;
  } catch (error) {
    console.error('Error creating provider:', error);
    return null;
  }
};

/**
 * Gets wallet balance on Monad
 * @param {string} address - Wallet address
 * @returns {Promise<string>} balance in MONAD
 */
export const getWalletBalance = async (address) => {
  try {
    const provider = getMonadProvider();
    if (!provider) throw new Error('Provider not available');
    
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0.0';
  }
};

// Monad Testnet configuration
export const MONAD_TESTNET_CONFIG = {
  chainId: '0x29A', // 666 in hex (placeholder, use actual Monad testnet chain ID)
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MONAD',
    symbol: 'MONAD',
    decimals: 18
  },
  rpcUrls: ['https://testnet.monad.xyz'], // Placeholder
  blockExplorerUrls: ['https://explorer.testnet.monad.xyz'] // Placeholder
};
