import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import CosmicBackground from './components/CosmicBackground'
import Hero from './components/Hero'

function App() {
  return (
    <div className="App">
      <CosmicBackground />
      <Header />
      <main className="main-content">
        <Hero />
        
        <section className="features-section">
          <div className="container">
            <h2 className="section-title">Advanced Neural Intelligence</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🧠</div>
                <h3>Deep Learning</h3>
                <p>Harness the power of advanced neural networks for intelligent decision-making</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Real-time Processing</h3>
                <p>Lightning-fast computation with optimized neural pathways</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔮</div>
                <h3>Predictive Analytics</h3>
                <p>Anticipate trends and patterns with cutting-edge AI algorithms</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🛡️</div>
                <h3>Secure Architecture</h3>
                <p>Enterprise-grade security for your neural network infrastructure</p>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Accuracy</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">10M+</div>
                <div className="stat-label">Neurons</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">&lt;10ms</div>
                <div className="stat-label">Response Time</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Uptime</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default App
