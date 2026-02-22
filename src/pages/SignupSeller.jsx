import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { generateMonadWallet, encryptWalletKey } from '../utils/monadWallet';
import './Auth.css';

const SignupSeller = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    company: ''
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

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            company: formData.company,
            user_type: 'seller',
            wallet_address: walletData.address,
            encrypted_wallet: encryptedWallet,
            mnemonic: walletData.mnemonic
          }
        }
      });

      if (error) throw error;

      alert(`✅ Account created!

🔐 Your Monad Wallet:
${walletData.address}

⚠️ IMPORTANT: Save your recovery phrase:
"${walletData.mnemonic}"

Check your email for confirmation link.`);
      navigate('/login-seller');
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
          <h2 className="auth-title">Sign Up as Seller</h2>
          <p className="auth-subtitle">Monetize your idle computing power</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
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
              <label htmlFor="company">Company (Optional)</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your Company"
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

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <a href="/login-seller">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupSeller;
