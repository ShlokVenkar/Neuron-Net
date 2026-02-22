import '../App.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CosmicBackground from '../components/CosmicBackground';
import Hero from '../components/Hero';
import About from '../components/About';
import Contact from '../components/Contact';

const HomePage = () => {
  return (
    <div className="App">
      <CosmicBackground />
      <Header />
      <main className="main-content">
        <Hero />
        
        <section className="features-section" id="features">
          <div className="container">
            <h2 className="section-title">Why Choose Neuron-Net?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Instant Compute Access</h3>
                <p>Connect to a global network of compute resources in milliseconds. No waiting, no setup delays.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <h3>Fair Pricing</h3>
                <p>Pay-as-you-go with streaming micro-payments. Only pay for what you actually use, down to the second.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Trustless Security</h3>
                <p>Cryptographic proofs and blockchain verification ensure your computations are secure and verifiable.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🌐</div>
                <h3>Global Network</h3>
                <p>Access computing power from anywhere in the world, or monetize your idle hardware 24/7.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Active Nodes</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">$2.5M</div>
                <div className="stat-label">Compute Hours Traded</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">&lt;5ms</div>
                <div className="stat-label">Network Latency</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">99.99%</div>
                <div className="stat-label">Uptime</div>
              </div>
            </div>
          </div>
        </section>

        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
