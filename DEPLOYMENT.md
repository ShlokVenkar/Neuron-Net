# 🚀 Neuron Net Deployment Guide

Complete guide for deploying Neuron Net GPU Marketplace on Monad blockchain with Supabase backend.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Smart Contract Deployment](#smart-contract-deployment)
4. [Frontend Configuration](#frontend-configuration)
5. [Testing](#testing)

---

## 🛠️ Prerequisites

### Required Tools

- **Node.js** v18+ and npm
- **Hardhat** or **Foundry** for Solidity deployment
- **MetaMask** wallet with MON tokens
- **Supabase** account (free tier works)
- **Git** for version control

### Monad Network Details

```
Network Name: Monad Testnet/Mainnet
RPC URL: [Get from Monad docs]
Chain ID: [Monad Chain ID]
Currency Symbol: MON
Block Explorer: [Monad Explorer URL]
```

---

## 🗄️ Supabase Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name: `neuron-net-marketplace`
4. Database Password: *Generate strong password*
5. Region: Choose closest to your users
6. Click "Create new project"

### Step 2: Execute Database Schema

1. Navigate to **SQL Editor** in Supabase Dashboard
2. Copy contents of `supabase/schema.sql`
3. Paste and execute the entire script
4. Wait for confirmation: ✅ Success

This will create:
- ✅ Tables: `profiles`, `gpu_listings`, `rentals`, `assistance_requests`, `output_files`, `ad_requests`, `subscriptions`
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Triggers for auto-updates
- ✅ Views for common queries

### Step 3: Create Storage Bucket

1. Navigate to **Storage** in Supabase Dashboard
2. Click "Create a new bucket"
3. Bucket name: `neuron-outputs`
4. **Uncheck** "Public bucket" (keep private)
5. Click "Create bucket"

### Step 4: Set Storage Policies

Execute in SQL Editor:

```sql
-- Allow team members to upload files
CREATE POLICY "Team can upload output files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'neuron-outputs' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'team'
  )
);

-- Allow users to download their own output files
CREATE POLICY "Users can download their output files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'neuron-outputs' 
  AND EXISTS (
    SELECT 1 FROM output_files 
    WHERE file_path = name 
    AND rental_id IN (
      SELECT id FROM rentals WHERE renter_id = auth.uid()
    )
  )
);
```

### Step 5: Get API Credentials

1. Navigate to **Settings** → **API**
2. Copy these values:
   - Project URL: `https://xxxxx.supabase.co`
   - `anon` public key: `eyJhbGc...`

### Step 6: Update Environment Variables

Edit `.env` in your project root:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 📜 Smart Contract Deployment

### Option A: Using Hardhat

#### 1. Install Dependencies

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

#### 2. Configure Hardhat

Create `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    monad: {
      url: process.env.MONAD_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: /* Monad Chain ID */
    }
  },
  etherscan: {
    apiKey: {
      monad: process.env.MONAD_API_KEY
    }
  }
};
```

#### 3. Create Deployment Script

Create `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying NeuronNetMarketplace to Monad...");

  const NeuronNetMarketplace = await hre.ethers.getContractFactory("NeuronNetMarketplace");
  const marketplace = await NeuronNetMarketplace.deploy();

  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  console.log("✅ NeuronNetMarketplace deployed to:", address);
  console.log("📝 Save this address in your frontend config!");

  // Verify contract (optional)
  console.log("⏳ Waiting for block confirmations...");
  await marketplace.deploymentTransaction().wait(5);
  
  console.log("🔍 Verifying contract...");
  await hre.run("verify:verify", {
    address: address,
    constructorArguments: [],
  });

  console.log("✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

#### 4. Deploy Contract

```bash
# Deploy to Monad network
npx hardhat run scripts/deploy.js --network monad

# Output:
# ✅ NeuronNetMarketplace deployed to: 0x1234...5678
# 📝 Save this address: 0x1234...5678
```

#### 5. Save Contract Address

Update your frontend config with deployed address:

```javascript
// src/config/contracts.js
export const MARKETPLACE_ADDRESS = "0x1234...5678"; // Your deployed address
export const MARKETPLACE_ABI = [...]; // Copy from artifacts/contracts/NeuronNetMarketplace.sol/NeuronNetMarketplace.json
```

---

### Option B: Using Foundry

#### 1. Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

#### 2. Initialize Foundry Project

```bash
forge init --force
```

#### 3. Deploy Contract

```bash
forge create \
  --rpc-url $MONAD_RPC_URL \
  --private-key $PRIVATE_KEY \
  --etherscan-api-key $MONAD_API_KEY \
  --verify \
  contracts/NeuronNetMarketplace.sol:NeuronNetMarketplace
```

---

## 🌐 Frontend Configuration

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Ensure `.env` has all required variables:

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Monad Contract (add after deployment)
VITE_MARKETPLACE_ADDRESS=0x1234...5678
VITE_MONAD_RPC_URL=https://rpc.monad.xyz
VITE_MONAD_CHAIN_ID=12345
```

### 3. Update Contract Integration

Edit `src/utils/contractInteraction.js` (create if doesn't exist):

```javascript
import { ethers } from 'ethers';
import MARKETPLACE_ABI from './MarketplaceABI.json';

const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS;

export async function getRentPrice(gpuId, hours) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
  
  const userAddress = await signer.getAddress();
  const [baseCost, discountedCost] = await contract.calculateRentalCost(
    userAddress, 
    gpuId, 
    hours
  );
  
  return {
    baseCost: ethers.formatEther(baseCost),
    finalCost: ethers.formatEther(discountedCost)
  };
}

export async function createRental(gpuId, hours) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
  
  const [, discountedCost] = await contract.calculateRentalCost(
    await signer.getAddress(), 
    gpuId, 
    hours
  );
  
  const tx = await contract.createRental(gpuId, hours, { 
    value: discountedCost 
  });
  
  const receipt = await tx.wait();
  return receipt;
}

export async function purchaseSubscription(tier) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
  
  const tierEnum = tier === 'pro' ? 1 : 2; // PRO = 1, ENTERPRISE = 2
  const price = tier === 'pro' ? '50' : '150';
  
  const tx = await contract.purchaseSubscription(tierEnum, {
    value: ethers.parseEther(price)
  });
  
  const receipt = await tx.wait();
  return receipt;
}
```

### 4. Build for Production

```bash
npm run build
```

### 5. Deploy Frontend

#### Option A: Vercel

```bash
npm install -g vercel
vercel --prod
```

#### Option B: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Option C: Traditional Hosting

Upload contents of `dist/` folder to your web server.

---

## 🧪 Testing

### Test Supabase Connection

```javascript
// Test in browser console
import { supabase } from './src/supabaseClient';

const { data, error } = await supabase.from('profiles').select('*').limit(1);
console.log('Supabase test:', data, error);
```

### Test File Upload (Team Dashboard)

1. Login as team member
2. Navigate to Help Requests
3. Click "Upload Output" on a request
4. Select file (max 50MB recommended)
5. Click "Upload Output"
6. Check Supabase Storage → `neuron-outputs` bucket

### Test File Download (User Dashboard)

1. Login as user with completed request
2. You should see auto-popup with output ready
3. Click "Download Output File"
4. File should download to your device

### Test Smart Contract

```javascript
// Test in browser console with MetaMask
const provider = new ethers.BrowserProvider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = await provider.getSigner();
const address = await signer.getAddress();
console.log("Connected:", address);

// Test getting available GPUs
const contract = new ethers.Contract(MARKETPLACE_ADDRESS, ABI, signer);
const gpus = await contract.getAvailableGPUs();
console.log("Available GPUs:", gpus);
```

---

## 🔐 Security Checklist

- [ ] Environment variables not committed to Git
- [ ] Supabase RLS policies enabled on all tables
- [ ] Storage bucket set to private (not public)
- [ ] Smart contract verified on block explorer
- [ ] Private keys stored securely (never in code)
- [ ] HTTPS enabled on frontend
- [ ] Rate limiting configured on backend
- [ ] File upload size limits enforced (50MB max)
- [ ] MetaMask transaction confirmations required

---

## 📊 Post-Deployment

### Monitor Your App

1. **Supabase Dashboard**: Check database activity
2. **Block Explorer**: Monitor contract transactions
3. **Storage Usage**: Track uploaded files
4. **User Activity**: Monitor sign-ups and rentals

### Add Team Member

Execute in Supabase SQL Editor:

```sql
-- Get user ID from auth.users table first
SELECT id, email FROM auth.users WHERE email = 'team@yourdomain.com';

-- Then update role
UPDATE profiles 
SET role = 'team' 
WHERE id = 'user-uuid-here';
```

### List First GPU (For Testing)

Use smart contract interaction:

```javascript
const tx = await contract.listGPU(
  "NVIDIA RTX 4090",  // name
  16384,              // CUDA cores
  24,                 // VRAM in GB
  ethers.parseEther("0.001") // price per hour in MON
);
await tx.wait();
```

---

## 🆘 Troubleshooting

### Supabase Connection Fails

```
Error: Invalid API key
```

**Solution**: Double-check `.env` variables match Supabase dashboard

### File Upload Fails

```
Error: Policy violation
```

**Solution**: Verify user has `role = 'team'` in profiles table

### Contract Deployment Fails

```
Error: insufficient funds
```

**Solution**: Ensure wallet has enough MON for gas fees

### MetaMask Not Connecting

**Solution**: 
1. Check Monad network is added to MetaMask
2. Verify RPC URL is correct
3. Clear MetaMask cache and reconnect

---

## 📞 Support

- **Documentation**: [Your docs URL]
- **Discord**: [Your Discord invite]
- **Email**: support@neuronnet.io
- **GitHub Issues**: [Your repo URL]/issues

---

## 🎉 Congratulations!

Your Neuron Net GPU Marketplace is now live on Monad! 🚀

Users can:
- ✅ Rent GPUs with MON tokens
- ✅ Get premium subscriptions (30-50% off)
- ✅ Request team assistance
- ✅ Download output files automatically

Next steps:
- Add more GPUs to marketplace
- Invite sellers to list their hardware
- Promote to crypto/AI communities
- Monitor and optimize performance

**Happy Building! 🌌**
