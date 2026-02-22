import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { connectWallet, formatAddress, getConnectedWallet } from '../utils/walletConnect';
import './Dashboard.css';
import './Settings.css';

const UserSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    bio: ''
  });

  // Billing/Rental history
  const [rentalHistory, setRentalHistory] = useState([
    {
      id: 1,
      resourceName: 'NVIDIA RTX 4090',
      cost: 12,
      hours: 3.5,
      date: '2024-02-20',
      status: 'completed',
      assistanceUsed: false
    },
    {
      id: 2,
      resourceName: 'NVIDIA A100',
      cost: 28,
      hours: 2,
      date: '2024-02-21',
      status: 'in-progress',
      assistanceUsed: true
    }
  ]);

  useEffect(() => {
    checkUser();
    const { address, connected } = getConnectedWallet();
    if (connected && address) {
      setWalletAddress(address);
      setWalletConnected(true);
    }
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
    } else {
      setUser(user);
      setProfileData({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
        bio: user.user_metadata?.bio || ''
      });
    }
    setLoading(false);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName,
          bio: profileData.bio
        }
      });
      
      if (error) throw error;
      alert('✅ Profile updated successfully!');
    } catch (error) {
      alert('❌ Error updating profile: ' + error.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      alert('❌ Passwords do not match!');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      alert('✅ Password updated successfully!');
      e.target.reset();
    } catch (error) {
      alert('❌ Error updating password: ' + error.message);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const wallet = await connectWallet();
      setWalletAddress(wallet.address);
      setWalletConnected(true);
      alert('✅ Wallet connected successfully!');
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">
          <h2>NEURON NET</h2>
          <span className="dashboard-role">Settings</span>
        </div>
        <nav className="dashboard-nav">
          <a 
            href="#profile" 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            Profile
          </a>
          <a 
            href="#security" 
            className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('security'); }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/>
            </svg>
            Security
          </a>
          <a 
            href="#wallet" 
            className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('wallet'); }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
            Wallet
          </a>
          <a 
            href="#billing" 
            className={`nav-item ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('billing'); }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z"/>
            </svg>
            Billing & History
          </a>
        </nav>
        <button onClick={() => navigate('/dashboard/user')} className="logout-btn">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Dashboard
        </button>
      </div>

      <div className="dashboard-main settings-main">
        <div className="dashboard-header">
          <div>
            <h1>Account Settings</h1>
            <p>Manage your profile, security, and preferences</p>
          </div>
          <div className="user-profile">
            <div className="user-avatar">
              {user?.user_metadata?.full_name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>

        <div className="settings-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-card">
              <h2>Profile Information</h2>
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="input-disabled"
                  />
                  <p className="field-note">Email cannot be changed. Contact support if needed.</p>
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    rows="4"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <button type="submit" className="btn-submit">
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="settings-card">
              <h2>Change Password</h2>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    placeholder="Enter new password"
                    required
                    minLength="6"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    required
                    minLength="6"
                  />
                </div>

                <button type="submit" className="btn-submit">
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div className="settings-card">
              <h2>Wallet Connection</h2>
              {walletConnected ? (
                <div className="wallet-connected-info">
                  <div className="wallet-status connected">
                    <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <h3>Wallet Connected</h3>
                  </div>
                  <div className="wallet-address-display">
                    <label>Connected Address:</label>
                    <code>{formatAddress(walletAddress)}</code>
                    <p className="full-address">{walletAddress}</p>
                  </div>
                  <p className="wallet-note">
                    🔗 Your MetaMask wallet is connected and ready for transactions.
                  </p>
                </div>
              ) : (
                <div className="wallet-disconnected-info">
                  <div className="wallet-status disconnected">
                    <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    </svg>
                    <h3>No Wallet Connected</h3>
                  </div>
                  <p className="wallet-note">
                    👛 Connect your MetaMask wallet to make payments and receive MON tokens.
                  </p>
                  <button onClick={handleConnectWallet} className="btn-connect-wallet">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    </svg>
                    Connect MetaMask
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="settings-card">
              <h2>Rental History & Team Assistance</h2>
              <div className="billing-overview">
                <div className="stat-box">
                  <h4>Total Spent</h4>
                  <p className="stat-number">{rentalHistory.reduce((sum, r) => sum + (r.cost * r.hours), 0).toFixed(2)} MON</p>
                </div>
                <div className="stat-box">
                  <h4>Total Hours</h4>
                  <p className="stat-number">{rentalHistory.reduce((sum, r) => sum + r.hours, 0)} hrs</p>
                </div>
                <div className="stat-box">
                  <h4>Team Assistance Used</h4>
                  <p className="stat-number">{rentalHistory.filter(r => r.assistanceUsed).length}</p>
                </div>
              </div>

              <h3>Rental History</h3>
              <div className="rental-history-list">
                {rentalHistory.map(rental => (
                  <div key={rental.id} className="rental-item">
                    <div className="rental-info">
                      <h4>{rental.resourceName}</h4>
                      <p className="rental-details">
                        {rental.hours} hours × {rental.cost} MON/hr = {(rental.hours * rental.cost).toFixed(2)} MON
                      </p>
                      <span className="rental-date">{rental.date}</span>
                    </div>
                    <div className="rental-status">
                      <span className={`status-badge ${rental.status}`}>
                        {rental.status}
                      </span>
                      {rental.assistanceUsed && (
                        <span className="assistance-badge">
                          👥 Team Assisted
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
