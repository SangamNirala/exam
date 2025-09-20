import React from 'react';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import StudentPortalEntry from './StudentPortalEntry';
import TokenValidator from './TokenValidator';
import FacialRecognitionSetup from '../Verification/FacialRecognitionSetup';
import FaceCapture from '../Verification/FaceCapture';
import ExamInstructions from '../PreExam/ExamInstructions';

const AuthenticationFlow = () => {
  const { state } = useStudentAuth();
  const { currentStep } = state;

  // Render the appropriate component based on current step
  const renderStep = () => {
    switch (currentStep) {
      case 'entry':
        return <StudentPortalEntry />;
      
      case 'token':
        return <TokenValidator />;
      
      case 'faceSetup':
        return <FacialRecognitionSetup />;
      
      case 'faceCapture':
        return <FaceCapture />;
      
      case 'instructions':
        return <ExamInstructions />;
      
      case 'exam':
        // This would be handled by the main student context
        return <div>Redirecting to exam...</div>;
      
      default:
        return <StudentPortalEntry />;
    }
  };

  return (
    <div className="authentication-flow">
      {renderStep()}
    </div>
  );
};

export default AuthenticationFlow;