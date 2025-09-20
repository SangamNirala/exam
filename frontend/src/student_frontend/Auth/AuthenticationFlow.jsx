import React from 'react';
import { useStudent } from '../../contexts/StudentContext';
import EnhancedTokenLogin from './EnhancedTokenLogin';
import ExamInstructions from '../PreExam/ExamInstructions';
import ExamCountdown from '../ExamLaunch/ExamCountdown';
import ExamInterface from '../Assessment/ExamInterface';
import ExamSubmission from '../PostExam/ExamSubmission';
import StudentDashboard from '../StudentDashboard';

const AuthenticationFlow = () => {
  const { state } = useStudent();

  // Route based on current view
  switch (state.currentView) {
    case 'login':
      return <EnhancedTokenLogin />;
    case 'instructions':
      return <ExamInstructions />;
    case 'countdown':
      return <ExamCountdown />;
    case 'assessment':
      return <ExamInterface />;
    case 'submission':
      return <ExamSubmission />;
    case 'results':
      return <ExamSubmission />; // Shows results view
    case 'dashboard':
    default:
      return <StudentDashboard />;
  }
};

export default AuthenticationFlow;