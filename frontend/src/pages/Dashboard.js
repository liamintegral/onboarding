import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import WebsiteAnalysis from '../components/WebsiteAnalysis';

function Dashboard() {
  const { user, logout } = useAuth();
  const [platforms, setPlatforms] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/platforms/types', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlatforms(data.platformTypes || {});
      } else {
        setError('Failed to load platforms');
      }
    } catch (error) {
      setError('Failed to load platforms');
      console.error('Platform fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleSetupComplete = (results) => {
    console.log('Setup completed:', results);
    setShowWizard(false);
    // Refresh platforms to show updated status
    fetchPlatforms();
  };

  const handleSetupClose = () => {
    setShowWizard(false);
  };

  if (loading) {
    return <div className="loading">Loading your dashboard...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              Welcome, {user?.contactName}!
            </h1>
            <p style={{ opacity: 0.9 }}>
              {user?.companyName} - Onboarding Dashboard
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        {error && (
          <div style={{ 
            background: '#fed7d7', 
            color: '#c53030', 
            padding: '1rem', 
            borderRadius: '6px', 
            marginBottom: '2rem' 
          }}>
            {error}
          </div>
        )}

        {/* Progress Overview */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 5px 20px rgba(0, 0, 0, 0.08)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, color: '#2d3748' }}>Onboarding Progress</h2>
            <button
              onClick={() => setShowWizard(true)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Start Guided Setup
            </button>
          </div>
          <p style={{ color: '#718096', marginBottom: '2rem' }}>
            Connect your marketing platforms to get started with our services. Use our guided wizard for step-by-step assistance.
          </p>

          {/* Platform Categories */}
          {Object.keys(platforms).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
              <h3>Setting up your platforms...</h3>
              <p>We're preparing your platform connections. This may take a moment.</p>
            </div>
          ) : (
            Object.entries(platforms).map(([category, platformList]) => (
              <div key={category} style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  color: '#4a5568', 
                  marginBottom: '1rem', 
                  textTransform: 'capitalize',
                  fontSize: '1.25rem'
                }}>
                  {category === 'google' ? 'Google Services' : 
                   category === 'meta' ? 'Meta (Facebook/Instagram)' : 
                   category.charAt(0).toUpperCase() + category.slice(1)}
                </h3>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: '1rem' 
                }}>
                  {platformList.map((platform) => (
                    <div key={platform.id} style={{
                      background: '#f7fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      transition: 'transform 0.2s ease'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ color: '#2d3748', margin: 0 }}>{platform.platformDisplayName}</h4>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          background: platform.status === 'completed' ? '#c6f6d5' : 
                                     platform.status === 'in_progress' ? '#fef5e7' : '#fed7d7',
                          color: platform.status === 'completed' ? '#22543d' : 
                                 platform.status === 'in_progress' ? '#b7791f' : '#c53030'
                        }}>
                          {platform.status === 'completed' ? 'Connected' : 
                           platform.status === 'in_progress' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                      
                      <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        {platform.platformDescription}
                      </p>
                      
                      <div style={{ 
                        background: '#e2e8f0', 
                        borderRadius: '10px', 
                        height: '8px', 
                        marginBottom: '1rem' 
                      }}>
                        <div style={{
                          background: platform.status === 'completed' ? '#38a169' : '#667eea',
                          width: `${platform.progressPercentage}%`,
                          height: '100%',
                          borderRadius: '10px',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      
                      <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                        Progress: {platform.progressPercentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Next Steps */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 5px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#2d3748' }}>Next Steps</h2>
          <ol style={{ paddingLeft: '2rem', color: '#718096' }}>
            <li style={{ marginBottom: '0.5rem' }}>Click "Start Guided Setup" to begin the step-by-step process</li>
            <li style={{ marginBottom: '0.5rem' }}>Provide access credentials for each platform when prompted</li>
            <li style={{ marginBottom: '0.5rem' }}>Our system will validate each connection automatically</li>
            <li>Schedule a kickoff call once all platforms are connected</li>
          </ol>
        </div>
      </div>

      {/* Website Analysis & Setup Modal */}
      {showWizard && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: '#f8fafc',
            borderRadius: '15px',
            padding: '2rem',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={handleSetupClose}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#a0aec0',
                zIndex: 1001
              }}
            >
              ✕
            </button>
            <WebsiteAnalysis
              onComplete={handleSetupComplete}
              onNext={() => {}} // No-op since we don't want old wizard behavior
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;