// Example: Integrating Smart Contract with UserDashboard
// This file shows how to add blockchain functionality to your dashboard

import { useState, useEffect } from 'react';
import {
  createRental,
  getRental,
  requestAssistance,
  completeRental,
  cancelRental,
  purchaseSubscription,
  hasActivePremium,
  getGPU,
  toWei,
  fromWei,
  SUBSCRIPTION_TIERS,
  RENTAL_STATUS,
  getRentalStatusName,
  listenToEvent
} from '../contracts/contractHelpers.js';

/**
 * Example Hook: Use this in your UserDashboard component
 */
export function useContractIntegration(walletAddress) {
  const [loading, setLoading] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState({ hasActivePremium: false, tier: 0 });
  
  // Check user's premium status on mount
  useEffect(() => {
    if (walletAddress) {
      checkPremiumStatus();
    }
  }, [walletAddress]);
  
  const checkPremiumStatus = async () => {
    try {
      const status = await hasActivePremium(walletAddress);
      setPremiumStatus(status);
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };
  
  return { loading, setLoading, premiumStatus, checkPremiumStatus };
}

/**
 * Example: Rent GPU Button Handler
 */
export async function handleRentGPU(gpuId, hours, setLoading) {
  setLoading(true);
  
  try {
    // 1. Get GPU details to calculate cost
    const gpu = await getGPU(gpuId);
    console.log('GPU Details:', gpu);
    
    // 2. Calculate cost (contract will apply premium discount automatically)
    const baseCost = BigInt(gpu.pricePerHour) * BigInt(hours);
    const costWithBuffer = (baseCost * BigInt(105)) / BigInt(100); // 5% buffer
    
    // 3. Create rental transaction
    const result = await createRental(gpuId, hours, costWithBuffer.toString());
    
    // 4. Show success message
    alert(`✅ Rental Created Successfully!\n\nRental ID: ${result.rentalId}\nTransaction: ${result.txHash}`);
    
    // 5. Store rental in Supabase
    // await saveRentalToDatabase(result.rentalId, gpuId, hours);
    
    return result;
    
  } catch (error) {
    console.error('Rental creation failed:', error);
    
    // Parse error message for user-friendly display
    let errorMessage = 'Failed to create rental';
    if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds. Please add more MON to your wallet.';
    } else if (error.message.includes('user rejected')) {
      errorMessage = 'Transaction cancelled by user.';
    } else if (error.message.includes('GPU not available')) {
      errorMessage = 'This GPU is currently unavailable.';
    }
    
    alert(`❌ Error: ${errorMessage}`);
    throw error;
    
  } finally {
    setLoading(false);
  }
}

/**
 * Example: Purchase Premium Subscription
 */
export async function handlePurchaseSubscription(tier, setLoading, onSuccess) {
  setLoading(true);
  
  try {
    // Subscription prices
    const prices = {
      [SUBSCRIPTION_TIERS.PRO]: toWei("50"),       // 50 MON for 30 days, 30% discount
      [SUBSCRIPTION_TIERS.ENTERPRISE]: toWei("150") // 150 MON for 90 days, 50% discount
    };
    
    const tierNames = {
      [SUBSCRIPTION_TIERS.PRO]: 'Pro',
      [SUBSCRIPTION_TIERS.ENTERPRISE]: 'Enterprise'
    };
    
    const price = prices[tier];
    const tierName = tierNames[tier];
    
    // Confirm with user
    const confirm = window.confirm(
      `Purchase ${tierName} Subscription?\n\nPrice: ${fromWei(price)} MON\nClick OK to proceed.`
    );
    
    if (!confirm) {
      setLoading(false);
      return;
    }
    
    // Purchase subscription
    const txHash = await purchaseSubscription(tier, price);
    
    alert(`✅ ${tierName} Subscription Purchased!\n\nTransaction: ${txHash}`);
    
    if (onSuccess) onSuccess();
    
    return txHash;
    
  } catch (error) {
    console.error('Subscription purchase failed:', error);
    
    let errorMessage = 'Failed to purchase subscription';
    if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds. Please add more MON to your wallet.';
    } else if (error.message.includes('user rejected')) {
      errorMessage = 'Transaction cancelled by user.';
    }
    
    alert(`❌ Error: ${errorMessage}`);
    throw error;
    
  } finally {
    setLoading(false);
  }
}

/**
 * Example: Request Assistance
 */
export async function handleRequestAssistance(rentalId, setLoading) {
  setLoading(true);
  
  try {
    const txHash = await requestAssistance(rentalId);
    
    alert(`✅ Assistance Requested!\n\nThe seller has been notified and will help you shortly.\n\nTransaction: ${txHash}`);
    
    return txHash;
    
  } catch (error) {
    console.error('Request assistance failed:', error);
    alert(`❌ Error: Failed to request assistance. ${error.message}`);
    throw error;
    
  } finally {
    setLoading(false);
  }
}

/**
 * Example: Complete Rental
 */
export async function handleCompleteRental(rentalId, setLoading) {
  setLoading(true);
  
  try {
    // Check rental status first
    const rental = await getRental(rentalId);
    
    if (!rental.outputDelivered) {
      alert('⚠️ Cannot complete rental: Output has not been delivered yet.');
      setLoading(false);
      return;
    }
    
    const confirm = window.confirm(
      'Complete this rental and release payment to the seller?\n\nThis action cannot be undone.'
    );
    
    if (!confirm) {
      setLoading(false);
      return;
    }
    
    const txHash = await completeRental(rentalId);
    
    alert(`✅ Rental Completed!\n\nPayment has been released to the seller.\n\nTransaction: ${txHash}`);
    
    return txHash;
    
  } catch (error) {
    console.error('Complete rental failed:', error);
    alert(`❌ Error: Failed to complete rental. ${error.message}`);
    throw error;
    
  } finally {
    setLoading(false);
  }
}

