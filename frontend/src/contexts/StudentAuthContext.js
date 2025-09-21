import React, { createContext, useContext, useReducer, useEffect } from 'react';

const StudentAuthContext = createContext();

const initialState = {
  // Authentication State
  isAuthenticated: false,
  authStep: 'entry', // entry, validation, verification, instructions, acknowledgment, countdown, exam, complete
  
  // Token Data
  token: null,
  tokenDetails: null,
  tokenValidated: false,
  
  // Face Recognition Data
  faceVerified: false,
  faceData: null,
  biometricSession: null,
  
  // Session Management
  sessionId: null,
  sessionStartTime: null,
  sessionData: {},
  
  // Accessibility Settings
  accessibilitySettings: {
    textToSpeech: {
      enabled: false,
      voice: 'default',
      speed: 1.0,
      pitch: 1.0,
      volume: 0.8
    },
    speechToText: {
      enabled: false,
      language: 'en-US',
      continuous: true
    },
    visualAdjustments: {
      fontSize: 100,
      fontFamily: 'default',
      lineHeight: 1.5
    },
    colorContrast: {
      theme: 'default',
      brightness: 100,
      contrast: 100
    },
    keyboardNavigation: {
      enabled: false,
      shortcuts: true
    },
    cognitiveSupport: {
      readingGuide: false,
      focusMode: false,
      reducedMotion: false,
      extraTime: 0
    }
  },
  
  // Acknowledgment Data
  acknowledgmentComplete: false,
  acknowledgmentData: null,
  acknowledgmentTimestamp: null,
  
  // Security & Monitoring
  securityLevel: 'standard', // standard, high, maximum
  monitoringEnabled: true,
  integrityScore: 100,
  violationHistory: [],
  
  // Error Handling
  errors: {},
  loading: {
    tokenValidation: false,
    faceVerification: false,
    systemChecks: false
  },
  
  // Exam Context
  examData: null,
  examSettings: {},
  
  // User Preferences
  preferences: {
    skipCountdown: false,
    autoSave: true,
    notifications: true,
    sound: true
  }
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_AUTH_STEP':
      return {
        ...state,
        authStep: action.payload,
        errors: {} // Clear errors when changing steps
      };

    case 'SET_TOKEN_DATA':
      return {
        ...state,
        token: action.payload.token,
        tokenDetails: action.payload.details,
        tokenValidated: true,
        sessionId: action.payload.sessionId || `session_${Date.now()}`
      };

    case 'SET_FACE_VERIFICATION':
      return {
        ...state,
        faceVerified: action.payload.verified,
        faceData: action.payload.data,
        biometricSession: action.payload.sessionId
      };

    case 'COMPLETE_AUTHENTICATION':
      return {
        ...state,
        isAuthenticated: true,
        sessionStartTime: Date.now(),
        authStep: 'exam'
      };

    case 'SET_ACCESSIBILITY_SETTINGS':
      return {
        ...state,
        accessibilitySettings: {
          ...state.accessibilitySettings,
          ...action.payload
        }
      };

    case 'UPDATE_ACCESSIBILITY_FEATURE':
      return {
        ...state,
        accessibilitySettings: {
          ...state.accessibilitySettings,
          [action.payload.category]: {
            ...state.accessibilitySettings[action.payload.category],
            ...action.payload.settings
          }
        }
      };

    case 'SET_ACKNOWLEDGMENT_DATA':
      return {
        ...state,
        acknowledgmentComplete: true,
        acknowledgmentData: action.payload.data,
        acknowledgmentTimestamp: action.payload.timestamp
      };

    case 'SET_EXAM_DATA':
      return {
        ...state,
        examData: action.payload.examData,
        examSettings: action.payload.settings || {}
      };

    case 'UPDATE_SESSION_DATA':
      return {
        ...state,
        sessionData: {
          ...state.sessionData,
          ...action.payload
        }
      };

    case 'RECORD_SECURITY_EVENT':
      const violation = {
        id: Date.now() + Math.random(),
        type: action.payload.type,
        severity: action.payload.severity,
        description: action.payload.description,
        timestamp: Date.now(),
        sessionId: state.sessionId
      };

      let newIntegrityScore = state.integrityScore;
      switch (action.payload.severity) {
        case 'critical': newIntegrityScore = Math.max(0, newIntegrityScore - 15); break;
        case 'high': newIntegrityScore = Math.max(0, newIntegrityScore - 10); break;
        case 'medium': newIntegrityScore = Math.max(0, newIntegrityScore - 5); break;
        case 'low': newIntegrityScore = Math.max(0, newIntegrityScore - 2); break;
      }

      return {
        ...state,
        integrityScore: newIntegrityScore,
        violationHistory: [...state.violationHistory, violation]
      };

    case 'SET_SECURITY_LEVEL':
      return {
        ...state,
        securityLevel: action.payload
      };

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
      const newErrors = { ...state.errors };
      delete newErrors[action.payload];
      return {
        ...state,
        errors: newErrors
      };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };

    case 'RESET_AUTH_STATE':
      return {
        ...initialState,
        preferences: state.preferences, // Keep user preferences
        accessibilitySettings: state.accessibilitySettings // Keep accessibility settings
      };

    case 'LOGOUT':
      return {
        ...initialState,
        authStep: 'entry'
      };

    default:
      return state;
  }
};

