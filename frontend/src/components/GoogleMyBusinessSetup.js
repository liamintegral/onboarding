import React, { useState } from 'react';

function GoogleMyBusinessSetup({ businessInfo, onComplete, onBack, onCancel }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: businessInfo?.businessName || '',
    businessAddress: businessInfo?.businessAddress || '',
    confirmationEmail: '',
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

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.businessName && formData.businessAddress;
      case 2:
        return true; // Just viewing the example
      case 3:
        return formData.confirmationEmail && formData.confirmed;
      default:
        return false;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
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
          background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
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
          
          {/* Step Indicator */}
          <div style={{
            position: 'absolute',
            top: '1.5rem',
            left: '1.5rem',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            Google Setup: Step 1 of 5
          </div>
          
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>
            🏢
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: '300',
            marginBottom: '0.5rem'
          }}>
            Google My Business
          </h1>
          <p style={{
            margin: 0,
            opacity: 0.9,
            fontSize: '1.1rem',
            fontWeight: '300'
          }}>
            Connect your business profile
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
                background: step >= dotNumber ? '#4285f4' : '#e2e8f0',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '2rem 3rem 3rem 3rem' }}>
          
          {/* Step 1: Business Information */}
          {step === 1 && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{
                margin: '0 0 2rem 0',
                fontSize: '1.5rem',
                fontWeight: '400',
                color: '#2d3748'
              }}>
                Tell us about your business
              </h2>
              
              <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#4a5568'
                }}>
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Your Business Name"
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
                  onFocus={(e) => e.target.style.borderColor = '#4285f4'}
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
                  Business Address
                </label>
                <input
                  type="text"
                  value={formData.businessAddress}
                  onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                  placeholder="123 Main Street, City, State 12345"
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
                  onFocus={(e) => e.target.style.borderColor = '#4285f4'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <p style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: '0.9rem',
                  color: '#718096'
                }}>
                  This helps us find your Google My Business listing
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
                Give us access to your listing
              </h2>
              
              <p style={{
                margin: '0 0 2rem 0',
                color: '#718096',
                fontSize: '1rem'
              }}>
                Go to <strong>Google My Business → Users</strong> and add us as a manager:
              </p>

              {/* Google My Business Interface Example */}
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
                      background: '#4285f4',
                      color: 'white',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      G
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>Google My Business</div>
                      <div style={{ color: '#718096', fontSize: '0.9rem' }}>Manage Users</div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Invite new user
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
                      Role
                    </label>
                    <div style={{
                      background: '#fef3c7',
                      border: '2px solid #f59e0b',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontWeight: '600'
                    }}>
                      Manager
                    </div>
                  </div>

                  <div style={{
                    background: '#4285f4',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    Send Invitation
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
                💡 <strong>Tip:</strong> You can also use "Owner" role if you prefer to give full access
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
                Confirm the invitation
              </h2>
              
              <p style={{
                margin: '0 0 2rem 0',
                color: '#718096',
                fontSize: '1rem'
              }}>
                Let us know when you've sent the invitation:
              </p>

              <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#4a5568'
                }}>
                  Confirmation Email (optional)
                </label>
                <input
                  type="email"
                  value={formData.confirmationEmail}
                  onChange={(e) => handleInputChange('confirmationEmail', e.target.value)}
                  placeholder="The email address you used to invite us"
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
                  onFocus={(e) => e.target.style.borderColor = '#4285f4'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <p style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: '0.875rem',
                  color: '#718096'
                }}>
                  This helps us verify the invitation was sent
                </p>
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
                  I have sent an invitation to integralmediaau@gmail.com with Manager access
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
                  ? 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)' 
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
              {step === 3 ? 'Next: Tag Manager →' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoogleMyBusinessSetup;