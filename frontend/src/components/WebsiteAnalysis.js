import React, { useState } from 'react';
import WordPressSetup from './WordPressSetup';
import GoogleMyBusinessSetup from './GoogleMyBusinessSetup';
import GoogleTagManagerSetup from './GoogleTagManagerSetup';
import GoogleSearchConsoleSetup from './GoogleSearchConsoleSetup';
import GoogleAnalyticsSetup from './GoogleAnalyticsSetup';
import GoogleAdsSetup from './GoogleAdsSetup';

function WebsiteAnalysis({ onComplete, onNext }) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWordPressSetup, setShowWordPressSetup] = useState(false);
  const [showGoogleMyBusinessSetup, setShowGoogleMyBusinessSetup] = useState(false);
  const [showGoogleTagManagerSetup, setShowGoogleTagManagerSetup] = useState(false);
  const [showGoogleSearchConsoleSetup, setShowGoogleSearchConsoleSetup] = useState(false);
  const [showGoogleAnalyticsSetup, setShowGoogleAnalyticsSetup] = useState(false);
  const [showGoogleAdsSetup, setShowGoogleAdsSetup] = useState(false);

  const handleAnalyze = async () => {
    if (!websiteUrl.trim()) {
      setError('Please enter your website URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: websiteUrl.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setAnalysis(data.website);
        // Automatically show platform-specific setup flows based on detection
        if (data.website.cms?.name === 'WordPress') {
          setShowWordPressSetup(true);
        } else if (data.website.technologies?.some(tech => 
          tech.name?.toLowerCase().includes('google') || 
          tech.name?.toLowerCase().includes('analytics') ||
          tech.name?.toLowerCase().includes('tag manager')
        )) {
          // Show Google services setup
          setShowGoogleMyBusinessSetup(true);
        }
      } else {
        setError(data.error || 'Failed to analyze website');
      }
    } catch (err) {
      setError('Failed to analyze website. Please check the URL and try again.');
      console.error('Website analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    onComplete(analysis);
    onNext();
  };

  const handleWordPressSetupComplete = (wordpressData) => {
    const completedAnalysis = {
      ...analysis,
      wordpressSetup: wordpressData
    };
    onComplete(completedAnalysis);
    // Don't call onNext() - let OnboardingWizard handle completion detection
  };

  const handleGoogleMyBusinessSetupComplete = (data) => {
    setShowGoogleMyBusinessSetup(false);
    setShowGoogleTagManagerSetup(true);
  };

  const handleGoogleTagManagerSetupComplete = (data) => {
    setShowGoogleTagManagerSetup(false);
    setShowGoogleSearchConsoleSetup(true);
  };

  const handleGoogleSearchConsoleSetupComplete = (data) => {
    setShowGoogleSearchConsoleSetup(false);
    setShowGoogleAnalyticsSetup(true);
  };

  const handleGoogleAnalyticsSetupComplete = (data) => {
    setShowGoogleAnalyticsSetup(false);
    setShowGoogleAdsSetup(true);
  };

  const handleGoogleAdsSetupComplete = (data) => {
    const completedAnalysis = {
      ...analysis,
      googleSetup: {
        myBusiness: data.myBusiness || {},
        tagManager: data.tagManager || {},
        searchConsole: data.searchConsole || {},
        analytics: data.analytics || {},
        ads: data
      }
    };
    onComplete(completedAnalysis);
    // Don't call onNext() - let OnboardingWizard handle completion detection
  };

  const getCMSInstructions = (cms) => {
    const instructions = {
      'WordPress': {
        title: 'WordPress Access Required',
        icon: '🔧',
        steps: [
          'Log in to your WordPress admin dashboard',
          'Go to Users → Add New',
          'Create a new user with Administrator role',
          'Use email: integralmediaau@gmail.com',
          'Send us the login credentials via secure method'
        ],
        alternative: 'Or provide us with your hosting panel (cPanel) access',
        difficulty: 'Easy'
      },
      'Shopify': {
        title: 'Shopify Store Access',
        icon: '🛍️',
        steps: [
          'Go to your Shopify admin → Settings → Account and permissions',
          'Click "Give access to a user"',
          'Enter email: integralmediaau@gmail.com',
          'Select appropriate permissions (Staff account)',
          'Send invitation'
        ],
        alternative: 'We can also connect via Shopify Partners if you prefer',
        difficulty: 'Easy'
      },
      'Wix': {
        title: 'Wix Site Access',
        icon: '🎨',
        steps: [
          'Go to your Wix dashboard',
          'Click on your site → Roles & Permissions',
          'Click "Invite People"',
          'Enter email: integralmediaau@gmail.com',
          'Assign Admin or Contributor role',
          'Send invitation'
        ],
        alternative: 'Some Wix plans may require upgrading for collaborator access',
        difficulty: 'Medium'
      },
      'Squarespace': {
        title: 'Squarespace Access',
        icon: '⬜',
        steps: [
          'Go to Settings → Permissions',
          'Click "Invite Contributor"',
          'Enter email: integralmediaau@gmail.com',
          'Choose permission level (Admin recommended)',
          'Send invitation'
        ],
        alternative: 'Verify your plan supports multiple contributors',
        difficulty: 'Easy'
      },
      'Webflow': {
        title: 'Webflow Project Access',
        icon: '🌊',
        steps: [
          'Go to your Webflow Dashboard',
          'Open your project → Project Settings → Collaborators',
          'Click "Invite Collaborator"',
          'Enter email: integralmediaau@gmail.com',
          'Assign Designer or Admin role'
        ],
        alternative: 'We may need access to hosting settings as well',
        difficulty: 'Easy'
      }
    };

    return instructions[cms] || {
      title: 'Custom Platform Access',
      icon: '🔧',
      steps: [
        'This appears to be a custom or unrecognized platform',
        'We\'ll need to discuss access requirements directly',
        'Please prepare any existing admin credentials',
        'Have hosting/domain information ready'
      ],
      alternative: 'Our team will provide specific guidance for your platform',
      difficulty: 'Requires Discussion'
    };
  };


  // Show appropriate setup flow based on platform detection
  if (showWordPressSetup) {
    return (
      <WordPressSetup
        websiteUrl={websiteUrl}
        onComplete={handleWordPressSetupComplete}
        onBack={() => setShowWordPressSetup(false)}
        onCancel={() => setShowWordPressSetup(false)}
      />
    );
  }

  if (showGoogleMyBusinessSetup) {
    return (
      <GoogleMyBusinessSetup
        businessInfo={{ businessName: '', businessAddress: '' }}
        onComplete={handleGoogleMyBusinessSetupComplete}
        onBack={() => setShowGoogleMyBusinessSetup(false)}
        onCancel={() => setShowGoogleMyBusinessSetup(false)}
      />
    );
  }

  if (showGoogleTagManagerSetup) {
    return (
      <GoogleTagManagerSetup
        websiteUrl={websiteUrl}
        onComplete={handleGoogleTagManagerSetupComplete}
        onBack={() => {
          setShowGoogleTagManagerSetup(false);
          setShowGoogleMyBusinessSetup(true);
        }}
        onCancel={() => {
          setShowGoogleTagManagerSetup(false);
          setShowGoogleMyBusinessSetup(false);
        }}
      />
    );
  }

  if (showGoogleSearchConsoleSetup) {
    return (
      <GoogleSearchConsoleSetup
        websiteUrl={websiteUrl}
        onComplete={handleGoogleSearchConsoleSetupComplete}
        onBack={() => {
          setShowGoogleSearchConsoleSetup(false);
          setShowGoogleTagManagerSetup(true);
        }}
        onCancel={() => {
          setShowGoogleSearchConsoleSetup(false);
          setShowGoogleMyBusinessSetup(false);
          setShowGoogleTagManagerSetup(false);
        }}
      />
    );
  }

  if (showGoogleAnalyticsSetup) {
    return (
      <GoogleAnalyticsSetup
        websiteUrl={websiteUrl}
        onComplete={handleGoogleAnalyticsSetupComplete}
        onBack={() => {
          setShowGoogleAnalyticsSetup(false);
          setShowGoogleSearchConsoleSetup(true);
        }}
        onCancel={() => {
          setShowGoogleAnalyticsSetup(false);
          setShowGoogleMyBusinessSetup(false);
          setShowGoogleTagManagerSetup(false);
          setShowGoogleSearchConsoleSetup(false);
        }}
      />
    );
  }

  if (showGoogleAdsSetup) {
    return (
      <GoogleAdsSetup
        businessInfo={{ businessName: '', businessAddress: '' }}
        onComplete={handleGoogleAdsSetupComplete}
        onBack={() => {
          setShowGoogleAdsSetup(false);
          setShowGoogleAnalyticsSetup(true);
        }}
        onCancel={() => {
          setShowGoogleAdsSetup(false);
          setShowGoogleMyBusinessSetup(false);
          setShowGoogleTagManagerSetup(false);
          setShowGoogleSearchConsoleSetup(false);
          setShowGoogleAnalyticsSetup(false);
        }}
      />
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '10px',
      padding: '2rem',
      boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
      maxWidth: '700px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: '#2d3748', marginBottom: '0.5rem' }}>
          🌐 Website Analysis
        </h2>
        <p style={{ color: '#718096', lineHeight: '1.6' }}>
          Let's start by analyzing your website to determine the best way to connect with your digital platforms.
        </p>
      </div>

      {/* URL Input */}
      {!analysis && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#2d3748'
            }}>
              Your Website URL <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            />
          </div>

          {error && (
            <div style={{
              background: '#fed7d7',
              color: '#c53030',
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem'
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !websiteUrl.trim()}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            {loading ? 'Analyzing Website...' : 'Analyze Website'}
          </button>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div>
          {/* Detection Results */}
          <div style={{
            background: '#f7fafc',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
              🔍 Analysis Results
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <strong>Platform:</strong> {analysis.cms?.name || 'Unknown'}
                {analysis.cms?.confidence > 0 && (
                  <span style={{ 
                    marginLeft: '0.5rem', 
                    fontSize: '0.875rem', 
                    color: analysis.cms.confidence > 0.7 ? '#22c55e' : '#f59e0b' 
                  }}>
                    ({Math.round(analysis.cms.confidence * 100)}% confident)
                  </span>
                )}
              </div>
              <div>
                <strong>Hosting:</strong> {analysis.hosting?.name || 'Unknown'}
              </div>
            </div>

            {analysis.cms?.version && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Version:</strong> {analysis.cms.version}
              </div>
            )}

            {analysis.technologies?.length > 0 && (
              <div>
                <strong>Detected Technologies:</strong>{' '}
                {analysis.technologies.map(tech => tech.name).join(', ')}
              </div>
            )}
          </div>

          {/* Access Instructions */}
          {analysis.cms?.name !== 'unknown' && (
            <div style={{
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              {(() => {
                const instructions = getCMSInstructions(analysis.cms.name);
                return (
                  <div>
                    {/* Header */}
                    <div style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '1rem',
                      borderRadius: '6px 6px 0 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{instructions.icon}</span>
                        <h3 style={{ margin: 0 }}>{instructions.title}</h3>
                      </div>
                      <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.875rem'
                      }}>
                        {instructions.difficulty}
                      </div>
                    </div>

                    {/* Steps */}
                    <div style={{ padding: '1.5rem' }}>
                      <h4 style={{ marginBottom: '1rem', color: '#2d3748' }}>
                        Step-by-step Instructions:
                      </h4>
                      <ol style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        {instructions.steps.map((step, index) => (
                          <li key={index} style={{ 
                            marginBottom: '0.5rem', 
                            color: '#4a5568',
                            lineHeight: '1.5'
                          }}>
                            {step}
                          </li>
                        ))}
                      </ol>

                      <div style={{
                        background: '#e6fffa',
                        border: '1px solid #81e6d9',
                        padding: '1rem',
                        borderRadius: '6px',
                        color: '#234e52'
                      }}>
                        <strong>💡 Alternative:</strong> {instructions.alternative}
                      </div>
                      
                      <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: '#e0e7ff',
                        border: '1px solid #6366f1',
                        borderRadius: '6px',
                        color: '#3730a3'
                      }}>
                        <strong>🎯 Next Step:</strong> After clicking "Continue Setup", you'll see a detailed form with visual examples to create the admin user and provide the login credentials.
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations?.length > 0 && (
            <div style={{
              background: '#fef5e7',
              border: '1px solid #f6ad55',
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '2rem'
            }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#b7791f' }}>
                📋 Additional Recommendations:
              </h4>
              <ul style={{ paddingLeft: '1.5rem', margin: 0, color: '#744210' }}>
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem' }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Assistant Notice */}
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #0ea5e9',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🤖</span>
            <div>
              <strong>Need Help?</strong> Look for the AI assistant chat button in the bottom-right corner. 
              I can answer questions about {analysis.cms?.name || 'your platform'} setup and guide you through each step!
            </div>
          </div>

          {/* Quick Setup Options */}
          <div style={{
            background: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h4 style={{ 
              margin: '0 0 1rem 0', 
              color: '#2d3748',
              textAlign: 'center'
            }}>
              🚀 Quick Setup Options
            </h4>
            <p style={{
              margin: '0 0 1.5rem 0',
              color: '#718096',
              textAlign: 'center',
              fontSize: '0.9rem'
            }}>
              Skip to platform-specific setup flows:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <button
                onClick={() => setShowGoogleMyBusinessSetup(true)}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.9rem'
                }}
              >
                🏢 Google Properties
              </button>
              {analysis.cms?.name === 'WordPress' && (
                <button
                  onClick={() => setShowWordPressSetup(true)}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(135deg, #21759b 0%, #0073aa 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '0.9rem'
                  }}
                >
                  🔧 WordPress Setup
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <button
              onClick={() => {
                setAnalysis(null);
                setWebsiteUrl('');
                setError('');
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#f7fafc',
                color: '#4a5568',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Analyze Different URL
            </button>

            <button
              onClick={handleContinue}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Continue Setup →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WebsiteAnalysis;