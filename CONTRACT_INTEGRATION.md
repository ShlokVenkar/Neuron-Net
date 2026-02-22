# Smart Contract Integration Guide

## Contract Details

- **Contract Address**: `0x82dd6cFc854C37282f00409D9d658De1CD3f554a`
- **Network**: Monad Blockchain
- **Version**: 1.0.0
- **Deployed Block**: 14479374

## Overview

The NeuronNet Marketplace smart contract is now fully integrated into the frontend. This guide shows you how to interact with the contract using the provided helper functions.

## Setup

The contract configuration is automatically loaded from environment variables. Ensure your `.env` file contains:

```env
VITE_CONTRACT_ADDRESS=0x82dd6cFc854C37282f00409D9d658De1CD3f554a
VITE_CONTRACT_NETWORK=Monad
```

## Usage Examples

### Importing the Helpers

```javascript
import {
  listGPU,
  getGPU,
  createRental,
  getRental,
  purchaseSubscription,
  withdrawEarnings,
  toWei,
  fromWei,
  SUBSCRIPTION_TIERS,
  RENTAL_STATUS
} from '../contracts/contractHelpers.js';
```

### 1. List a GPU (Seller)

```javascript
// List a new GPU on the marketplace
const handleListGPU = async () => {
  try {
    const gpuData = {
      name: "NVIDIA RTX 4090",
      cudaCores: 16384,
      vram: 24, // GB
      pricePerHour: toWei("0.05") // 0.05 MON per hour
    };
    
    const result = await listGPU(
      gpuData.name,
      gpuData.cudaCores,
      gpuData.vram,
      gpuData.pricePerHour
    );
    
    console.log('GPU Listed!');
    console.log('GPU ID:', result.gpuId);
    console.log('Transaction:', result.txHash);
    
    // Store GPU ID in your database
    // await saveGPUToSupabase(result.gpuId, gpuData);
    
  } catch (error) {
    console.error('Failed to list GPU:', error.message);
  }
};
```

### 2. Rent a GPU (Renter)

```javascript
// Create a rental for a GPU
const handleRentGPU = async (gpuId, hours) => {
  try {
    // First, get GPU details to calculate cost
    const gpu = await getGPU(gpuId);
    
    // Calculate total cost (will be discounted if user has premium)
    const baseCost = BigInt(gpu.pricePerHour) * BigInt(hours);
    
    // Add 1% buffer for gas price fluctuations
    const paymentAmount = (baseCost * BigInt(101)) / BigInt(100);
    
    const result = await createRental(gpuId, hours, paymentAmount.toString());
    
    console.log('Rental Created!');
    console.log('Rental ID:', result.rentalId);
    console.log('Transaction:', result.txHash);
    
    // Store rental in your database
    // await saveRentalToSupabase(result.rentalId, gpuId, hours);
    
  } catch (error) {
    console.error('Failed to create rental:', error.message);
  }
};
```

### 3. Purchase Premium Subscription

```javascript
// Purchase Pro subscription (30% discount on rentals)
const handlePurchasePro = async () => {
  try {
    const proPrice = toWei("50"); // 50 MON for 30 days
    
    const txHash = await purchaseSubscription(
      SUBSCRIPTION_TIERS.PRO,
      proPrice
    );
    
    console.log('Pro Subscription Purchased!');
    console.log('Transaction:', txHash);
    
  } catch (error) {
    console.error('Failed to purchase subscription:', error.message);
  }
};

// Purchase Enterprise subscription (50% discount on rentals)
const handlePurchaseEnterprise = async () => {
  try {
    const enterprisePrice = toWei("150"); // 150 MON for 90 days
    
    const txHash = await purchaseSubscription(
      SUBSCRIPTION_TIERS.ENTERPRISE,
      enterprisePrice
    );
    
    console.log('Enterprise Subscription Purchased!');
    console.log('Transaction:', txHash);
    
  } catch (error) {
    console.error('Failed to purchase subscription:', error.message);
  }
};
```

### 4. Request Assistance (Renter)

```javascript
// Request help from seller during rental
const handleRequestAssistance = async (rentalId) => {
  try {
    const txHash = await requestAssistance(rentalId);
    
    console.log('Assistance Requested!');
    console.log('Transaction:', txHash);
    
    // Update UI to show assistance requested status
    
  } catch (error) {
    console.error('Failed to request assistance:', error.message);
  }
};
```

### 5. Mark Output Delivered (Seller)

```javascript
// Mark that you've delivered the GPU output to the renter
const handleMarkOutputDelivered = async (rentalId) => {
  try {
    const txHash = await markOutputDelivered(rentalId);
    
    console.log('Output Marked as Delivered!');
    console.log('Transaction:', txHash);
    
    // Notify renter to complete the rental
    
  } catch (error) {
    console.error('Failed to mark output delivered:', error.message);
  }
};
```

### 6. Complete Rental (Renter)

```javascript
// Complete the rental and release payment
const handleCompleteRental = async (rentalId) => {
  try {
    const txHash = await completeRental(rentalId);
    
    console.log('Rental Completed!');
    console.log('Transaction:', txHash);
    
    // Update rental status in database
    
  } catch (error) {
    console.error('Failed to complete rental:', error.message);
  }
};
```

### 7. Withdraw Earnings (Seller)

