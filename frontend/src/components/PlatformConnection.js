import React, { useState } from 'react';

function PlatformConnection({ platform, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [credentials, setCredentials] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = async () => {
    if (currentStep < getStepsForPlatform(platform).length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Here we would normally save credentials and validate
      // For now, just simulate completion
      await new Promise(resolve => setTimeout(resolve, 1000));
      onComplete(platform, credentials);
    } catch (err) {
      setError('Failed to save credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepsForPlatform = (platform) => {
    const steps = {
      // CMS Platforms
      wordpress: [
        {
          title: 'WordPress Admin Access',
          description: 'We need admin access to your WordPress site to install tracking codes and optimize performance.',
          fields: [
            { name: 'siteUrl', label: 'Website URL', type: 'url', required: true, placeholder: 'https://yoursite.com' },
            { name: 'adminUrl', label: 'WordPress Admin URL', type: 'url', required: true, placeholder: 'https://yoursite.com/wp-admin' },
            { name: 'username', label: 'Admin Username', type: 'text', required: true },
            { name: 'password', label: 'Admin Password', type: 'password', required: true }
          ]
        }
      ],
      shopify: [
        {
          title: 'Shopify Store Access',
          description: 'Connect your Shopify store to enable conversion tracking and optimization.',
          fields: [
            { name: 'storeUrl', label: 'Store URL', type: 'url', required: true, placeholder: 'https://yourstore.myshopify.com' },
            { name: 'accessToken', label: 'Private App Access Token', type: 'password', required: true },
            { name: 'apiKey', label: 'API Key', type: 'text', required: true },
            { name: 'apiSecret', label: 'API Secret', type: 'password', required: true }
          ]
        }
      ],

      // Google Platforms
      google_analytics: [
        {
          title: 'Google Analytics Access',
          description: 'Grant us access to your Google Analytics account to track website performance.',
          fields: [
            { name: 'accountEmail', label: 'Our Email for Access', type: 'email', required: true, value: 'team@youragency.com', disabled: true },
            { name: 'propertyId', label: 'GA4 Property ID', type: 'text', required: true, placeholder: 'G-XXXXXXXXXX' },
            { name: 'accessLevel', label: 'Access Level', type: 'select', required: true, options: ['Viewer', 'Analyst', 'Editor', 'Admin'], value: 'Editor' }
          ]
        }
      ],
      google_ads: [
        {
          title: 'Google Ads Account Access',
          description: 'Connect your Google Ads account for campaign management and optimization.',
          fields: [
            { name: 'accountEmail', label: 'Our Email for Access', type: 'email', required: true, value: 'team@youragency.com', disabled: true },
            { name: 'customerId', label: 'Google Ads Customer ID', type: 'text', required: true, placeholder: '123-456-7890' },
            { name: 'accessLevel', label: 'Access Level', type: 'select', required: true, options: ['Standard', 'Admin'], value: 'Admin' }
          ]
        }
      ],
      google_search_console: [
        {
          title: 'Google Search Console Access',
          description: 'Monitor your website\'s search performance and fix technical issues.',
          fields: [
            { name: 'accountEmail', label: 'Our Email for Access', type: 'email', required: true, value: 'team@youragency.com', disabled: true },
            { name: 'propertyUrl', label: 'Verified Property URL', type: 'url', required: true, placeholder: 'https://yoursite.com' },
            { name: 'accessLevel', label: 'Access Level', type: 'select', required: true, options: ['Restricted', 'Full'], value: 'Full' }
          ]
        }
      ],
      google_my_business: [
        {
          title: 'Google My Business Access',
          description: 'Manage your local business presence and customer reviews.',
          fields: [
            { name: 'accountEmail', label: 'Our Email for Access', type: 'email', required: true, value: 'team@youragency.com', disabled: true },
            { name: 'businessName', label: 'Business Name', type: 'text', required: true },
            { name: 'businessAddress', label: 'Business Address', type: 'text', required: true },
            { name: 'accessLevel', label: 'Access Level', type: 'select', required: true, options: ['Manager', 'Owner'], value: 'Manager' }
          ]
        }
      ],
      google_tag_manager: [
        {
          title: 'Google Tag Manager Access',
          description: 'Install and manage tracking codes without developer help.',
          fields: [
            { name: 'accountEmail', label: 'Our Email for Access', type: 'email', required: true, value: 'team@youragency.com', disabled: true },
            { name: 'containerId', label: 'GTM Container ID', type: 'text', required: true, placeholder: 'GTM-XXXXXXX' },
            { name: 'accessLevel', label: 'Access Level', type: 'select', required: true, options: ['User', 'Admin'], value: 'Admin' }
          ]
        }
      ],

      // Meta Platforms
      meta_business_suite: [
        {
          title: 'Meta Business Suite Access',
          description: 'Manage your Facebook and Instagram business accounts.',
          fields: [
            { name: 'accountEmail', label: 'Our Email for Access', type: 'email', required: true, value: 'team@youragency.com', disabled: true },
            { name: 'businessId', label: 'Business Manager ID', type: 'text', required: true },
            { name: 'adAccountId', label: 'Ad Account ID', type: 'text', required: false, placeholder: 'act_123456789' },
            { name: 'pageId', label: 'Facebook Page ID', type: 'text', required: false },
            { name: 'instagramId', label: 'Instagram Account ID', type: 'text', required: false }
          ]
        }
      ],

      // LinkedIn
      linkedin_campaign_manager: [
        {
          title: 'LinkedIn Campaign Manager Access',
          description: 'Run targeted LinkedIn advertising campaigns.',
          fields: [
            { name: 'accountEmail', label: 'Our Email for Access', type: 'email', required: true, value: 'team@youragency.com', disabled: true },
            { name: 'adAccountId', label: 'LinkedIn Ad Account ID', type: 'text', required: true },
            { name: 'companyPageId', label: 'Company Page ID', type: 'text', required: false },
            { name: 'accessLevel', label: 'Access Level', type: 'select', required: true, options: ['Viewer', 'Campaign Manager', 'Account Manager'], value: 'Account Manager' }
          ]
        }
      ],

      // TikTok
      tiktok_ads_manager: [
        {
          title: 'TikTok Ads Manager Access',
          description: 'Create and manage TikTok advertising campaigns.',
          fields: [
            { name: 'accountEmail', label: 'Our Email for Access', type: 'email', required: true, value: 'team@youragency.com', disabled: true },
            { name: 'adAccountId', label: 'TikTok Ad Account ID', type: 'text', required: true },
            { name: 'businessCenterId', label: 'Business Center ID', type: 'text', required: false },
            { name: 'accessLevel', label: 'Access Level', type: 'select', required: true, options: ['Operator', 'Admin'], value: 'Admin' }
          ]
        }
      ]
    };

    return steps[platform.name] || [
      {
        title: `${platform.displayName} Connection`,
        description: `Please provide access to your ${platform.displayName} account.`,
        fields: [
          { name: 'accountEmail', label: 'Our Email for Access', type: 'email', required: true, value: 'team@youragency.com', disabled: true },
          { name: 'accountId', label: 'Account ID', type: 'text', required: true },
          { name: 'notes', label: 'Additional Notes', type: 'textarea', required: false }
        ]
      }
    ];
  };

  const steps = getStepsForPlatform(platform);
  const currentStepData = steps[currentStep];

  return (
    <div style={{
      background: 'white',
      borderRadius: '10px',
      padding: '2rem',
      boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#2d3748', marginBottom: '0.5rem' }}>
          {currentStepData.title}
        </h2>
        <p style={{ color: '#718096', lineHeight: '1.6' }}>
          {currentStepData.description}
        </p>
        <div style={{ marginTop: '1rem' }}>
          <span style={{ 
            background: '#667eea', 
            color: 'white', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '20px',
            fontSize: '0.875rem'
          }}>
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
      </div>

      {/* Error Message */}
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

      {/* Form Fields */}
      <div style={{ marginBottom: '2rem' }}>
        {currentStepData.fields.map((field) => (
          <div key={field.name} style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#2d3748'
            }}>
              {field.label}
              {field.required && <span style={{ color: '#e53e3e' }}>*</span>}
            </label>
            
            {field.type === 'select' ? (
              <select
                value={credentials[field.name] || field.value || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                disabled={field.disabled}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="">Select {field.label}</option>
                {field.options?.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                value={credentials[field.name] || field.value || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                disabled={field.disabled}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            ) : (
              <input
                type={field.type}
                value={credentials[field.name] || field.value || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                disabled={field.disabled}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <button
          onClick={onSkip}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#f7fafc',
            color: '#4a5568',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Skip for Now
        </button>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#e2e8f0',
                color: '#4a5568',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: loading ? '#a0aec0' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Saving...' : 
             currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlatformConnection;