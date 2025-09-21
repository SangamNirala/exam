import React, { useState } from 'react';
import StudentPortalEntry from './StudentPortalEntry';
import TokenValidator from './TokenValidator';
import FacialRecognitionSetup from '../Verification/FacialRecognitionSetup';

const AuthenticationFlow = ({ onBack, onAuthComplete }) => {
  const [currentStep, setCurrentStep] = useState('entry'); // entry, validation, verification, complete
  const [authData, setAuthData] = useState({
    token: null,
    tokenDetails: null,
    faceVerified: false,
    sessionId: null
  });

  const handleTokenSubmission = (token) => {
    setAuthData(prev => ({ ...prev, token }));
    setCurrentStep('validation');
  };

  const handleValidationSuccess = (token, tokenDetails) => {
    setAuthData(prev => ({ 
      ...prev, 
      token, 
      tokenDetails,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));
    setCurrentStep('verification');
  };

  const handleValidationError = (error) => {
    console.error('Token validation failed:', error);
    // Stay on validation step to show error, user can retry
  };

  const handleVerificationSuccess = (faceData) => {
    setAuthData(prev => ({ 
      ...prev, 
      faceVerified: true,
      faceData 
    }));
    setCurrentStep('complete');
    
    // Complete authentication flow
    onAuthComplete({
      ...authData,
      faceVerified: true,
      faceData,
      timestamp: new Date().toISOString()
    });
  };

  const handleVerificationSkip = () => {
    // For demo purposes, allow skipping face verification
    setAuthData(prev => ({ ...prev, faceVerified: false }));
    setCurrentStep('complete');
    
    onAuthComplete({
      ...authData,
      faceVerified: false,
      timestamp: new Date().toISOString()
    });
  };

  const handleBackToEntry = () => {
    setCurrentStep('entry');
    setAuthData({
      token: null,
      tokenDetails: null,
      faceVerified: false,
      sessionId: null
    });
  };

  // Render current step
  switch (currentStep) {
    case 'entry':
      return (
        <StudentPortalEntry 
          onBack={onBack}
          onAuthSuccess={handleTokenSubmission}
        />
      );

    case 'validation':
      return (
        <TokenValidator
          token={authData.token}
          onValidationSuccess={handleValidationSuccess}
          onValidationError={handleValidationError}
          onCancel={handleBackToEntry}
        />
      );

    case 'verification':
      return (
        <FacialRecognitionSetup
          tokenDetails={authData.tokenDetails}
          onVerificationSuccess={handleVerificationSuccess}
          onSkip={handleVerificationSkip}
          onBack={() => setCurrentStep('entry')}
        />
      );

    case 'complete':
      // This step is handled by parent component through onAuthComplete
      return null;

    default:
      return (
        <StudentPortalEntry 
          onBack={onBack}
          onAuthSuccess={handleTokenSubmission}
        />
      );
  }
};

export default AuthenticationFlow;