import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState('');
  const fullText = 'NEURON NET';
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => setShowCursor(false), 1000);
      }
    }, 150);

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <section className="hero">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            <span>Powered by Monad Blockchain</span>
          </div>
          
          <h1 className="hero-title">
            <span className="logo-typing">
              {displayText}
              <span className={`cursor ${showCursor ? 'visible' : ''}`}>|</span>
            </span>
          </h1>

          <h2 className="hero-subtitle-main">
            <span className="gradient-text animate-text">Decentralized Compute Power</span>
          </h2>
          
          <p className="hero-tagline">
            Transform idle GPUs into revenue. Access global compute instantly.
          </p>

          <p className="hero-description">
            Fair, fast, and fully decentralized computation powered by Monad's parallel execution.
          </p>

          <div className="hero-actions">
            <button className="btn-primary btn-user" onClick={() => navigate('/signup-user')}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              Sign Up as User
            </button>
            <button className="btn-primary btn-seller" onClick={() => navigate('/signup-seller')}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
              </svg>
              Sign Up as Seller
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-value">10K+</div>
              <div className="stat-label">Active Nodes</div>
            </div>
            <div className="stat">
              <div className="stat-value">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
            <div className="stat">
              <div className="stat-value">&lt;5ms</div>
              <div className="stat-label">Latency</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
