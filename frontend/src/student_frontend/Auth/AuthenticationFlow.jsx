import React from 'react';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import StudentPortalEntry from './StudentPortalEntry';
import TokenValidator from './TokenValidator';
// COMMENTED OUT: Face verification components are disabled
// import FacialRecognitionSetup from '../Verification/FacialRecognitionSetup';
// import FaceCapture from '../Verification/FaceCapture';
import ExamInstructions from '../PreExam/ExamInstructions';
import ExamInterface from '../Assessment/ExamInterface';

const AuthenticationFlow = () => {
  const { state, setStep } = useStudentAuth();
  const { currentStep } = state;

  // Handle exam completion - transition to results
  const handleExamCompletion = () => {
    setStep('results');
  };

  // Render the appropriate component based on current step
  const renderStep = () => {
    switch (currentStep) {
      case 'entry':
        return <StudentPortalEntry />;
      
      case 'token':
        return <TokenValidator />;
      
      // COMMENTED OUT: Face verification steps are disabled
      // After token validation, users now go directly to instructions
      // case 'faceSetup':
      //   return <FacialRecognitionSetup />;
      // 
      // case 'faceCapture':
      //   return <FaceCapture />;
      
      case 'instructions':
        return <ExamInstructions />;
      
      case 'exam':
        return <ExamInterface setView={handleExamCompletion} />;
      
      case 'results':
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md text-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-0 p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">
                  Exam Completed!
                </h2>
                <p className="text-slate-600 mb-6">
                  Your exam has been submitted successfully. Results will be available soon.
                </p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        );
      
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