```javascript
// Withdraw accumulated earnings
const handleWithdraw = async () => {
  try {
    const userAddress = window.ethereum.selectedAddress;
    
    // Check earnings first
    const earnings = await getSellerEarnings(userAddress);
    const earningsInMON = fromWei(earnings);
    
    if (parseFloat(earningsInMON) === 0) {
      alert('No earnings to withdraw');
      return;
    }
    
    console.log(`Withdrawing ${earningsInMON} MON...`);
    
    const txHash = await withdrawEarnings();
    
    console.log('Earnings Withdrawn!');
    console.log('Transaction:', txHash);
    
  } catch (error) {
    console.error('Failed to withdraw earnings:', error.message);
  }
};
```

### 8. Get User's Subscription Status

```javascript
// Check if user has active premium subscription
const checkPremiumStatus = async (userAddress) => {
  try {
    const { hasActivePremium, tier } = await hasActivePremium(userAddress);
    
    if (hasActivePremium) {
      const tierName = getSubscriptionTierName(tier);
      console.log(`User has active ${tierName} subscription`);
      
      // Show premium badge in UI
      // Apply discount calculations
    } else {
      console.log('User has no active subscription');
    }
    
  } catch (error) {
    console.error('Failed to check premium status:', error);
  }
};
```

### 9. Listen to Contract Events

```javascript
// Listen for new GPU listings
useEffect(() => {
  const cleanup = listenToEvent('GPUListed', (gpuId, seller, name, pricePerHour) => {
    console.log('New GPU Listed:', {
      gpuId: gpuId.toString(),
      seller,
      name,
      pricePerHour: fromWei(pricePerHour.toString())
    });
    
    // Update your GPU list
    // fetchGPUs();
  });
  
  return cleanup; // Cleanup on component unmount
}, []);

// Listen for rental completions
useEffect(() => {
  const cleanup = listenToEvent('RentalCompleted', (rentalId) => {
    console.log('Rental Completed:', rentalId.toString());
    
    // Update rental status in UI
  });
  
  return cleanup;
}, []);
```

## React Component Example

Here's a complete example of a React component using the contract helpers:

```javascript
import React, { useState, useEffect } from 'react';
import {
  listGPU,
  getGPU,
  createRental,
  toWei,
  fromWei
} from '../contracts/contractHelpers.js';

function GPURentalComponent() {
  const [gpus, setGPUs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleListGPU = async (formData) => {
    setLoading(true);
    try {
      const result = await listGPU(
        formData.name,
        formData.cudaCores,
        formData.vram,
        toWei(formData.pricePerHour)
      );
      
      alert(`GPU listed successfully! GPU ID: ${result.gpuId}`);
      
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRentGPU = async (gpuId, hours) => {
    setLoading(true);
    try {
      const gpu = await getGPU(gpuId);
      const cost = BigInt(gpu.pricePerHour) * BigInt(hours);
      
      const result = await createRental(gpuId, hours, cost.toString());
      
      alert(`Rental created! Rental ID: ${result.rentalId}`);
      
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {/* Your UI here */}
      {loading && <p>Processing transaction...</p>}
    </div>
  );
}
```

## Important Notes

### Gas Fees
- All write operations (listing, renting, withdrawing) require gas fees
- Always ensure users have enough MON for both the transaction and gas

### Transaction Confirmation
- Wait for transaction confirmation before updating UI
- All helper functions automatically await transaction receipts
- Show loading states during transactions

### Error Handling
- Wrap all contract calls in try-catch blocks
- Common errors:
  - User rejected transaction
  - Insufficient funds
  - Contract validation failures
  - Network issues

### Testing
- Test all contract interactions on testnet first
- Verify events are emitted correctly
- Check balances before and after transactions

## Helper Functions Reference

### Write Functions (Require Gas)
- `listGPU(name, cudaCores, vram, pricePerHour)` - List new GPU
- `updateGPUAvailability(gpuId, isAvailable)` - Update GPU status
- `delistGPU(gpuId)` - Delist GPU
- `createRental(gpuId, hours, paymentAmount)` - Create rental
- `requestAssistance(rentalId)` - Request help
- `markOutputDelivered(rentalId)` - Mark output delivered
- `completeRental(rentalId)` - Complete rental
- `cancelRental(rentalId)` - Cancel rental (within 5 min)
- `purchaseSubscription(tier, paymentAmount)` - Buy subscription
- `withdrawEarnings()` - Withdraw earnings

### Read Functions (Free)
- `getGPU(gpuId)` - Get GPU details
- `getRental(rentalId)` - Get rental details
- `getSubscription(userAddress)` - Get subscription details
- `hasActivePremium(userAddress)` - Check premium status
- `getSellerEarnings(sellerAddress)` - Check earnings balance

### Utility Functions
- `toWei(amount)` - Convert MON to Wei
- `fromWei(weiAmount)` - Convert Wei to MON
- `getSubscriptionTierName(tier)` - Get tier name
- `getRentalStatusName(status)` - Get status name
- `listenToEvent(eventName, callback)` - Listen to events

## Enum Values

### Subscription Tiers
```javascript
SUBSCRIPTION_TIERS.NONE = 0
SUBSCRIPTION_TIERS.PRO = 1        // 30% off, 50 MON for 30 days
SUBSCRIPTION_TIERS.ENTERPRISE = 2  // 50% off, 150 MON for 90 days
```

### Rental Status
```javascript
RENTAL_STATUS.ACTIVE = 0
RENTAL_STATUS.COMPLETED = 1
RENTAL_STATUS.CANCELLED = 2
RENTAL_STATUS.DISPUTED = 3
```

## Support

For contract-related issues, check:
1. MetaMask/OKX Wallet is connected
2. Correct network (Monad) is selected
3. Sufficient MON balance for transaction + gas
4. Contract address is correct in environment variables

For deployment or contract questions, refer to [DEPLOYMENT.md](../DEPLOYMENT.md).
