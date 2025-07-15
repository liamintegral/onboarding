import React, { useState } from 'react';

function WordPressSetup({ websiteUrl, onComplete, onBack, onCancel }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    websiteUrl: websiteUrl || '',
    adminUrl: '',
    generatedPassword: '',
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

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleComplete = () => {
    onComplete(formData);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.websiteUrl && formData.adminUrl;
      case 2:
        return true; // Just viewing the example
      case 3:
        return formData.generatedPassword && formData.confirmed;
      default:
        return false;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '3rem 3rem 2rem 3rem',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Cancel Button */}
          {onCancel && (
            <button
              onClick={handleCancel}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              title="Exit setup"
            >
              ×
            </button>
          )}
          
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>
            🔧
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: '300',
            marginBottom: '0.5rem'
          }}>
            WordPress Setup
          </h1>
          <p style={{
            margin: 0,
            opacity: 0.9,
            fontSize: '1.1rem',
            fontWeight: '300'
          }}>
            Give us access to your website
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
                background: step >= dotNumber ? '#667eea' : '#e2e8f0',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '2rem 3rem 3rem 3rem' }}>
          
          {/* Step 1: Website URLs */}
          {step === 1 && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{
                margin: '0 0 2rem 0',
                fontSize: '1.5rem',
                fontWeight: '400',
                color: '#2d3748'
              }}>
                First, let's find your WordPress admin
              </h2>
              
              <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#4a5568'
                }}>
                  Your Website URL
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
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div style={{ marginBottom: '3rem', textAlign: 'left' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#4a5568'
                }}>
                  WordPress Admin URL
                </label>
                <input
                  type="url"
                  value={formData.adminUrl}
                  onChange={(e) => handleInputChange('adminUrl', e.target.value)}
                  placeholder="https://yourwebsite.com/wp-admin"
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
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <p style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: '0.9rem',
                  color: '#718096'
                }}>
                  Usually yoursite.com/wp-admin or yoursite.com/wp-login.php
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
                Create a new admin user
              </h2>
              
              <p style={{
                margin: '0 0 2rem 0',
                color: '#718096',
                fontSize: '1rem'
              }}>
                Go to <strong>Users → Add New</strong> and fill out exactly like this:
              </p>

              {/* WordPress Form Example */}
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
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Username (required)
                    </label>
                    <div style={{
                      background: '#dbeafe',
                      border: '2px solid #3b82f6',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontFamily: 'monospace',
                      fontSize: '1rem'
                    }}>
                      integralmedia
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Email (required)
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
                      Password
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      background: 'white'
                    }}>
                      <span style={{ fontFamily: 'monospace' }}>••••••••••••••••</span>
                      <button style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        Generate Password
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Role
                    </label>
                    <div style={{
                      background: '#fef3c7',
                      border: '2px solid #f59e0b',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontWeight: '600'
                    }}>
                      Administrator
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                background: '#ecfdf5',
                border: '1px solid #10b981',
                borderRadius: '12px',
                padding: '1rem',
                fontSize: '0.9rem',
                color: '#065f46'
              }}>
                💡 <strong>Important:</strong> Click "Generate Password" and copy the password that appears
              </div>
            </div>
          )}

          {/* Step 3: Password Collection */}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{
                margin: '0 0 1rem 0',
                fontSize: '1.5rem',
                fontWeight: '400',
                color: '#2d3748'
              }}>
                Share the generated password
              </h2>
              
              <p style={{
                margin: '0 0 2rem 0',
                color: '#718096',
                fontSize: '1rem'
              }}>
                Paste the password that WordPress generated for the integralmedia user:
              </p>

              <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#4a5568'
                }}>
                  Generated Password
                </label>
                <input
                  type="text"
                  value={formData.generatedPassword}
                  onChange={(e) => handleInputChange('generatedPassword', e.target.value)}
                  placeholder="Paste the generated password here"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    fontFamily: 'monospace'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
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
                  I have successfully created the integralmedia admin user
                </span>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            gap: '1rem'
          }}>
            {/* Back Button */}
            <button
              onClick={handleBack}
              style={{
                background: 'transparent',
                color: '#718096',
                border: '2px solid #e2e8f0',
                padding: '1rem 2rem',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#cbd5e0';
                e.target.style.color = '#4a5568';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.color = '#718096';
              }}
            >
              ← {step === 1 ? 'Back' : 'Previous'}
            </button>

            {/* Continue/Complete Button */}
            <button
              onClick={step === 3 ? handleComplete : handleNext}
              disabled={!canProceed()}
              style={{
                background: canProceed() 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : '#e2e8f0',
                color: canProceed() ? 'white' : '#a0aec0',
                border: 'none',
                padding: '1rem 3rem',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '500',
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                transform: canProceed() ? 'none' : 'scale(0.98)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {step === 3 ? 'Complete Setup' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WordPressSetup;