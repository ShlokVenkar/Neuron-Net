import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <div className="login-dropdown">
            <button 
              className="login-button"
              onClick={() => setShowLoginDropdown(!showLoginDropdown)}
            >
              Login
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            {showLoginDropdown && (
              <div className="dropdown-menu">
                <Link to="/login-user" className="dropdown-item">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  Log in as User
                </Link>
                <Link to="/login-seller" className="dropdown-item">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                  </svg>
                  Log in as Seller
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