/**
 * Example: Cancel Rental (within 5 minutes)
 */
export async function handleCancelRental(rentalId, setLoading) {
  setLoading(true);
  
  try {
    const confirm = window.confirm(
      'Cancel this rental?\n\nYou can only cancel within 5 minutes of creation.\nYour payment will be refunded.'
    );
    
    if (!confirm) {
      setLoading(false);
      return;
    }
    
    const txHash = await cancelRental(rentalId);
    
    alert(`✅ Rental Cancelled!\n\nYour payment has been refunded.\n\nTransaction: ${txHash}`);
    
    return txHash;
    
  } catch (error) {
    console.error('Cancel rental failed:', error);
    
    let errorMessage = error.message;
    if (error.message.includes('5 minutes')) {
      errorMessage = 'Cannot cancel: The 5-minute cancellation window has passed.';
    }
    
    alert(`❌ Error: ${errorMessage}`);
    throw error;
    
  } finally {
    setLoading(false);
  }
}

/**
 * Example: Display GPU with Price
 */
export function GPUCard({ gpuId }) {
  const [gpu, setGPU] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadGPU();
  }, [gpuId]);
  
  const loadGPU = async () => {
    try {
      const gpuData = await getGPU(gpuId);
      setGPU(gpuData);
    } catch (error) {
      console.error('Failed to load GPU:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRent = async () => {
    const hours = prompt('How many hours would you like to rent?');
    if (!hours || isNaN(hours) || hours <= 0) return;
    
    try {
      await handleRentGPU(gpuId, parseInt(hours), setLoading);
      alert('Rental created successfully!');
    } catch (error) {
      // Error already handled in handleRentGPU
    }
  };
  
  if (loading) return <div>Loading GPU...</div>;
  if (!gpu) return <div>GPU not found</div>;
  
  return (
    <div className="gpu-card">
      <h3>{gpu.name}</h3>
      <p>CUDA Cores: {gpu.cudaCores}</p>
      <p>VRAM: {gpu.vram} GB</p>
      <p>Price: {fromWei(gpu.pricePerHour)} MON/hour</p>
      <p>Status: {gpu.isAvailable ? '✅ Available' : '❌ Unavailable'}</p>
      <p>Total Rentals: {gpu.totalRentals}</p>
      
      <button 
        onClick={handleRent}
        disabled={!gpu.isAvailable || loading}
      >
        {loading ? 'Processing...' : 'Rent Now'}
      </button>
    </div>
  );
}

/**
 * Example: Premium Badge Component
 */
export function PremiumBadge({ walletAddress }) {
  const [status, setStatus] = useState({ hasActivePremium: false, tier: 0 });
  
  useEffect(() => {
    if (walletAddress) {
      checkStatus();
    }
  }, [walletAddress]);
  
  const checkStatus = async () => {
    try {
      const premiumStatus = await hasActivePremium(walletAddress);
      setStatus(premiumStatus);
    } catch (error) {
      console.error('Failed to check premium status:', error);
    }
  };
  
  if (!status.hasActivePremium) {
    return <span className="badge">Free</span>;
  }
  
  const tierColors = {
    [SUBSCRIPTION_TIERS.PRO]: 'purple',
    [SUBSCRIPTION_TIERS.ENTERPRISE]: 'gold'
  };
  
  const tierNames = {
    [SUBSCRIPTION_TIERS.PRO]: 'Pro',
    [SUBSCRIPTION_TIERS.ENTERPRISE]: 'Enterprise'
  };
  
  return (
    <span 
      className="badge premium-badge" 
      style={{ backgroundColor: tierColors[status.tier] }}
    >
      ⭐ {tierNames[status.tier]}
    </span>
  );
}

/**
 * Example: Active Rentals List
 */
export function ActiveRentals({ rentalIds }) {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadRentals();
  }, [rentalIds]);
  
  const loadRentals = async () => {
    try {
      const rentalPromises = rentalIds.map(id => getRental(id));
      const rentalData = await Promise.all(rentalPromises);
      setRentals(rentalData);
    } catch (error) {
      console.error('Failed to load rentals:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading rentals...</div>;
  
  return (
    <div className="rentals-list">
      <h2>Active Rentals</h2>
      {rentals.length === 0 ? (
        <p>No active rentals</p>
      ) : (
        rentals.map(rental => (
          <div key={rental.id} className="rental-card">
            <h3>Rental #{rental.id}</h3>
            <p>GPU ID: {rental.gpuId}</p>
            <p>Duration: {rental.duration} hours</p>
            <p>Cost: {fromWei(rental.totalCost)} MON</p>
            <p>Status: {getRentalStatusName(rental.status)}</p>
            <p>Output Delivered: {rental.outputDelivered ? '✅ Yes' : '❌ No'}</p>
            
            <div className="rental-actions">
              {rental.status === RENTAL_STATUS.ACTIVE && (
                <>
                  {!rental.assistanceRequested && (
                    <button onClick={() => handleRequestAssistance(rental.id, setLoading)}>
                      Request Assistance
                    </button>
                  )}
                  
                  {rental.outputDelivered && (
                    <button onClick={() => handleCompleteRental(rental.id, setLoading)}>
                      Complete Rental
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleCancelRental(rental.id, setLoading)}
                    className="btn-danger"
                  >
                    Cancel Rental
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Export all example functions
export default {
  useContractIntegration,
  handleRentGPU,
  handlePurchaseSubscription,
  handleRequestAssistance,
  handleCompleteRental,
  handleCancelRental,
  GPUCard,
  PremiumBadge,
  ActiveRentals
};
