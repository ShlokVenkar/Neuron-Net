import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null); // 'user', 'seller', or 'team'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    teamName: '',
    teamCode: ''
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
      if (selectedType === 'team') {
        // Team login with code verification
        if (formData.teamCode !== 'abcd') {
          throw new Error('Invalid team access code');
        }
        if (!formData.teamName.trim()) {
          throw new Error('Please enter your name');
        }
        // Store team member info in session storage
        sessionStorage.setItem('teamMember', JSON.stringify({
          name: formData.teamName,
          loginTime: new Date().toISOString()
        }));
        navigate('/dashboard/team');
      } else {
        // Regular user/seller login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) throw error;

        // Get user type from metadata
        const userType = data.user?.user_metadata?.user_type;
        
        // Redirect based on user type and selected login type
        if (selectedType === 'seller' && userType === 'seller') {
          navigate('/dashboard/seller');
        } else if (selectedType === 'user' && (userType === 'user' || userType === 'both')) {
          navigate('/dashboard/user');
        } else if (userType === 'user') {
          navigate('/dashboard/user');
        } else if (userType === 'seller') {
          navigate('/dashboard/seller');
        } else {
          navigate('/dashboard/user');
        }
      }
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
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Log in to your Neuron-Net account</p>

          {error && <div className="auth-error">{error}</div>}

          {!selectedType ? (
            <div className="account-type-selection">
              <p className="selection-label">Choose login type:</p>
              <div className="type-buttons-grid">
                <button 
                  className="type-button-small"
                  onClick={() => setSelectedType('user')}
                >
                  <div className="type-icon-small">
                    <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <h4>Login as User</h4>
                </button>
                
                <button 
                  className="type-button-small"
                  onClick={() => setSelectedType('team')}
                >
                  <div className="type-icon-small team">
                    <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                  </div>
                  <h4>Login as Team</h4>
                </button>
                
                <button 
                  className="type-button-small"
                  onClick={() => setSelectedType('seller')}
                >
                  <div className="type-icon-small seller">
                    <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                    </svg>
                  </div>
                  <h4>Login as Seller</h4>
                </button>
              </div>
            </div>
          ) : selectedType === 'team' ? (
            <form onSubmit={handleSubmit} className="auth-form">
              <button 
                type="button" 
                className="back-button"
                onClick={() => setSelectedType(null)}
              >
                ← Back to login options
              </button>

              <div className="team-login-header">
                <h3>Team Member Access</h3>
                <p>Enter your name and team access code</p>
              </div>

              <div className="form-group">
                <label htmlFor="teamName">Your Name</label>
                <input
                  type="text"
                  id="teamName"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="teamCode">Team Access Code</label>
                <input
                  type="text"
                  id="teamCode"
                  name="teamCode"
                  value={formData.teamCode}
                  onChange={handleChange}
                  placeholder="Enter access code"
                  required
                />
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Accessing...' : 'Access Team Dashboard'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <button 
                type="button" 
                className="back-button"
                onClick={() => setSelectedType(null)}
              >
                ← Back to login options
              </button>

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
                />
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Logging in...' : `Log In as ${selectedType === 'user' ? 'User' : 'Seller'}`}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <p>Don't have an account? <a href="/signup">Sign Up</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
