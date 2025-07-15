import React, { useState } from 'react';

function GoogleSearchConsoleSetup({ websiteUrl, onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    websiteUrl: websiteUrl || '',
    propertyType: 'url',
    isVerified: false,
    confirmed: false
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleComplete = () => {
    onComplete(formData);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.websiteUrl;
      case 2:
        return true; // Just viewing the example
      case 3:
        return formData.confirmed;
      default:
        return false;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '600px',
        width: '100%',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
          color: 'white',
          padding: '3rem 3rem 2rem 3rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>
            📊
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: '300',
            marginBottom: '0.5rem'
          }}>
            Google Search Console
          </h1>
          <p style={{
            margin: 0,
            opacity: 0.9,
            fontSize: '1.1rem',
            fontWeight: '300'
          }}>
            Monitor your search performance
          </p>
        </div>

        {/* Progress Dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem 0 1rem 0',
          background: '#f8fafc'
        }}>
          {[1, 2, 3].map(dotNumber => (
            <div
              key={dotNumber}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: step >= dotNumber ? '#1a73e8' : '#e2e8f0',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '2rem 3rem 3rem 3rem' }}>
          
          {/* Step 1: Property Information */}
          {step === 1 && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{
                margin: '0 0 2rem 0',
                fontSize: '1.5rem',
                fontWeight: '400',
                color: '#2d3748'
              }}>
                Set up Search Console for your site
              </h2>
              
              <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#4a5568'
                }}>
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '1rem',
                  fontWeight: '500',
                  color: '#4a5568'
                }}>
                  Property Type
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem',
                    border: '2px solid ' + (formData.propertyType === 'url' ? '#1a73e8' : '#e2e8f0'),
                    borderRadius: '12px',
                    cursor: 'pointer',
                    flex: 1,
                    background: formData.propertyType === 'url' ? '#f0f9ff' : 'white'
                  }}>
                    <input
                      type="radio"
                      name="propertyType"
                      value="url"
                      checked={formData.propertyType === 'url'}
                      onChange={(e) => handleInputChange('propertyType', e.target.value)}
                    />
                    <div>
                      <div style={{ fontWeight: '500' }}>URL prefix</div>
                      <div style={{ fontSize: '0.875rem', color: '#718096' }}>Recommended</div>
                    </div>
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem',
                    border: '2px solid ' + (formData.propertyType === 'domain' ? '#1a73e8' : '#e2e8f0'),
                    borderRadius: '12px',
                    cursor: 'pointer',
                    flex: 1,
                    background: formData.propertyType === 'domain' ? '#f0f9ff' : 'white'
                  }}>
                    <input
                      type="radio"
                      name="propertyType"
                      value="domain"
                      checked={formData.propertyType === 'domain'}
                      onChange={(e) => handleInputChange('propertyType', e.target.value)}
                    />
                    <div>
                      <div style={{ fontWeight: '500' }}>Domain</div>
                      <div style={{ fontSize: '0.875rem', color: '#718096' }}>Advanced</div>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{
                background: '#f0f9ff',
                border: '1px solid #1a73e8',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'left'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#1a73e8' }}>
                  What is Search Console?
                </h3>
                <p style={{ margin: 0, color: '#1e40af', lineHeight: '1.5' }}>
                  It shows you how your website appears in Google search results, helps fix technical issues, and tracks your search performance.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Visual Example */}
          {step === 2 && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{
                margin: '0 0 1rem 0',
                fontSize: '1.5rem',
                fontWeight: '400',
                color: '#2d3748'
              }}>
                Give us access to Search Console
              </h2>
              
              <p style={{
                margin: '0 0 2rem 0',
                color: '#718096',
                fontSize: '1rem'
              }}>
                Go to <strong>search.google.com/search-console</strong> and add us:
              </p>

              {/* GSC Interface Example */}
              <div style={{
                background: '#f8fafc',
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                textAlign: 'left'
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '2rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '2rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      background: '#1a73e8',
                      color: 'white',
                      borderRadius: '4px',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.875rem'
                    }}>
                      GSC
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>Search Console</div>
                      <div style={{ color: '#718096', fontSize: '0.9rem' }}>Settings → Users and permissions</div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Add user
                    </label>
                    <div style={{
                      background: '#dbeafe',
                      border: '2px solid #3b82f6',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontFamily: 'monospace',
                      fontSize: '1rem'
                    }}>
                      integralmediaau@gmail.com
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Permission
                    </label>
                    <div style={{
                      background: '#fef3c7',
                      border: '2px solid #f59e0b',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontWeight: '600'
                    }}>
                      Full
                    </div>
                  </div>

                  <div style={{
                    background: '#1a73e8',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    Add User
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: '#ecfdf5',
                  border: '1px solid #10b981',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontSize: '0.9rem',
                  color: '#065f46'
                }}>
                  ✅ <strong>Full access</strong><br/>
                  View all data and settings
                </div>
                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontSize: '0.9rem',
                  color: '#92400e'
                }}>
                  ⚠️ <strong>Restricted access</strong><br/>
                  Limited view only
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{
                margin: '0 0 1rem 0',
                fontSize: '1.5rem',
                fontWeight: '400',
                color: '#2d3748'
              }}>
                Confirm access setup
              </h2>
              
              <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1rem'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.isVerified}
                      onChange={(e) => handleInputChange('isVerified', e.target.checked)}
                      style={{
                        width: '1.25rem',
                        height: '1.25rem'
                      }}
                    />
                    <span style={{ fontSize: '1rem', color: '#4a5568' }}>
                      My website is already verified in Search Console
                    </span>
                  </label>
                  {!formData.isVerified && (
                    <p style={{
                      margin: '0.5rem 0 0 2.25rem',
                      fontSize: '0.875rem',
                      color: '#718096'
                    }}>
                      No problem! We can help you verify it during setup.
                    </p>
                  )}
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.5rem',
                background: '#f8fafc',
                borderRadius: '12px',
                marginBottom: '2rem'
              }}>
                <input
                  type="checkbox"
                  checked={formData.confirmed}
                  onChange={(e) => handleInputChange('confirmed', e.target.checked)}
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '1rem', color: '#4a5568' }}>
                  I have given integralmediaau@gmail.com full access to my Search Console property
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={step === 3 ? handleComplete : handleNext}
              disabled={!canProceed()}
              style={{
                background: canProceed() 
                  ? 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)' 
                  : '#e2e8f0',
                color: canProceed() ? 'white' : '#a0aec0',
                border: 'none',
                padding: '1rem 3rem',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '500',
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                transform: canProceed() ? 'none' : 'scale(0.98)'
              }}
            >
              {step === 3 ? 'Complete Setup' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoogleSearchConsoleSetup;