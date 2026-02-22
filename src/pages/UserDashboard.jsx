import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { connectWallet, formatAddress, getConnectedWallet, saveWalletConnection } from '../utils/walletConnect';
import './Dashboard.css';
import './SubscriptionStyles.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRentModal, setShowRentModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, jobs
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [rentFormData, setRentFormData] = useState({
    workDescription: '',
    needAssistance: false
  });
  const [adFormData, setAdFormData] = useState({
    messageType: 'advertisement',
    message: '',
    contactEmail: ''
  });
  const [monBalance, setMonBalance] = useState(150.75); // Mock balance, would fetch from blockchain
  const [activeJobs, setActiveJobs] = useState([]);
  const [assistanceRequests, setAssistanceRequests] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumTier, setPremiumTier] = useState(null); // 'pro', 'enterprise'
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [selectedOutput, setSelectedOutput] = useState(null);
  const [downloadingOutput, setDownloadingOutput] = useState(false);

  useEffect(() => {
    checkUser();
    // Check if wallet is connected and fetch balance
    const { address, connected } = getConnectedWallet();
    if (connected && address) {
      setWalletAddress(address);
      setWalletConnected(true);
      // Fetch current balance from MetaMask
      if (window.ethereum) {
        window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        }).then(balance => {
          const balanceInMON = parseInt(balance, 16) / Math.pow(10, 18);
          setMonBalance(balanceInMON);
        }).catch(err => console.error('Error fetching balance:', err));
      }
    }
    
    // Load active jobs from localStorage
    const savedJobs = localStorage.getItem('activeJobs');
    if (savedJobs) {
      setActiveJobs(JSON.parse(savedJobs));
    }

    const savedRequests = localStorage.getItem('assistanceRequests');
    if (savedRequests) {
      setAssistanceRequests(JSON.parse(savedRequests));
    }

    // Load premium status
    const premium = localStorage.getItem('isPremium') === 'true';
    const tier = localStorage.getItem('premiumTier');
    setIsPremium(premium);
    setPremiumTier(tier);
    
    // Check for jobs with output files
    checkForOutputFiles();
  }, []);
  
  // Function to check for output files
  const checkForOutputFiles = () => {
    const jobs = JSON.parse(localStorage.getItem('activeJobs') || '[]');
    const jobsWithOutput = jobs.filter(job => job.hasOutput && !job.outputViewed);
    
    // If there are new outputs, show notification
    if (jobsWithOutput.length > 0) {
      // Show popup for the first unviewed output
      const firstOutput = jobsWithOutput[0];
      setSelectedOutput(firstOutput);
      setShowOutputModal(true);
    }
  };

  useEffect(() => {
    // Update job progress every 5 minutes
    const interval = setInterval(() => {
      setActiveJobs(prevJobs => {
        const updatedJobs = prevJobs.map(job => {
          if (job.status === 'running') {
            const newProgress = Math.min(job.progress + 10, 100);
            const newLog = `[${new Date().toLocaleTimeString()}] Processing... ${newProgress}% complete`;
            
            return {
              ...job,
              progress: newProgress,
              logs: [...job.logs, newLog],
              status: newProgress >= 100 ? 'completed' : 'running'
            };
          }
          return job;
        });
        
        localStorage.setItem('activeJobs', JSON.stringify(updatedJobs));
        return updatedJobs;
      });
    }, 300000); // 5 minutes in milliseconds

    return () => clearInterval(interval);
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
    } else {
      setUser(user);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSupport = () => {
    const subject = encodeURIComponent('Neuron Net Support Request');
    const body = encodeURIComponent(
      `Hello Neuron Net Support Team,\n\n` +
      `User Email: ${user?.email || 'N/A'}\n` +
      `User Name: ${user?.user_metadata?.full_name || 'N/A'}\n` +
      `Account Type: ${isPremium ? `Premium ${premiumTier?.toUpperCase()}` : 'Standard'}\n\n` +
      `Issue Description:\n` +
      `[Please describe your issue here]\n\n` +
      `---\n` +
      `Dashboard: User Dashboard\n` +
      `Timestamp: ${new Date().toLocaleString()}`
    );
    window.location.href = `mailto:support@neuronnet.io?subject=${subject}&body=${body}`;
  };

  const canSwitchToSeller = () => {
    return user?.user_metadata?.user_type === 'both' || user?.user_metadata?.user_type === 'seller';
  };

  const handleRentClick = (resource) => {
    setSelectedResource(resource);
    setShowRentModal(true);
  };

  const handleRentSubmit = async (e) => {
    e.preventDefault();
    
    if (!walletConnected) {
      alert('❌ Please connect your wallet first!');
      return;
    }
    
    // Apply premium discount if applicable
    const originalPrice = selectedResource.priceValue;
    const finalPrice = isPremium ? getDiscountedPrice(originalPrice) : originalPrice;
    const discount = getPremiumDiscount();
    
    if (monBalance < finalPrice) {
      alert(`❌ Insufficient MON tokens!\n\nRequired: ${finalPrice.toFixed(3)} MON\nYour balance: ${monBalance.toFixed(3)} MON\n\nPlease add MON tokens to your wallet.`);
      return;
    }
    
    // Simulate payment transaction
    const newBalance = monBalance - finalPrice;
    setMonBalance(newBalance);
    
    // Create new job
    const newJob = {
      id: Date.now(),
      resourceName: selectedResource.name,
      workDescription: rentFormData.workDescription,
      cost: finalPrice,
      originalPrice: originalPrice,
      discountApplied: discount * 100,
      startTime: new Date().toLocaleString(),
      status: 'running',
      progress: 0,
      needsAssistance: rentFormData.needAssistance,
      logs: [
        `[${new Date().toLocaleTimeString()}] GPU ${selectedResource.name} initialized`,
        `[${new Date().toLocaleTimeString()}] Loading compute environment...`,
        rentFormData.workDescription ? `[${new Date().toLocaleTimeString()}] Starting task: ${rentFormData.workDescription}` : `[${new Date().toLocaleTimeString()}] Starting compute task...`,
        `[${new Date().toLocaleTimeString()}] Processing... 0% complete`
      ]
    };
    
    const updatedJobs = [...activeJobs, newJob];
    setActiveJobs(updatedJobs);
    localStorage.setItem('activeJobs', JSON.stringify(updatedJobs));
    
    // If assistance requested, add to team dashboard
    if (rentFormData.needAssistance) {
      const assistanceRequest = {
        id: Date.now(),
        userName: user?.user_metadata?.full_name || 'User',
        userEmail: user?.email || '',
        workDescription: rentFormData.workDescription || 'User requested assistance for GPU compute task (no description provided)',
        resourceName: selectedResource.name,
        jobId: newJob.id,
        timestamp: new Date().toLocaleString(),
        status: 'pending'
      };
      
      const updatedRequests = [...assistanceRequests, assistanceRequest];
      setAssistanceRequests(updatedRequests);
      localStorage.setItem('assistanceRequests', JSON.stringify(updatedRequests));
      
      const discountMsg = isPremium ? `\n💎 Premium ${discount * 100}% discount applied!\nOriginal: ${originalPrice} MON → You paid: ${finalPrice.toFixed(3)} MON` : '';
      alert(`✅ GPU ${selectedResource.name} started!${discountMsg}\n\nCost: ${finalPrice.toFixed(3)} MON\nNew Balance: ${newBalance.toFixed(3)} MON\n\n🚀 Your GPU is now running!\n📞 Team assistance request submitted.\n\nCheck the "Jobs & Progress" tab to monitor status.`);
    } else {
      const discountMsg = isPremium ? `\n💎 Premium ${discount * 100}% discount applied!\nOriginal: ${originalPrice} MON → You paid: ${finalPrice.toFixed(3)} MON` : '';
      alert(`✅ GPU ${selectedResource.name} started!${discountMsg}\n\nCost: ${finalPrice.toFixed(3)} MON\nNew Balance: ${newBalance.toFixed(3)} MON\n\n🚀 Your GPU is now running!\n\nCheck the "Jobs & Progress" tab to monitor progress.`);
    }
    
    setShowRentModal(false);
    setRentFormData({ workDescription: '', needAssistance: false });
    setSelectedResource(null);
  };

  const closeModal = () => {
    setShowRentModal(false);
    setRentFormData({ workDescription: '', needAssistance: false });
    setSelectedResource(null);
  };

  const handleAdClick = () => {
    setShowAdModal(true);
  };

  const closeAdModal = () => {
    setShowAdModal(false);
    setAdFormData({ messageType: 'advertisement', message: '', contactEmail: '' });
  };

  const handleAdSubmit = async (e) => {
    e.preventDefault();
    
    // Create ad request object
    const adRequest = {
      id: Date.now(),
      email: adFormData.contactEmail,
      messageType: adFormData.messageType,
      message: adFormData.message,
      timestamp: new Date().toLocaleString(),
      status: 'pending'
    };
    
    // Save to localStorage for team dashboard
    const existingRequests = JSON.parse(localStorage.getItem('adRequests') || '[]');
    existingRequests.push(adRequest);
    localStorage.setItem('adRequests', JSON.stringify(existingRequests));
    
    alert(`✅ Your ${adFormData.messageType} request has been submitted!\n\nOur team will review it and contact you at ${adFormData.contactEmail}`);
    closeAdModal();
  };

  const handleConnectWallet = async () => {
    try {
      const wallet = await connectWallet();
      setWalletAddress(wallet.address);
      setWalletConnected(true);
      setMonBalance(wallet.balance); // Update MON balance from wallet
      saveWalletConnection(wallet.address);
      alert('✅ Wallet connected successfully!\n\nMON Balance: ' + wallet.balance.toFixed(3) + ' MON');
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  const handleSubscribe = (tier) => {
    const plans = {
      pro: { name: 'Pro', cost: 50, discount: 30 },
      enterprise: { name: 'Enterprise', cost: 150, discount: 50 }
    };

    const plan = plans[tier];
    if (!walletConnected) {
      alert('❌ Please connect your wallet first to subscribe!');
      return;
    }

    if (monBalance < plan.cost) {
      alert(`❌ Insufficient MON tokens!\n\nRequired: ${plan.cost} MON\nYour balance: ${monBalance.toFixed(3)} MON`);
      return;
    }

    // Deduct subscription cost
    const newBalance = monBalance - plan.cost;
    setMonBalance(newBalance);
    setIsPremium(true);
    setPremiumTier(tier);
    localStorage.setItem('isPremium', 'true');
    localStorage.setItem('premiumTier', tier);
    setShowSubscriptionModal(false);

    alert(`🎉 Welcome to ${plan.name}!\n\n✨ You now get ${plan.discount}% off all GPU rentals\n🚀 Priority support & faster allocation\n💎 Premium badge activated\n\nNew Balance: ${newBalance.toFixed(3)} MON`);
  };

  const getPremiumDiscount = () => {
    if (!isPremium) return 0;
    return premiumTier === 'enterprise' ? 0.5 : 0.3; // 50% or 30% discount
  };

  const handleDownloadOutput = async (job) => {
    setDownloadingOutput(true);
    
    try {
      // Download file from Supabase storage
      const { data, error } = await supabase.storage
        .from('neuron-outputs')
        .download(job.outputFilePath);
      
      if (error) {
        throw error;
      }
      
      // Create blob and download
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = job.outputFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Mark as viewed
      const jobs = JSON.parse(localStorage.getItem('activeJobs') || '[]');
      const updatedJobs = jobs.map(j => 
        j.id === job.id ? { ...j, outputViewed: true } : j
      );
      localStorage.setItem('activeJobs', JSON.stringify(updatedJobs));
      setActiveJobs(updatedJobs);
      
      alert(`✅ Output file downloaded successfully!\nFile: ${job.outputFileName}`);
      setShowOutputModal(false);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      alert(`❌ Error downloading file: ${error.message}`);
    } finally {
      setDownloadingOutput(false);
    }
  };

  const handleViewOutput = (job) => {
    setSelectedOutput(job);
    setShowOutputModal(true);
  };

  const getDiscountedPrice = (price) => {
    const discount = getPremiumDiscount();
    return price * (1 - discount);
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">
          <h2>NEURON NET</h2>
          <span className="dashboard-role">User Dashboard</span>
        </div>
        <nav className="dashboard-nav">
          <a 
            href="#overview" 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            Overview
          </a>
          <a 
            href="#jobs" 
            className={`nav-item ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('jobs'); }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            Jobs & Progress
          </a>
          <a href="#settings" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/settings'); }}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
            </svg>
            Settings
          </a>
          <a 
            href="#support" 
            className="nav-item"
            onClick={(e) => { e.preventDefault(); handleSupport(); }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
            </svg>
            Support
          </a>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          Logout
        </button>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.user_metadata?.full_name || 'User'}!</h1>
            <p>Manage your compute resources and jobs</p>
          </div>
          <div className="header-actions-group">
            {isPremium && (
              <div className="premium-badge-header">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>{premiumTier === 'enterprise' ? 'ENTERPRISE' : 'PRO'}</span>
              </div>
            )}
            {!isPremium && (
              <button onClick={() => setShowSubscriptionModal(true)} className="btn-subscribe">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Upgrade to Premium
              </button>
            )}
            {walletConnected ? (
              <div className="wallet-connected-badge">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>{formatAddress(walletAddress)}</span>
                <span className="mon-balance">{monBalance.toFixed(3)} MON</span>
              </div>
            ) : (
              <button onClick={handleConnectWallet} className="btn-connect-wallet-dash">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
                Connect Wallet
              </button>
            )}
            <div className="user-profile">
              {canSwitchToSeller() && (
                <button 
                  className="role-switcher"
                  onClick={() => navigate('/dashboard/seller')}
                  title="Switch to Seller Dashboard"
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                  </svg>
                  Seller
                </button>
              )}
              <div className="user-avatar">
                {user?.user_metadata?.full_name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon purple">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Active Jobs</h3>
              <p className="stat-value">{activeJobs.filter(j => j.status === 'running').length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Compute Hours</h3>
              <p className="stat-value">{activeJobs.reduce((sum, j) => sum + (j.hours || 0), 0)}h</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Total Spent</h3>
              <p className="stat-value">0 MON</p>
            </div>
          </div>
        </div>

        {/* Advertisement Section */}
        <div className="ad-section">
          <div className="ad-banner">
            <div className="ad-content">
              <div className="ad-icon">📢</div>
              <div className="ad-text">
                <h3>YOUR AD HERE</h3>
                <p>Advertise your GPU compute services or AI tools</p>
              </div>
            </div>
            <button className="btn-ad-contact" onClick={handleAdClick}>Contact Us</button>
          </div>
        </div>

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <>
              <div className="content-card">
                <h2>Available Compute Resources</h2>
                <p className="card-subtitle">Browse and rent compute power from our global network</p>
            <div className="resource-list">
              <div className="resource-item">
                <div className="resource-info">
                  <h4>NVIDIA RTX 4090 <span className="test-badge">TEST PRICE</span></h4>
                  <p>24GB VRAM • 16,384 CUDA Cores • Best for Gaming & Light AI</p>
                </div>
                <div className="resource-price">
                  <span className="price">
                    {isPremium && (
                      <span className="original-price">0.001 MON/hr</span>
                    )}
                    <span className={isPremium ? "discounted-price" : ""}>
                      {isPremium ? getDiscountedPrice(0.001).toFixed(4) : '0.001'} MON/hr
                    </span>
                    {isPremium && (
                      <span className="discount-badge">{getPremiumDiscount() * 100}% OFF</span>
                    )}
                  </span>
                  <button 
                    className="btn-rent" 
                    onClick={() => handleRentClick({ name: 'NVIDIA RTX 4090', price: '0.001 MON/hr', priceValue: 0.001, specs: '24GB VRAM • 16,384 CUDA Cores' })}
                  >
                    Rent Now
                  </button>
                </div>
              </div>
              <div className="resource-item">
                <div className="resource-info">
                  <h4>NVIDIA A100</h4>
                  <p>40GB VRAM • 6,912 CUDA Cores • AI Training & Research</p>
                </div>
                <div className="resource-price">
                  <span className="price">
                    {isPremium && (
                      <span className="original-price">28 MON/hr</span>
                    )}
                    <span className={isPremium ? "discounted-price" : ""}>
                      {isPremium ? getDiscountedPrice(28).toFixed(1) : '28'} MON/hr
                    </span>
                    {isPremium && (
                      <span className="discount-badge">{getPremiumDiscount() * 100}% OFF</span>
                    )}
                  </span>
                  <button 
                    className="btn-rent"
                    onClick={() => handleRentClick({ name: 'NVIDIA A100', price: '28 MON/hr', priceValue: 28, specs: '40GB VRAM • 6,912 CUDA Cores' })}
                  >
                    Rent Now
                  </button>
                </div>
              </div>
              <div className="resource-item">
                <div className="resource-info">
                  <h4>NVIDIA H100</h4>
                  <p>80GB HBM3 • Advanced AI & ML Workloads</p>
                </div>
                <div className="resource-price">
                  <span className="price">
                    {isPremium && (
                      <span className="original-price">55 MON/hr</span>
                    )}
                    <span className={isPremium ? "discounted-price" : ""}>
                      {isPremium ? getDiscountedPrice(55).toFixed(1) : '55'} MON/hr
                    </span>
                    {isPremium && (
                      <span className="discount-badge">{getPremiumDiscount() * 100}% OFF</span>
                    )}
                  </span>
                  <button 
                    className="btn-rent"
                    onClick={() => handleRentClick({ name: 'NVIDIA H100', price: '55 MON/hr', priceValue: 55, specs: '80GB HBM3 • Next-gen Architecture' })}
                  >
                    Rent Now
                  </button>
                </div>
              </div>
              <div className="resource-item">
                <div className="resource-info">
                  <h4>AMD EPYC 7742</h4>
                  <p>64 Cores • 128 Threads • CPU Compute Tasks</p>
                </div>
                <div className="resource-price">
                  <span className="price">
                    {isPremium && (
                      <span className="original-price">8 MON/hr</span>
                    )}
                    <span className={isPremium ? "discounted-price" : ""}>
                      {isPremium ? getDiscountedPrice(8).toFixed(1) : '8'} MON/hr
                    </span>
                    {isPremium && (
                      <span className="discount-badge">{getPremiumDiscount() * 100}% OFF</span>
                    )}
                  </span>
                  <button 
                    className="btn-rent"
                    onClick={() => handleRentClick({ name: 'AMD EPYC 7742', price: '8 MON/hr', priceValue: 8, specs: '64 Cores • 128 Threads' })}
                  >
                    Rent Now
                  </button>
                </div>
              </div>
            </div>
          </div>
          </>
          )}

          {/* Jobs & Progress Tab */}
          {activeTab === 'jobs' && (
            <div className="content-card">
              <h2>Your Active Jobs & Progress</h2>
              <p className="card-subtitle">Monitor your running GPU tasks and view real-time logs</p>
              
              {activeJobs.length === 0 ? (
                <div className="empty-state">
                  <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
                  </svg>
                  <p>No active jobs yet</p>
                  <p className="empty-hint">Start a GPU rental to see it here</p>
                </div>
              ) : (
                <div className="jobs-list">
                  {activeJobs.map(job => (
                    <div key={job.id} className={`job-card status-${job.status}`}>
                      <div className="job-header">
                        <div className="job-title">
                          <h3>{job.resourceName}</h3>
                          <span className={`job-status-badge ${job.status}`}>
                            {job.status === 'running' ? '🔄 Running' : '✅ Completed'}
                          </span>
                        </div>
                        <div className="job-meta">
                          <span className="job-time">Started: {job.startTime}</span>
                          <span className="job-cost">Cost: {job.cost} MON/hr</span>
                        </div>
                      </div>
                      
                      <div className="job-body">
                        <p className="job-description"><strong>Task:</strong> {job.workDescription}</p>
                        
                        {job.needsAssistance && (
                          <div className="assistance-indicator">
                            👥 Team assistance requested
                          </div>
                        )}
                        
                        {job.hasOutput && (
                          <div className="output-available">
                            <span className="output-badge">📦 Output Ready!</span>
                            <button 
                              className="btn-view-output"
                              onClick={() => handleViewOutput(job)}
                            >
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                              </svg>
                              View Output
                            </button>
                          </div>
                        )}
                        
                        <div className="progress-section">
                          <div className="progress-header">
                            <span>Progress</span>
                            <span className="progress-percent">{job.progress}%</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${job.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="logs-section">
                          <h4>Task Logs (Updates every 5 minutes)</h4>
                          <div className="logs-container">
                            {job.logs.map((log, index) => (
                              <div key={index} className="log-entry">
                                {log}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rent Modal */}
      {showRentModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rent Compute Resource</h2>
              <button className="modal-close" onClick={closeModal}>
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="resource-summary">
                <h3>{selectedResource?.name}</h3>
                <p className="resource-specs">{selectedResource?.specs}</p>
                <p className="resource-price-large">{selectedResource?.price}</p>
              </div>

              <div className="payment-info">
                <div className="balance-display">
                  <span className="balance-label">Your MON Balance:</span>
                  <span className="balance-amount">{monBalance.toFixed(2)} MON</span>
                </div>
                {monBalance < (selectedResource?.priceValue || 0) && (
                  <div className="insufficient-balance-warning">
                    ⚠️ Insufficient balance. Please add MON tokens to your wallet.
                  </div>
                )}
              </div>

              <form onSubmit={handleRentSubmit}>
                <div className="form-group">
                  <label htmlFor="workDescription">
                    Describe the work you need to do <span style={{color: '#9ca3ff', fontSize: '0.85rem'}}>(optional)</span>
                  </label>
                  <textarea
                    id="workDescription"
                    rows="5"
                    value={rentFormData.workDescription}
                    onChange={(e) => setRentFormData({...rentFormData, workDescription: e.target.value})}
                    placeholder="Example: I need to train a CNN model for image classification with 10,000 images..."
                  />
                </div>

                <div className="assistance-option">
                  <div className="assistance-card">
                    <div className="assistance-icon">
                      <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                      </svg>
                    </div>
                    <div className="assistance-content">
                      <h4>Need Technical Assistance?</h4>
                      <p>Our expert team can help you set up and optimize your compute job</p>
                    </div>
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={rentFormData.needAssistance}
                        onChange={(e) => setRentFormData({...rentFormData, needAssistance: e.target.checked})}
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-label">Request team assistance</span>
                    </label>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                    Confirm Rental
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Ad Contact Modal */}
      {showAdModal && (
        <div className="modal-overlay" onClick={closeAdModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Contact Us - Advertisement Request</h2>
              <button className="modal-close" onClick={closeAdModal}>
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleAdSubmit}>
                <div className="form-group">
                  <label htmlFor="messageType">
                    Type of Request
                    <span className="label-required">*</span>
                  </label>
                  <select
                    id="messageType"
                    value={adFormData.messageType}
                    onChange={(e) => setAdFormData({...adFormData, messageType: e.target.value})}
                    required
                  >
                    <option value="advertisement">Advertisement Placement</option>
                    <option value="sponsorship">Sponsorship Opportunity</option>
                    <option value="partnership">Partnership Inquiry</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="contactEmail">
                    Your Email
                    <span className="label-required">*</span>
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    value={adFormData.contactEmail}
                    onChange={(e) => setAdFormData({...adFormData, contactEmail: e.target.value})}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">
                    Message / Advertisement Details
                    <span className="label-required">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows="6"
                    value={adFormData.message}
                    onChange={(e) => setAdFormData({...adFormData, message: e.target.value})}
                    placeholder="Tell us about your advertisement request, target audience, budget, and any other relevant details..."
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={closeAdModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="modal-overlay" onClick={() => setShowSubscriptionModal(false)}>
          <div className="subscription-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSubscriptionModal(false)}>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
            
            <div className="subscription-header">
              <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <h2>Upgrade to Premium</h2>
              <p>Unlock exclusive benefits and save on every GPU rental</p>
            </div>

            <div className="subscription-plans">
              {/* Pro Plan */}
              <div className="plan-card pro-plan">
                <div className="plan-badge">MOST POPULAR</div>
                <h3>Pro</h3>
                <div className="plan-price">
                  <span className="price">50</span>
                  <span className="currency">MON/month</span>
                </div>
                <ul className="plan-features">
                  <li>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span><strong>30% discount</strong> on all GPU rentals</span>
                  </li>
                  <li>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Priority customer support</span>
                  </li>
                  <li>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Faster GPU allocation</span>
                  </li>
                  <li>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Extended compute hours</span>
                  </li>
                  <li>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Premium badge</span>
                  </li>
                </ul>
                <button className="btn-select-plan" onClick={() => handleSubscribe('pro')}>
                  Choose Pro
                </button>
              </div>

              {/* Enterprise Plan */}
              <div className="plan-card enterprise-plan">
                <div className="plan-badge enterprise">BEST VALUE</div>
                <h3>Enterprise</h3>
                <div className="plan-price">
                  <span className="price">150</span>
                  <span className="currency">MON/month</span>
                </div>
                <ul className="plan-features">
                  <li>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span><strong>50% discount</strong> on all GPU rentals</span>
                  </li>
                  <li>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Dedicated account manager</span>
                  </li>
                  <li>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>24/7 priority support</span>
                  </li>
                  <li>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Instant GPU allocation</span>
                  </li>
                  <li>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Unlimited compute hours</span>
                  </li>
                  <li>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Custom integrations</span>
                  </li>
                  <li>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Exclusive Enterprise badge</span>
                  </li>
                </ul>
                <button className="btn-select-plan enterprise" onClick={() => handleSubscribe('enterprise')}>
                  Choose Enterprise
                </button>
              </div>
            </div>

            <div className="subscription-footer">
              <p>💳 Payment processed securely via MON tokens</p>
              <p>✨ Cancel anytime • No hidden fees • Instant activation</p>
            </div>
          </div>
        </div>
      )}

      {/* Output Download Modal */}
      {showOutputModal && selectedOutput && (
        <div className="modal-overlay" onClick={() => setShowOutputModal(false)}>
          <div className="modal-content output-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎉 Your Output is Ready!</h2>
              <button className="modal-close" onClick={() => setShowOutputModal(false)}>
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="output-info">
                <div className="output-icon">
                  <svg width="64" height="64" fill="rgba(102, 126, 234, 0.8)" viewBox="0 0 24 24">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                  </svg>
                </div>
                
                <h3>Task Completed Successfully</h3>
                <p className="output-description">
                  The Neuron Net support team has processed your GPU compute task and uploaded the results.
                </p>
                
                <div className="output-details">
                  <div className="detail-item">
                    <strong>GPU:</strong>
                    <span>{selectedOutput.resourceName}</span>
                  </div>
                  <div className="detail-item">
                    <strong>File Name:</strong>
                    <span>{selectedOutput.outputFileName}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span className="status-completed">✅ Completed</span>
                  </div>
                </div>
                
                <div className="output-note">
                  <svg width="20" height="20" fill="rgba(102, 126, 234, 0.8)" viewBox="0 0 24 24">
                    <path d="M11 15h2v2h-2zm0-8h2v6h-2zm1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                  <p>
                    Your output file is securely stored in our cloud. Click the button below to download it to your device.
                  </p>
                </div>
              </div>
              
              <div className="output-actions">
                <button 
                  className="btn-download-output"
                  onClick={() => handleDownloadOutput(selectedOutput)}
                  disabled={downloadingOutput}
                >
                  {downloadingOutput ? (
                    <>
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="spinning">
                        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                      </svg>
                      Download Output File
                    </>
                  )}
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setShowOutputModal(false)}
                  disabled={downloadingOutput}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
