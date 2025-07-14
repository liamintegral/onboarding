import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function RegisterPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    goals: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="form-container" style={{ maxWidth: '500px' }}>
      <h1 style={{ marginBottom: '1rem', color: '#2d3748' }}>Get Started</h1>
      <p style={{ marginBottom: '2rem', color: '#718096' }}>
        Create your account to begin the onboarding process
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="companyName">Company Name *</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            placeholder="Your company name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="contactName">Contact Name *</label>
          <input
            type="text"
            id="contactName"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            required
            placeholder="Your full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="your@email.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="form-group">
          <label htmlFor="website">Website URL</label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://yourwebsite.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="industry">Industry</label>
          <select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              border: '2px solid #e2e8f0', 
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          >
            <option value="">Select your industry</option>
            <option value="ecommerce">E-commerce</option>
            <option value="saas">Software/SaaS</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="realestate">Real Estate</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="goals">Marketing Goals</label>
          <textarea
            id="goals"
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            rows="3"
            placeholder="Tell us about your marketing objectives..."
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              border: '2px solid #e2e8f0', 
              borderRadius: '6px',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '1rem' }}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p style={{ marginTop: '2rem', textAlign: 'center', color: '#718096' }}>
        Already have an account?{' '}
        <Link to="/login" className="link">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;