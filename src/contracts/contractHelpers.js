// Contract interaction helpers using ethers.js v6
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, SUBSCRIPTION_TIERS, RENTAL_STATUS } from './NeuronNetMarketplace.config.js';

/**
 * Get contract instance with signer for write operations
 * @returns {ethers.Contract} Contract instance
 */
export const getContractWithSigner = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

/**
 * Get contract instance with provider for read-only operations
 * @returns {ethers.Contract} Contract instance
 */
export const getContractWithProvider = () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

// ============ GPU LISTING FUNCTIONS ============

/**
 * List a new GPU on the marketplace
 * @param {string} name - GPU name
 * @param {number} cudaCores - Number of CUDA cores
 * @param {number} vram - VRAM in GB
 * @param {number} pricePerHour - Price per hour in wei
 * @returns {Promise<{gpuId: number, txHash: string}>}
 */
export const listGPU = async (name, cudaCores, vram, pricePerHour) => {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.listGPU(name, cudaCores, vram, pricePerHour);
    const receipt = await tx.wait();
    
    // Extract GPU ID from event
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed && parsed.name === 'GPUListed';
      } catch {
        return false;
      }
    });
    
    let gpuId = null;
    if (event) {
      const parsed = contract.interface.parseLog(event);
      gpuId = Number(parsed.args.gpuId);
    }
    
    return { gpuId, txHash: receipt.hash };
  } catch (error) {
    console.error('Error listing GPU:', error);
    throw error;
  }
};

/**
 * Update GPU availability
 * @param {number} gpuId - GPU ID
 * @param {boolean} isAvailable - Availability status
 * @returns {Promise<string>} Transaction hash
 */
export const updateGPUAvailability = async (gpuId, isAvailable) => {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.updateGPUAvailability(gpuId, isAvailable);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error) {
    console.error('Error updating GPU availability:', error);
    throw error;
  }
};

/**
 * Delist a GPU from the marketplace
 * @param {number} gpuId - GPU ID
 * @returns {Promise<string>} Transaction hash
 */
export const delistGPU = async (gpuId) => {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.delistGPU(gpuId);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error) {
    console.error('Error delisting GPU:', error);
    throw error;
  }
};

/**
 * Get GPU details
 * @param {number} gpuId - GPU ID
 * @returns {Promise<Object>} GPU details
 */
export const getGPU = async (gpuId) => {
  try {
    const contract = getContractWithProvider();
    const gpu = await contract.gpus(gpuId);
    return {
      id: Number(gpu[0]),
      seller: gpu[1],
      name: gpu[2],
      cudaCores: Number(gpu[3]),
      vram: Number(gpu[4]),
      pricePerHour: gpu[5].toString(),
      isAvailable: gpu[6],
      totalRentals: Number(gpu[7])
    };
  } catch (error) {
    console.error('Error fetching GPU:', error);
    throw error;
  }
};

// ============ RENTAL FUNCTIONS ============

/**
 * Create a new rental
 * @param {number} gpuId - GPU ID
 * @param {number} hours - Rental duration in hours
 * @param {string} paymentAmount - Payment amount in wei
 * @returns {Promise<{rentalId: number, txHash: string}>}
 */
export const createRental = async (gpuId, hours, paymentAmount) => {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.createRental(gpuId, hours, { value: paymentAmount });
    const receipt = await tx.wait();
    
    // Extract rental ID from event
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed && parsed.name === 'RentalCreated';
      } catch {
        return false;
      }
    });
    
    let rentalId = null;
    if (event) {
      const parsed = contract.interface.parseLog(event);
      rentalId = Number(parsed.args.rentalId);
    }
    
    return { rentalId, txHash: receipt.hash };
  } catch (error) {
    console.error('Error creating rental:', error);
    throw error;
  }
};

/**
 * Get rental details
 * @param {number} rentalId - Rental ID
 * @returns {Promise<Object>} Rental details
 */
export const getRental = async (rentalId) => {
  try {
    const contract = getContractWithProvider();
    const rental = await contract.getRental(rentalId);
    return {
      id: Number(rental.id),
      gpuId: Number(rental.gpuId),
      renter: rental.renter,
      seller: rental.seller,
      duration: Number(rental.duration),
      totalCost: rental.totalCost.toString(),
      startTime: Number(rental.startTime),
      status: Number(rental.status),
      assistanceRequested: rental.assistanceRequested,
      outputDelivered: rental.outputDelivered
    };
  } catch (error) {
    console.error('Error fetching rental:', error);
    throw error;
  }
};

/**
 * Request assistance for a rental
 * @param {number} rentalId - Rental ID
 * @returns {Promise<string>} Transaction hash
 */
export const requestAssistance = async (rentalId) => {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.requestAssistance(rentalId);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error) {
    console.error('Error requesting assistance:', error);
    throw error;
  }
};

/**
 * Mark output as delivered (seller or owner only)
 * @param {number} rentalId - Rental ID
 * @returns {Promise<string>} Transaction hash
 */
export const markOutputDelivered = async (rentalId) => {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.markOutputDelivered(rentalId);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error) {
    console.error('Error marking output delivered:', error);
    throw error;
  }
};

