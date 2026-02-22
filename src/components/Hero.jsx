import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            <span>Next Generation AI</span>
          </div>
          
          <h1 className="hero-title">
            <span className="gradient-text">Neural Intelligence</span>
            <br />
            Redefined
          </h1>
          
          <p className="hero-description">
            Experience the future of artificial intelligence with Neuron Net's cutting-edge neural network technology. 
            Harness the power of billions of interconnected neurons to solve complex problems.
          </p>

          <div className="hero-actions">
            <button className="btn-primary">
              Start Free Trial
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="btn-secondary">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Watch Demo
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-value">10M+</div>
              <div className="stat-label">Active Neurons</div>
            </div>
            <div className="stat">
              <div className="stat-value">99.9%</div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
            <div className="stat">
              <div className="stat-value">&lt;10ms</div>
              <div className="stat-label">Response Time</div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="neural-orb">
            <div className="orb-core"></div>
            <div className="orb-ring ring-1"></div>
            <div className="orb-ring ring-2"></div>
            <div className="orb-ring ring-3"></div>
            <div className="orb-particles"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
