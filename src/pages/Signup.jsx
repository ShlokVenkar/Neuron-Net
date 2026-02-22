import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { generateMonadWallet, encryptWalletKey } from '../utils/monadWallet';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null); // 'user' or 'seller'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    company: '' // Only for sellers
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Generate Monad wallet
      const walletData = generateMonadWallet();
      if (!walletData.success) {
        throw new Error('Failed to generate wallet');
      }

      // Encrypt the private key with user's password
      const encryptedWallet = await encryptWalletKey(walletData.privateKey, formData.password);

      const metadata = {
        full_name: formData.fullName,
        user_type: selectedType,
        wallet_address: walletData.address,
        encrypted_wallet: encryptedWallet,
        mnemonic: walletData.mnemonic
      };

      // Add company field if seller
      if (selectedType === 'seller') {
        metadata.company = formData.company;
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;

      alert(`✅ Account created successfully!\n\n🔐 Your Monad Wallet Address:\n${walletData.address}\n\n⚠️ IMPORTANT: Save your recovery phrase:\n"${walletData.mnemonic}"\n\nKeep this safe! You'll need it to recover your wallet.\n\nCheck your email for confirmation link.`);
      navigate('/login');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Create Your Account</h2>
          <p className="auth-subtitle">Join Neuron-Net on Monad Blockchain</p>

          {error && <div className="auth-error">{error}</div>}

          {!selectedType ? (
            <div className="account-type-selection">
              <p className="selection-label">Choose your account type:</p>
              <div className="type-buttons">
                <button 
                  className="type-button"
                  onClick={() => setSelectedType('user')}
                >
                  <div className="type-icon">
                    <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <h3>Sign up as User</h3>
                  <p>Rent compute power for your projects</p>
                </button>
                
                <button 
                  className="type-button"
                  onClick={() => setSelectedType('seller')}
                >
                  <div className="type-icon">
                    <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                    </svg>
                  </div>
                  <h3>Sign up as Seller</h3>
                  <p>Provide compute resources and earn</p>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <button 
                type="button" 
                className="back-button"
                onClick={() => setSelectedType(null)}
              >
                ← Back to account type selection
              </button>

              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength="6"
                />
              </div>

              {selectedType === 'seller' && (
                <div className="form-group">
                  <label htmlFor="company">Company Name (Optional)</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your Company"
                  />
                </div>
              )}

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Creating Account...' : `Sign Up as ${selectedType === 'user' ? 'User' : 'Seller'}`}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <p>Already have an account? <a href="/login">Log In</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
