import React, { useState } from 'react';

function GoogleAdsSetup({ businessInfo, onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    hasExistingAccount: false,
    customerId: '',
    businessType: 'existing',
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
        return formData.businessType;
      case 2:
        return true; // Just viewing the example
      case 3:
        return formData.confirmed && (formData.hasExistingAccount ? formData.customerId : true);
      default:
        return false;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4285f4 0%, #0f9d58 100%)',
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
          background: 'linear-gradient(135deg, #4285f4 0%, #0f9d58 100%)',
          color: 'white',
          padding: '3rem 3rem 2rem 3rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>
            🎯
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: '300',
            marginBottom: '0.5rem'
          }}>
            Google Ads
          </h1>
          <p style={{
            margin: 0,
            opacity: 0.9,
            fontSize: '1.1rem',
            fontWeight: '300'
          }}>
            Manage your advertising campaigns
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
          
          {/* Step 1: Account Type */}
          {step === 1 && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{
                margin: '0 0 2rem 0',
                fontSize: '1.5rem',
                fontWeight: '400',
                color: '#2d3748'
              }}>
                Tell us about your Google Ads setup
              </h2>
              
              <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.5rem',
                  border: '2px solid ' + (formData.businessType === 'existing' ? '#4285f4' : '#e2e8f0'),
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: formData.businessType === 'existing' ? '#f0f9ff' : 'white'
                }}>
                  <input
                    type="radio"
                    name="businessType"
                    value="existing"
                    checked={formData.businessType === 'existing'}
                    onChange={(e) => {
                      handleInputChange('businessType', e.target.value);
                      handleInputChange('hasExistingAccount', true);
                    }}
                    style={{ width: '1.25rem', height: '1.25rem' }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      I already have a Google Ads account
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#718096' }}>
                      We'll help you give us access to your existing account
                    </div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.5rem',
                  border: '2px solid ' + (formData.businessType === 'new' ? '#4285f4' : '#e2e8f0'),
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: formData.businessType === 'new' ? '#f0f9ff' : 'white'
                }}>
                  <input
                    type="radio"
                    name="businessType"
                    value="new"
                    checked={formData.businessType === 'new'}
                    onChange={(e) => {
                      handleInputChange('businessType', e.target.value);
                      handleInputChange('hasExistingAccount', false);
                    }}
                    style={{ width: '1.25rem', height: '1.25rem' }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      I need to create a Google Ads account
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#718096' }}>
                      We'll help you set up a new account from scratch
                    </div>
                  </div>
                </label>
              </div>

              {formData.hasExistingAccount && (
                <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#4a5568'
                  }}>
                    Customer ID (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.customerId}
                    onChange={(e) => handleInputChange('customerId', e.target.value)}
                    placeholder="123-456-7890"
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
                    onFocus={(e) => e.target.style.borderColor = '#4285f4'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                  <p style={{
                    margin: '0.5rem 0 0 0',
                    fontSize: '0.875rem',
                    color: '#718096'
                  }}>
                    Found in your Google Ads account (we can find this for you if you don't know it)
                  </p>
                </div>
              )}

              <div style={{
                background: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'left'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#0369a1' }}>
                  What is Google Ads?
                </h3>
                <p style={{ margin: 0, color: '#075985', lineHeight: '1.5' }}>
                  Google's advertising platform that lets you show ads in Google search results, YouTube, and across the web to drive traffic and sales to your business.
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
                {formData.hasExistingAccount ? 'Give us access to your account' : 'We\'ll help you create an account'}
              </h2>
              
              <p style={{
                margin: '0 0 2rem 0',
                color: '#718096',
                fontSize: '1rem'
              }}>
                {formData.hasExistingAccount 
                  ? 'Go to ads.google.com and add us as an admin:'
                  : 'We\'ll guide you through creating a Google Ads account during our setup call.'
                }
              </p>

              {formData.hasExistingAccount ? (
                /* Google Ads Interface Example */
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
                        borderRadius: '4px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      }}>
                        Ads
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>Google Ads</div>
                        <div style={{ color: '#718096', fontSize: '0.9rem' }}>Tools & Settings → Access and security</div>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Invite user
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
                        Access level
                      </label>
                      <div style={{
                        background: '#fef3c7',
                        border: '2px solid #f59e0b',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        fontWeight: '600'
                      }}>
                        Admin
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
              ) : (
                /* New Account Setup Info */
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
                    <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
                      What we'll help you set up:
                    </h3>
                    <ul style={{ paddingLeft: '1.5rem', color: '#4a5568', lineHeight: '1.8' }}>
                      <li>Create your Google Ads account</li>
                      <li>Set up billing and payment methods</li>
                      <li>Configure conversion tracking</li>
                      <li>Create your first campaign structure</li>
                      <li>Set appropriate budgets and targeting</li>
                    </ul>
                  </div>
                </div>
              )}

              <div style={{
                background: '#ecfdf5',
                border: '1px solid #10b981',
                borderRadius: '12px',
                padding: '1rem',
                fontSize: '0.9rem',
                color: '#065f46'
              }}>
                💡 <strong>Don't worry!</strong> We'll guide you through everything step-by-step
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
                Confirm your setup
              </h2>
              
              <p style={{
                margin: '0 0 2rem 0',
                color: '#718096',
                fontSize: '1rem'
              }}>
                {formData.hasExistingAccount 
                  ? 'Let us know when you\'ve completed the access setup:'
                  : 'We\'ll create your Google Ads account together during our setup call.'
                }
              </p>

              {formData.customerId && (
                <div style={{
                  background: '#f0f9ff',
                  border: '1px solid #0ea5e9',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontSize: '0.9rem',
                  color: '#0c4a6e',
                  marginBottom: '2rem'
                }}>
                  <strong>Customer ID:</strong> {formData.customerId}
                </div>
              )}

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
                  {formData.hasExistingAccount 
                    ? 'I have given integralmediaau@gmail.com admin access to my Google Ads account'
                    : 'I understand that we\'ll create my Google Ads account together during setup'
                  }
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
                  ? 'linear-gradient(135deg, #4285f4 0%, #0f9d58 100%)' 
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

export default GoogleAdsSetup;