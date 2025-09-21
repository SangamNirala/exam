import React, { useState, useEffect } from 'react';
import { StudentAuthProvider } from '../contexts/StudentAuthContext';
import { FacialRecognitionProvider } from '../contexts/FacialRecognitionContext';
import { ExamMonitoringProvider } from '../contexts/ExamMonitoringContext';
import { useStudentAuth } from '../contexts/StudentAuthContext';

// Import all components
import AuthenticationFlow from './Auth/AuthenticationFlow';
import FacialRecognitionSetup from './Verification/FacialRecognitionSetup';
import ExamInstructions from './PreExam/ExamInstructions';
import InstructionsAcknowledgment from './PreExam/InstructionsAcknowledgment';
import AccessibilityControlCenter from './Accessibility/AccessibilityControlCenter';
import ExamCountdown from './ExamLaunch/ExamCountdown';
import ContinuousMonitoring from './Monitoring/ContinuousMonitoring';
import ExamSubmission from './PostExam/ExamSubmission';
import ExamInterface from './Assessment/ExamInterface'; // Existing component

const StudentPortalFlow = ({ onBack }) => {
  const { state, setAuthStep, setExamData, completeAuthentication } = useStudentAuth();
  const [showAccessibilityCenter, setShowAccessibilityCenter] = useState(false);
  const [examAnswers, setExamAnswers] = useState({});
  const [monitoringData, setMonitoringData] = useState({});

  // Mock exam data - in real implementation, fetch from API
  const mockExamData = {
    id: 'exam_001',
    title: 'Digital Literacy Assessment',
    duration: 60,
    questions: 20,
    type: 'Mixed Format',
    instructor: 'Dr. Sarah Johnson',
    studentId: 'student_123',
    studentName: 'Demo Student',
    startTime: Date.now(),
    questions: [
      // Mock questions would be loaded here
    ]
  };

  useEffect(() => {
    // Set exam data when component mounts
    setExamData(mockExamData);
  }, []);

  const handleAuthComplete = (authData) => {
    console.log('Authentication completed:', authData);
    setAuthStep('instructions');
  };

  const handleInstructionsComplete = () => {
    setAuthStep('acknowledgment');
  };

  const handleAcknowledmentComplete = (acknowledgmentData) => {
    console.log('Acknowledgment completed:', acknowledgmentData);
    setAuthStep('countdown');
  };

  const handleExamStart = () => {
    completeAuthentication();
    setAuthStep('exam');
  };

  const handleExamSubmission = (submissionData) => {
    console.log('Exam submitted:', submissionData);
    setAuthStep('complete');
  };

  const handleAccessibilitySettings = () => {
    setShowAccessibilityCenter(true);
  };

  const handleAccessibilityClose = () => {
    setShowAccessibilityCenter(false);
  };

  const handleAccessibilitySave = (settings) => {
    console.log('Accessibility settings saved:', settings);
    // Update accessibility settings in context
  };

  const handleViolationDetected = (violation) => {
    console.log('Violation detected:', violation);
    // Handle violation (could trigger warnings, etc.)
  };

  const handleMonitoringUpdate = (data) => {
    setMonitoringData(data);
  };

  const renderCurrentStep = () => {
    switch (state.authStep) {
      case 'entry':
      case 'validation':
      case 'verification':
        return (
          <AuthenticationFlow
            onBack={onBack}
            onAuthComplete={handleAuthComplete}
          />
        );

      case 'instructions':
        return (
          <ExamInstructions
            examDetails={state.examData}
            onComplete={handleInstructionsComplete}
            onAccessibilitySettings={handleAccessibilitySettings}
          />
        );

      case 'acknowledgment':
        return (
          <InstructionsAcknowledgment
            examDetails={state.examData}
            onComplete={handleAcknowledmentComplete}
            onBack={() => setAuthStep('instructions')}
          />
        );

      case 'countdown':
        return (
          <ExamCountdown
            examDetails={state.examData}
            onExamStart={handleExamStart}
            onCancel={() => setAuthStep('acknowledgment')}
            countdownDuration={10}
          />
        );

      case 'exam':
        return (
          <div className="relative">
            {/* Main Exam Interface */}
            <ExamInterface />
            
            {/* Continuous Monitoring Overlay */}
            <div className="fixed top-4 right-4 w-80 z-30">
              <ContinuousMonitoring
                isActive={true}
                onViolationDetected={handleViolationDetected}
                onMonitoringUpdate={handleMonitoringUpdate}
                examSettings={state.examSettings}
              />
            </div>
          </div>
        );

      case 'submission':
        return (
          <ExamSubmission
            examData={state.examData}
            answers={examAnswers}
            monitoringData={monitoringData}
            onSubmit={handleExamSubmission}
            onBackToReview={() => setAuthStep('exam')}
          />
        );

      case 'complete':
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
            <div className="text-center p-12">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Assessment Complete!</h2>
              <p className="text-lg text-slate-600 mb-8">
                Your exam has been successfully submitted. Thank you for maintaining academic integrity.
              </p>
              <button
                onClick={onBack}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-slate-600">Loading...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {renderCurrentStep()}
      
      {/* Accessibility Control Center Modal */}
      {showAccessibilityCenter && (
        <AccessibilityControlCenter
          onClose={handleAccessibilityClose}
          onSave={handleAccessibilitySave}
          initialSettings={state.accessibilitySettings}
        />
      )}
    </>
  );
};

const StudentPortalMain = ({ onBack }) => {
  return (
    <StudentAuthProvider>
      <FacialRecognitionProvider>
        <ExamMonitoringProvider>
          <StudentPortalFlow onBack={onBack} />
        </ExamMonitoringProvider>
      </FacialRecognitionProvider>
    </StudentAuthProvider>
  );
};

export default StudentPortalMain;