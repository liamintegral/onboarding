import React, { useState } from 'react';
import PlatformConnection from './PlatformConnection';
import WebsiteAnalysis from './WebsiteAnalysis';
import AIChat from './AIChat';

function OnboardingWizard({ platforms, onComplete, onClose }) {
  const [currentStep, setCurrentStep] = useState('website-analysis'); // 'website-analysis' or 'platforms'
  const [currentPlatformIndex, setCurrentPlatformIndex] = useState(0);
  const [completedPlatforms, setCompletedPlatforms] = useState([]);
  const [skippedPlatforms, setSkippedPlatforms] = useState([]);
  const [websiteAnalysis, setWebsiteAnalysis] = useState(null);
  const [showAIChat, setShowAIChat] = useState(false);
  
  // Define the order of platform setup
  const setupOrder = [
    'wordpress', 'shopify', // CMS first
    'google_analytics', 'google_ads', 'google_search_console', 
    'google_my_business', 'google_tag_manager', // Google platforms
    'meta_business_suite', // Meta
    'linkedin_campaign_manager', // LinkedIn
    'tiktok_ads_manager' // TikTok
  ];

  // Get platforms in the defined order
  const orderedPlatforms = setupOrder.map(platformName => {
    for (const category of Object.values(platforms)) {
      const platform = category.find(p => p.name === platformName);
      if (platform) return platform;
    }
    return null;
  }).filter(Boolean);

  const currentPlatform = orderedPlatforms[currentPlatformIndex];
  const totalPlatforms = orderedPlatforms.length;
  const totalSteps = totalPlatforms + 1; // +1 for website analysis
  const currentStepNumber = currentStep === 'website-analysis' ? 1 : currentPlatformIndex + 2;
  const progress = (currentStepNumber / totalSteps) * 100;

  const handlePlatformComplete = async (platform, credentials) => {
    // Save platform connection data
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/platforms/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          platformId: platform.id,
          credentials: credentials,
          status: 'completed'
        })
      });

      if (response.ok) {
        setCompletedPlatforms(prev => [...prev, platform.id]);
        moveToNext();
      } else {
        throw new Error('Failed to save platform connection');
      }
    } catch (error) {
      console.error('Error saving platform:', error);
      // For now, still allow progression
      setCompletedPlatforms(prev => [...prev, platform.id]);
      moveToNext();
    }
  };

  const handlePlatformSkip = () => {
    setSkippedPlatforms(prev => [...prev, currentPlatform.id]);
    moveToNext();
  };

  const handleWebsiteAnalysisComplete = (analysis) => {
    setWebsiteAnalysis(analysis);
    // If the analysis completed through our new Apple-style flows (WordPress or Google),
    // then complete the onboarding entirely - don't transition to old wizard
    if (analysis.wordpressSetup || analysis.googleSetup) {
      onComplete({
        websiteAnalysis: analysis,
        completed: [],
        skipped: [],
        total: 0,
        newFlowCompleted: true
      });
    }
  };

  const handleWebsiteAnalysisNext = () => {
    // Only transition to old platform setup if user specifically chose "Continue Setup"
    // instead of completing through our new flows
    setCurrentStep('platforms');
  };

  const moveToNext = () => {
    if (currentPlatformIndex < orderedPlatforms.length - 1) {
      setCurrentPlatformIndex(prev => prev + 1);
    } else {
      // Onboarding complete
      onComplete({
        websiteAnalysis,
        completed: completedPlatforms,
        skipped: skippedPlatforms,
        total: totalPlatforms
      });
    }
  };

  if (currentStep === 'platforms' && !currentPlatform) {
    return (
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
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h2>Onboarding Complete! 🎉</h2>
          <p>You've completed the platform setup process.</p>
          <button 
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
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
        overflow: 'auto'
      }}>
        {/* Header with Progress */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '1rem',
          background: 'white',
          borderRadius: '10px'
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#2d3748' }}>
              {currentStep === 'website-analysis' ? 'Website Analysis' : 'Platform Setup Wizard'}
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#718096' }}>
              {currentStep === 'website-analysis' 
                ? 'Step 1: Analyzing your website'
                : `Step ${currentStepNumber}: ${currentPlatform?.displayName || ''}`
              }
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#a0aec0'
            }}
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{
          background: 'white',
          padding: '1rem',
          borderRadius: '10px',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '0.875rem', color: '#4a5568' }}>
              Overall Progress ({currentStepNumber} of {totalSteps})
            </span>
            <span style={{ fontSize: '0.875rem', color: '#4a5568' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{
            background: '#e2e8f0',
            borderRadius: '10px',
            height: '8px'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              width: `${progress}%`,
              height: '100%',
              borderRadius: '10px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>

        {/* Platform Cards Preview - only show during platform setup */}
        {currentStep === 'platforms' && (
          <div style={{
            background: 'white',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>Setup Progress</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '0.5rem'
            }}>
              {orderedPlatforms.map((platform, index) => (
                <div
                  key={platform.id}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    background: index < currentPlatformIndex ? '#c6f6d5' :
                               index === currentPlatformIndex ? '#fef5e7' : '#f7fafc',
                    color: index < currentPlatformIndex ? '#22543d' :
                           index === currentPlatformIndex ? '#b7791f' : '#718096',
                    border: index === currentPlatformIndex ? '2px solid #f6ad55' : '1px solid #e2e8f0'
                  }}
                >
                  {platform.displayName}
                  {completedPlatforms.includes(platform.id) && ' ✓'}
                  {skippedPlatforms.includes(platform.id) && ' ⏭'}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {currentStep === 'website-analysis' ? (
          <WebsiteAnalysis
            onComplete={handleWebsiteAnalysisComplete}
            onNext={handleWebsiteAnalysisNext}
          />
        ) : (
          <PlatformConnection
            platform={currentPlatform}
            onComplete={handlePlatformComplete}
            onSkip={handlePlatformSkip}
          />
        )}

        {/* AI Chat Assistant */}
        <AIChat
          platform={currentStep === 'website-analysis' ? websiteAnalysis?.cms?.name : currentPlatform?.displayName}
          context={{
            step: currentStep,
            websiteAnalysis,
            currentPlatform: currentPlatform?.displayName
          }}
          isOpen={showAIChat}
          onToggle={() => setShowAIChat(!showAIChat)}
        />
      </div>
    </div>
  );
}

export default OnboardingWizard;