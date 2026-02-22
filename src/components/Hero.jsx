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
            <button className="btn-primary" onClick={() => navigate('/signup')}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Get Started
            </button>
            <button className="btn-primary btn-secondary" onClick={() => navigate('/login')}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
              </svg>
              Login
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
