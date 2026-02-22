import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

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
        <div className="logo">
          <div className="logo-icon">
            <div className="neuron-core"></div>
            <div className="neuron-pulse"></div>
          </div>
          <span className="logo-text">NEURON NET</span>
        </div>
        
        <nav className="nav">
          <a href="#home" className="nav-link">Home</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#technology" className="nav-link">Technology</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#contact" className="nav-link">Contact</a>
        </nav>

        <button className="cta-button">Get Started</button>
      </div>
    </header>
  );
};

export default Header;