export const StudentAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    const savedAuthState = localStorage.getItem('student-auth-state');
    if (savedAuthState) {
      try {
        const parsedState = JSON.parse(savedAuthState);
        
        // Restore accessibility settings
        if (parsedState.accessibilitySettings) {
          dispatch({
            type: 'SET_ACCESSIBILITY_SETTINGS',
            payload: parsedState.accessibilitySettings
          });
        }

        // Restore preferences
        if (parsedState.preferences) {
          dispatch({
            type: 'UPDATE_PREFERENCES',
            payload: parsedState.preferences
          });
        }

        // Check if session is still valid (not older than 24 hours)
        const sessionAge = Date.now() - (parsedState.sessionStartTime || 0);
        const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours

        if (parsedState.isAuthenticated && sessionAge < maxSessionAge) {
          // Restore partial session state
          dispatch({
            type: 'SET_TOKEN_DATA',
            payload: {
              token: parsedState.token,
              details: parsedState.tokenDetails,
              sessionId: parsedState.sessionId
            }
          });
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      }
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    const stateToSave = {
      isAuthenticated: state.isAuthenticated,
      token: state.token,
      tokenDetails: state.tokenDetails,
      sessionId: state.sessionId,
      sessionStartTime: state.sessionStartTime,
      accessibilitySettings: state.accessibilitySettings,
      preferences: state.preferences,
      integrityScore: state.integrityScore
    };

    localStorage.setItem('student-auth-state', JSON.stringify(stateToSave));
  }, [
    state.isAuthenticated,
    state.token,
    state.tokenDetails,
    state.sessionId,
    state.sessionStartTime,
    state.accessibilitySettings,
    state.preferences,
    state.integrityScore
  ]);

  // Auto-logout on tab close or page unload
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (state.isAuthenticated && state.authStep === 'exam') {
        const message = 'You are currently taking an exam. Leaving now may result in automatic submission.';
        event.returnValue = message;
        return message;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && state.authStep === 'exam') {
        dispatch({
          type: 'RECORD_SECURITY_EVENT',
          payload: {
            type: 'tab_hidden',
            severity: 'medium',
            description: 'Student switched away from exam tab'
          }
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.isAuthenticated, state.authStep]);

  const value = {
    state,
    dispatch,
    
    // Convenience methods
    setAuthStep: (step) => dispatch({ type: 'SET_AUTH_STEP', payload: step }),
    
    setTokenData: (token, details) => dispatch({
      type: 'SET_TOKEN_DATA',
      payload: { token, details, sessionId: `session_${Date.now()}` }
    }),
    
    setFaceVerification: (verified, data) => dispatch({
      type: 'SET_FACE_VERIFICATION',
      payload: { verified, data, sessionId: `face_${Date.now()}` }
    }),
    
    completeAuthentication: () => dispatch({ type: 'COMPLETE_AUTHENTICATION' }),
    
    updateAccessibilitySettings: (settings) => dispatch({
      type: 'SET_ACCESSIBILITY_SETTINGS',
      payload: settings
    }),
    
    updateAccessibilityFeature: (category, settings) => dispatch({
      type: 'UPDATE_ACCESSIBILITY_FEATURE',
      payload: { category, settings }
    }),
    
    setAcknowledmentData: (data) => dispatch({
      type: 'SET_ACKNOWLEDGMENT_DATA',
      payload: { data, timestamp: new Date().toISOString() }
    }),
    
    setExamData: (examData, settings = {}) => dispatch({
      type: 'SET_EXAM_DATA',
      payload: { examData, settings }
    }),
    
    updateSessionData: (data) => dispatch({
      type: 'UPDATE_SESSION_DATA',
      payload: data
    }),
    
    recordSecurityEvent: (type, severity, description) => dispatch({
      type: 'RECORD_SECURITY_EVENT',
      payload: { type, severity, description }
    }),
    
    setSecurityLevel: (level) => dispatch({ type: 'SET_SECURITY_LEVEL', payload: level }),
    
    setLoading: (type, loading) => dispatch({
      type: 'SET_LOADING',
      payload: { type, loading }
    }),
    
    setError: (type, error) => dispatch({
      type: 'SET_ERROR',
      payload: { type, error }
    }),
    
    clearError: (type) => dispatch({ type: 'CLEAR_ERROR', payload: type }),
    
    updatePreferences: (preferences) => dispatch({
      type: 'UPDATE_PREFERENCES',
      payload: preferences
    }),
    
    logout: () => {
      localStorage.removeItem('student-auth-state');
      dispatch({ type: 'LOGOUT' });
    },
    
    resetAuthState: () => dispatch({ type: 'RESET_AUTH_STATE' }),
    
    // Utility methods
    hasPermission: (permission) => {
      switch (permission) {
        case 'camera':
          return state.faceVerified;
        case 'microphone':
          return state.accessibilitySettings.speechToText.enabled;
        case 'exam_access':
          return state.isAuthenticated && state.acknowledgmentComplete;
        default:
          return false;
      }
    },
    
    getSecurityStatus: () => {
      const recentViolations = state.violationHistory.filter(
        v => Date.now() - v.timestamp < 300000 // Last 5 minutes
      );
      
      return {
        integrityScore: state.integrityScore,
        recentViolations: recentViolations.length,
        securityLevel: state.securityLevel,
        canContinue: state.integrityScore >= 30
      };
    },
    
    getSessionDuration: () => {
      if (!state.sessionStartTime) return 0;
      return Math.floor((Date.now() - state.sessionStartTime) / 1000);
    }
  };

  return (
    <StudentAuthContext.Provider value={value}>
      {children}
    </StudentAuthContext.Provider>
  );
};

export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
};

export default StudentAuthContext;