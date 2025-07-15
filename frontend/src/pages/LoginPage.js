import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Testing bypass function
  const handleTestBypass = () => {
    setLoading(true);
    // Set a mock token
    localStorage.setItem('token', 'test-token-' + Date.now());
    
    // Trigger a page reload to re-check auth status
    window.location.reload();
  };

  return (
    <div className="form-container">
      <h1 style={{ marginBottom: '2rem', color: '#2d3748' }}>Welcome Back</h1>
      <p style={{ marginBottom: '2rem', color: '#718096' }}>
        Sign in to continue your onboarding process
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '1rem' }}
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p style={{ marginTop: '2rem', textAlign: 'center', color: '#718096' }}>
        New client?{' '}
        <Link to="/register" className="link">
          Create an account
        </Link>
      </p>

      {/* Testing bypass button - only show in development or testing */}
      {(process.env.NODE_ENV === 'development' || window.location.hostname.includes('vercel')) && (
        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#a0aec0', marginBottom: '1rem' }}>
            Testing Mode
          </p>
          <button 
            onClick={handleTestBypass}
            className="btn"
            style={{ 
              background: '#f7fafc', 
              color: '#4a5568', 
              border: '1px solid #e2e8f0',
              fontSize: '0.875rem',
              padding: '0.5rem 1rem'
            }}
            disabled={loading}
          >
            Skip Login (Testing)
          </button>
        </div>
      )}
    </div>
  );
}

export default LoginPage;