import React from 'react';
import './About.css';

const About = () => {
  return (
    <section className="about" id="about">
      <div className="container">
        <div className="about-header">
          <h2 className="section-title">About Neuron-Net</h2>
          <p className="section-subtitle">
            Revolutionizing computation through blockchain-powered decentralization
          </p>
        </div>

        <div className="about-content">
          <div className="about-main">
            <div className="about-card">
              <h3>Our Mission</h3>
              <p>
                Neuron-Net is democratizing access to computational power by creating a decentralized marketplace 
                where anyone can contribute their idle computing resources or rent them on-demand. Built on the 
                high-performance Monad blockchain, we're making AI and heavy computation accessible to everyone.
              </p>
            </div>

            <div className="about-card">
              <h3>Why Monad?</h3>
              <p>
                Monad's parallel execution capabilities enable instant hardware handshakes and real-time execution 
                proofs. With trustless streaming micro-payments and unmatched throughput, Monad provides the perfect 
                foundation for our decentralized compute network. No delays, no intermediaries, just pure performance.
              </p>
            </div>
          </div>

          <div className="about-features">
            <div className="feature-item">
              <div className="feature-number">01</div>
              <div className="feature-content">
                <h4>Instant Hardware Handshakes</h4>
                <p>Connect to available compute resources in milliseconds through Monad's high-speed network</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-number">02</div>
              <div className="feature-content">
                <h4>Trustless Micro-Payments</h4>
                <p>Pay only for what you use with streaming payments that settle in real-time</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-number">03</div>
              <div className="feature-content">
                <h4>Real-Time Execution Proof</h4>
                <p>Verify computation results instantly with cryptographic proofs on Monad</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-number">04</div>
              <div className="feature-content">
                <h4>Democratic Access</h4>
                <p>Turn your laptop or GPU into a revenue stream, or rent global compute power affordably</p>
              </div>
            </div>
          </div>

          <div className="about-vision">
            <div className="vision-card">
              <div className="vision-icon">🚀</div>
              <h3>Our Vision</h3>
              <p>
                We envision a world where computational power is as accessible as electricity. No more gatekeepers, 
                no more expensive cloud monopolies. Just a fair, efficient, and truly decentralized compute marketplace 
                that empowers individuals and organizations alike.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
