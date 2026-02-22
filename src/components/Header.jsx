import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { connectWallet, disconnectWallet, formatAddress, getConnectedWallet, saveWalletConnection } from '../utils/walletConnect';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    
    // Check if wallet was previously connected
    const { address, connected } = getConnectedWallet();
    if (connected && address) {
      setWalletAddress(address);
      setWalletConnected(true);
    }
  }, []);

  const handleConnectWallet = async () => {
    try {
      const wallet = await connectWallet();
      setWalletAddress(wallet.address);
      setWalletConnected(true);
      saveWalletConnection(wallet.address);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    setWalletAddress(null);
    setWalletConnected(false);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        <div className="logo-section">
          <div className="logo">
            <div className="logo-icon">
              <div className="neuron-core"></div>
              <div className="neuron-pulse"></div>
            </div>
            <div className="logo-content">
              <span className="logo-text">NEURON NET</span>
              <span className="logo-tagline">The Cosmic Compute Engine on Monad</span>
            </div>
          </div>
        </div>
        
        <nav className="nav">
          <a href="#home" className="nav-link">Home</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#technology" className="nav-link">Technology</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#contact" className="nav-link">Contact</a>
        </nav>

        <div className="header-actions">
          {walletConnected ? (
            <div className="wallet-connected">
              <button onClick={handleDisconnectWallet} className="wallet-button connected">
                <span className="wallet-icon">🔗</span>
                <span className="wallet-text">{formatAddress(walletAddress)}</span>
              </button>
            </div>
          ) : (
            <button onClick={handleConnectWallet} className="wallet-button">
              <span className="wallet-icon">👛</span>
              <span className="wallet-text">Connect Wallet</span>
            </button>
          )}
          <Link to="/login" className="login-button">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
