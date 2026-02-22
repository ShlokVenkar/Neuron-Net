import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { generateMonadWallet, encryptWalletKey } from '../utils/monadWallet';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    accountType: 'user', // 'user', 'seller', or 'both'
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
        user_type: formData.accountType, // Can be 'user', 'seller', or 'both'
        wallet_address: walletData.address,
        encrypted_wallet: encryptedWallet,
        mnemonic: walletData.mnemonic
      };

      // Add company field if seller or both
      if (formData.accountType === 'seller' || formData.accountType === 'both') {
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

            <div className="form-group">
              <label htmlFor="accountType">Account Type</label>
              <select
                id="accountType"
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                required
              >
                <option value="user">User - Rent Compute Power</option>
                <option value="seller">Seller - Provide Compute Resources</option>
                <option value="both">Both - Rent & Provide</option>
              </select>
            </div>

            {(formData.accountType === 'seller' || formData.accountType === 'both') && (
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
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <a href="/login">Log In</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