/**
 * Complete a rental
 * @param {number} rentalId - Rental ID
 * @returns {Promise<string>} Transaction hash
 */
export const completeRental = async (rentalId) => {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.completeRental(rentalId);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error) {
    console.error('Error completing rental:', error);
    throw error;
  }
};

/**
 * Cancel a rental (within 5 minutes of creation)
 * @param {number} rentalId - Rental ID
 * @returns {Promise<string>} Transaction hash
 */
export const cancelRental = async (rentalId) => {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.cancelRental(rentalId);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error) {
    console.error('Error cancelling rental:', error);
    throw error;
  }
};

// ============ SUBSCRIPTION FUNCTIONS ============

/**
 * Purchase a premium subscription
 * @param {number} tier - Subscription tier (1=PRO, 2=ENTERPRISE)
 * @param {string} paymentAmount - Payment amount in wei
 * @returns {Promise<string>} Transaction hash
 */
export const purchaseSubscription = async (tier, paymentAmount) => {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.purchaseSubscription(tier, { value: paymentAmount });
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error) {
    console.error('Error purchasing subscription:', error);
    throw error;
  }
};

/**
 * Get user's subscription details
 * @param {string} userAddress - User's wallet address
 * @returns {Promise<Object>} Subscription details
 */
export const getSubscription = async (userAddress) => {
  try {
    const contract = getContractWithProvider();
    const subscription = await contract.getSubscription(userAddress);
    return {
      id: Number(subscription.id),
      user: subscription.user,
      tier: Number(subscription.tier),
      startTime: Number(subscription.startTime),
      expiryTime: Number(subscription.expiryTime),
      isActive: subscription.isActive
    };
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
};

/**
 * Check if user has active premium subscription
 * @param {string} userAddress - User's wallet address
 * @returns {Promise<{hasActivePremium: boolean, tier: number}>}
 */
export const hasActivePremium = async (userAddress) => {
  try {
    const contract = getContractWithProvider();
    const [isPremium, tier] = await contract.hasActivePremium(userAddress);
    return {
      hasActivePremium: isPremium,
      tier: Number(tier)
    };
  } catch (error) {
    console.error('Error checking premium status:', error);
    throw error;
  }
};

// ============ EARNINGS FUNCTIONS ============

/**
 * Withdraw earnings (seller or platform owner)
 * @returns {Promise<string>} Transaction hash
 */
export const withdrawEarnings = async () => {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.withdrawEarnings();
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error) {
    console.error('Error withdrawing earnings:', error);
    throw error;
  }
};

/**
 * Get seller's earnings balance
 * @param {string} sellerAddress - Seller's wallet address
 * @returns {Promise<string>} Earnings in wei
 */
export const getSellerEarnings = async (sellerAddress) => {
  try {
    const contract = getContractWithProvider();
    const earnings = await contract.sellerEarnings(sellerAddress);
    return earnings.toString();
  } catch (error) {
    console.error('Error fetching seller earnings:', error);
    throw error;
  }
};

// ============ UTILITY FUNCTIONS ============

/**
 * Convert ETH/MON to Wei
 * @param {string|number} amount - Amount in ETH/MON
 * @returns {string} Amount in wei
 */
export const toWei = (amount) => {
  return ethers.parseEther(amount.toString()).toString();
};

/**
 * Convert Wei to ETH/MON
 * @param {string} weiAmount - Amount in wei
 * @returns {string} Amount in ETH/MON
 */
export const fromWei = (weiAmount) => {
  return ethers.formatEther(weiAmount);
};

/**
 * Get subscription tier name
 * @param {number} tier - Tier number
 * @returns {string} Tier name
 */
export const getSubscriptionTierName = (tier) => {
  const tierNames = {
    [SUBSCRIPTION_TIERS.NONE]: 'None',
    [SUBSCRIPTION_TIERS.PRO]: 'Pro',
    [SUBSCRIPTION_TIERS.ENTERPRISE]: 'Enterprise'
  };
  return tierNames[tier] || 'Unknown';
};

/**
 * Get rental status name
 * @param {number} status - Status number
 * @returns {string} Status name
 */
export const getRentalStatusName = (status) => {
  const statusNames = {
    [RENTAL_STATUS.ACTIVE]: 'Active',
    [RENTAL_STATUS.COMPLETED]: 'Completed',
    [RENTAL_STATUS.CANCELLED]: 'Cancelled',
    [RENTAL_STATUS.DISPUTED]: 'Disputed'
  };
  return statusNames[status] || 'Unknown';
};

/**
 * Listen to contract events
 * @param {string} eventName - Event name
 * @param {Function} callback - Callback function
 * @returns {Function} Cleanup function
 */
export const listenToEvent = (eventName, callback) => {
  try {
    const contract = getContractWithProvider();
    contract.on(eventName, callback);
    
    // Return cleanup function
    return () => {
      contract.off(eventName, callback);
    };
  } catch (error) {
    console.error('Error setting up event listener:', error);
    throw error;
  }
};

// Export enums
export { SUBSCRIPTION_TIERS, RENTAL_STATUS };
