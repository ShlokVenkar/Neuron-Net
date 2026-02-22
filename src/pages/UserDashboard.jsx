import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRentModal, setShowRentModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [rentFormData, setRentFormData] = useState({
    workDescription: '',
    needAssistance: false
  });
  const [monBalance, setMonBalance] = useState(150.75); // Mock balance, would fetch from blockchain
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    checkUser();
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

  const canSwitchToSeller = () => {
    return user?.user_metadata?.user_type === 'both' || user?.user_metadata?.user_type === 'seller';
  };

  const handleRentClick = (resource) => {
    setSelectedResource(resource);
    setShowRentModal(true);
  };

  const handleRentSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user has sufficient MON balance
    const resourcePrice = selectedResource.priceValue;
    if (monBalance < resourcePrice) {
      alert(`❌ Insufficient MON tokens!\n\nRequired: ${resourcePrice} MON\nYour balance: ${monBalance} MON\n\nPlease add MON tokens to your wallet.`);
      return;
    }
    
    // Simulate payment transaction
    const newBalance = monBalance - resourcePrice;
    setMonBalance(newBalance);
    
    if (rentFormData.needAssistance) {
      // In a real app, this would submit to a database and blockchain
      alert(`✅ Payment successful! Rent request submitted!\n\nResource: ${selectedResource.name}\nCost: ${resourcePrice} MON\nNew Balance: ${newBalance.toFixed(2)} MON\n\nWork: ${rentFormData.workDescription}\n\n📞 Our technical team will contact you shortly to assist with your setup!`);
    } else {
      alert(`✅ Payment successful! Rent request submitted!\n\nResource: ${selectedResource.name}\nCost: ${resourcePrice} MON\nNew Balance: ${newBalance.toFixed(2)} MON\n\nWork: ${rentFormData.workDescription}\n\nYou will receive setup instructions via email.`);
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

  const copyWalletAddress = async () => {
    const walletAddress = user?.user_metadata?.wallet_address;
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        alert('Failed to copy address');
      }
    }
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
          <a href="#overview" className="nav-item active">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            Overview
          </a>
          <a href="#compute" className="nav-item">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
            </svg>
            Browse Compute
          </a>
          <a href="#jobs" className="nav-item">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            My Jobs
          </a>
          <a href="#billing" className="nav-item">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
            Billing
          </a>
          <a href="#settings" className="nav-item">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
            </svg>
            Settings
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

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon purple">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Active Jobs</h3>
              <p className="stat-value">0</p>
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
              <p className="stat-value">0h</p>
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

        {/* Wallet Info Card */}
        <div className="wallet-card">
          <div className="wallet-header">
            <div className="wallet-icon">
              <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
            <div className="wallet-info">
              <h3>Your Monad Wallet</h3>
              <p className="wallet-balance">{monBalance.toFixed(2)} MON</p>
            </div>
          </div>
          <div className="wallet-address-container">
            <div className="wallet-address">
              <span className="address-label">Address:</span>
              <span className="address-text">{user?.user_metadata?.wallet_address?.slice(0, 6)}...{user?.user_metadata?.wallet_address?.slice(-4)}</span>
            </div>
            <button className="btn-copy" onClick={copyWalletAddress} title="Copy wallet address">
              {copySuccess ? (
                <>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                  </svg>
                  Copy Address
                </>
              )}
            </button>
          </div>
          <p className="wallet-note">💡 Send MON tokens to this address to add funds. <a href="https://faucet.monad.xyz" target="_blank" rel="noopener noreferrer">Get testnet tokens</a></p>
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
            <button className="btn-ad-contact">Contact Us</button>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="content-card">
            <h2>Available Compute Resources</h2>
            <p className="card-subtitle">Browse and rent compute power from our global network</p>
            <div className="resource-list">
              <div className="resource-item">
                <div className="resource-info">
                  <h4>NVIDIA RTX 4090</h4>
                  <p>24GB VRAM • 16,384 CUDA Cores • Best for Gaming & Light AI</p>
                </div>
                <div className="resource-price">
                  <span className="price">12 MON/hr</span>
                  <button 
                    className="btn-rent" 
                    onClick={() => handleRentClick({ name: 'NVIDIA RTX 4090', price: '12 MON/hr', priceValue: 12, specs: '24GB VRAM • 16,384 CUDA Cores' })}
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
                  <span className="price">28 MON/hr</span>
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
                  <span className="price">55 MON/hr</span>
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
                  <span className="price">8 MON/hr</span>
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
                    Describe the work you need to do
                    <span className="label-required">*</span>
                  </label>
                  <textarea
                    id="workDescription"
                    rows="5"
                    value={rentFormData.workDescription}
                    onChange={(e) => setRentFormData({...rentFormData, workDescription: e.target.value})}
                    placeholder="Example: I need to train a CNN model for image classification with 10,000 images..."
                    required
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
    </div>
  );
};

export default UserDashboard;
