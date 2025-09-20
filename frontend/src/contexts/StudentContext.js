import React, { createContext, useContext, useReducer, useEffect } from 'react';

const StudentContext = createContext();

const initialState = {
  currentView: 'login', // login, instructions, countdown, assessment, submission, results, dashboard
  authToken: null,
  examInfo: null, // Store exam information from token validation
  sessionId: null, // Track student session
  currentExam: null,
  currentQuestion: 0,
  answers: {},
  timeRemaining: 0,
  isPaused: false,
  submissionResult: null, // Store submission results
  accessibility: {
    textToSpeech: false,
    speechToText: false,
    largeText: false,
    highContrast: false,
    keyboardNavigation: false,
    voiceControl: false
  },
  examHistory: [],
  availableExams: [],
  preferences: {
    fontSize: 'medium',
    theme: 'light',
    language: 'en',
    notifications: true
  },
  offlineMode: false,
  syncStatus: 'synced', // synced, pending, error
  loading: {
    auth: false,
    exam: false,
    submission: false
  },
  errors: {}
};

const studentReducer = (state, action) => {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    
    case 'SET_AUTH_TOKEN':
      return { ...state, authToken: action.payload };
    
    case 'SET_EXAM_INFO':
      return { ...state, examInfo: action.payload };
    
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };
    
    case 'SET_EXAM_SESSION':
      return { ...state, examSession: action.payload };
    
    case 'SET_SUBMISSION_RESULT':
      return { ...state, submissionResult: action.payload };
    
    case 'SET_CURRENT_EXAM':
      return { 
        ...state, 
        currentExam: action.payload,
        currentQuestion: 0,
        answers: {},
        timeRemaining: action.payload?.duration * 60 || 0
      };
    
    case 'SET_CURRENT_QUESTION':
      return { ...state, currentQuestion: action.payload };
    
    case 'UPDATE_ANSWER':
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionId]: action.payload.answer
        }
      };
    
    case 'SET_TIME_REMAINING':
      return { ...state, timeRemaining: action.payload };
    
    case 'TOGGLE_PAUSE':
      return { ...state, isPaused: !state.isPaused };
    
    case 'TOGGLE_ACCESSIBILITY':
      return {
        ...state,
        accessibility: {
          ...state.accessibility,
          [action.payload]: !state.accessibility[action.payload]
        }
      };
    
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };
    
    case 'SET_AVAILABLE_EXAMS':
      return { ...state, availableExams: action.payload };
    
    case 'ADD_TO_EXAM_HISTORY':
      return {
        ...state,
        examHistory: [...state.examHistory, action.payload]
      };
    
    case 'SET_OFFLINE_MODE':
      return { ...state, offlineMode: action.payload };
    
    case 'SET_SYNC_STATUS':
      return { ...state, syncStatus: action.payload };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.type]: action.payload.loading
        }
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.type]: action.payload.error
        }
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload]: null
        }
      };
    
    case 'RESET_EXAM_STATE':
      return {
        ...state,
        currentExam: null,
        currentQuestion: 0,
        answers: {},
        timeRemaining: 0,
        isPaused: false,
        currentView: 'dashboard'
      };
    
    case 'SUBMIT_EXAM':
      return {
        ...state,
        examHistory: [...state.examHistory, {
          examId: state.currentExam?.id,
          title: state.currentExam?.title,
          answers: state.answers,
          timeSpent: (state.currentExam?.duration * 60) - state.timeRemaining,
          submittedAt: new Date().toISOString(),
          status: 'submitted'
        }],
        currentExam: null,
        currentQuestion: 0,
        answers: {},
        timeRemaining: 0,
        currentView: 'results'
      };
    
    default:
      return state;
  }
};

export const StudentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(studentReducer, initialState);

  // Load persisted student state
  useEffect(() => {
    const savedStudentState = localStorage.getItem('assessai-student-state');
    if (savedStudentState) {
      try {
        const parsedState = JSON.parse(savedStudentState);
        if (parsedState.accessibility) {
          Object.keys(parsedState.accessibility).forEach(key => {
            if (parsedState.accessibility[key]) {
              dispatch({ type: 'TOGGLE_ACCESSIBILITY', payload: key });
            }
          });
        }
        if (parsedState.preferences) {
          dispatch({ type: 'UPDATE_PREFERENCES', payload: parsedState.preferences });
        }
        if (parsedState.examHistory) {
          parsedState.examHistory.forEach(exam => {
            dispatch({ type: 'ADD_TO_EXAM_HISTORY', payload: exam });
          });
        }
      } catch (error) {
        console.error('Error loading student state:', error);
      }
    }
  }, []);

  // Persist student state changes
  useEffect(() => {
    const stateToSave = {
      accessibility: state.accessibility,
      preferences: state.preferences,
      examHistory: state.examHistory
    };
    localStorage.setItem('assessai-student-state', JSON.stringify(stateToSave));
  }, [state.accessibility, state.preferences, state.examHistory]);

  // Auto-save exam progress
  useEffect(() => {
    if (state.currentExam && Object.keys(state.answers).length > 0) {
      const examProgress = {
        examId: state.currentExam.id,
        currentQuestion: state.currentQuestion,
        answers: state.answers,
        timeRemaining: state.timeRemaining,
        timestamp: Date.now()
      };
      localStorage.setItem('assessai-exam-progress', JSON.stringify(examProgress));
    }
  }, [state.currentExam, state.currentQuestion, state.answers, state.timeRemaining]);

  const value = {
    state,
    dispatch,
    // Convenience methods
    setView: (view) => dispatch({ type: 'SET_VIEW', payload: view }),
    setAuthToken: (token) => dispatch({ type: 'SET_AUTH_TOKEN', payload: token }),
    setExamInfo: (examInfo) => dispatch({ type: 'SET_EXAM_INFO', payload: examInfo }),
    setSessionId: (sessionId) => dispatch({ type: 'SET_SESSION_ID', payload: sessionId }),
    setSubmissionResult: (result) => dispatch({ type: 'SET_SUBMISSION_RESULT', payload: result }),
    setCurrentExam: (exam) => dispatch({ type: 'SET_CURRENT_EXAM', payload: exam }),
    updateAnswer: (questionId, answer) => dispatch({ type: 'UPDATE_ANSWER', payload: { questionId, answer } }),
    toggleAccessibility: (feature) => dispatch({ type: 'TOGGLE_ACCESSIBILITY', payload: feature }),
    setLoading: (type, loading) => dispatch({ type: 'SET_LOADING', payload: { type, loading } }),
    setError: (type, error) => dispatch({ type: 'SET_ERROR', payload: { type, error } }),
    submitExam: () => dispatch({ type: 'SUBMIT_EXAM' }),
    resetExamState: () => dispatch({ type: 'RESET_EXAM_STATE' })
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};