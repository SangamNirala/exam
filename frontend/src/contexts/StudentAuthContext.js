import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const StudentAuthContext = createContext();

// Initial state
const initialState = {
  // Authentication State
  isAuthenticated: false,
  currentStep: 'entry', // entry, token, instructions, exam (faceSetup and faceCapture removed)
  authToken: null,
  examInfo: null,
  sessionId: null,
  
  // Token Validation State
  tokenValidation: {
    isValidating: false,
    error: null,
    attempts: 0,
    maxAttempts: 5
  },
  
  // Face Recognition State - COMMENTED OUT: Face verification disabled
  // faceRecognition: {
  //   cameraReady: false,
  //   isCapturing: false,
  //   capturedImage: null,
  //   verificationResult: null,
  //   confidence: 0,
  //   error: null
  // },
  
  // User Data
  studentInfo: {
    name: null,
    tokenId: null
  },
  
  // UI State
  loading: false,
  error: null
};

// Action types
const ACTIONS = {
  SET_STEP: 'SET_STEP',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  
  // Token actions
  START_TOKEN_VALIDATION: 'START_TOKEN_VALIDATION',
  TOKEN_VALIDATION_SUCCESS: 'TOKEN_VALIDATION_SUCCESS',
  TOKEN_VALIDATION_ERROR: 'TOKEN_VALIDATION_ERROR',
  RESET_TOKEN_VALIDATION: 'RESET_TOKEN_VALIDATION',
  
  // Face recognition actions - COMMENTED OUT: Face verification disabled
  // SET_CAMERA_READY: 'SET_CAMERA_READY',
  // START_FACE_CAPTURE: 'START_FACE_CAPTURE',
  // FACE_CAPTURE_SUCCESS: 'FACE_CAPTURE_SUCCESS',
  // FACE_VERIFICATION_SUCCESS: 'FACE_VERIFICATION_SUCCESS',
  // FACE_VERIFICATION_ERROR: 'FACE_VERIFICATION_ERROR',
  // RESET_FACE_RECOGNITION: 'RESET_FACE_RECOGNITION',
  
  // Authentication actions
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  RESET_AUTH: 'RESET_AUTH'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_STEP:
      return { ...state, currentStep: action.payload };
    
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    
    // Token validation
    case ACTIONS.START_TOKEN_VALIDATION:
      return {
        ...state,
        tokenValidation: {
          ...state.tokenValidation,
          isValidating: true,
          error: null,
          attempts: state.tokenValidation.attempts + 1
        }
      };
    
    case ACTIONS.TOKEN_VALIDATION_SUCCESS:
      return {
        ...state,
        authToken: action.payload.token,
        examInfo: action.payload.examInfo,
        studentInfo: {
          ...state.studentInfo,
          name: action.payload.studentInfo.name,
          tokenId: action.payload.studentInfo.id
        },
        tokenValidation: {
          ...state.tokenValidation,
          isValidating: false,
          error: null
        }
      };
    
    case ACTIONS.TOKEN_VALIDATION_ERROR:
      return {
        ...state,
        tokenValidation: {
          ...state.tokenValidation,
          isValidating: false,
          error: action.payload
        }
      };
    
    case ACTIONS.RESET_TOKEN_VALIDATION:
      return {
        ...state,
        tokenValidation: {
          ...initialState.tokenValidation
        }
      };
    
    // Face recognition - COMMENTED OUT: Face verification disabled
    // case ACTIONS.SET_CAMERA_READY:
    //   return {
    //     ...state,
    //     faceRecognition: {
    //       ...state.faceRecognition,
    //       cameraReady: action.payload
    //     }
    //   };
    
    // case ACTIONS.START_FACE_CAPTURE:
    //   return {
    //     ...state,
    //     faceRecognition: {
    //       ...state.faceRecognition,
    //       isCapturing: true,
    //       error: null
    //     }
    //   };
    
    // case ACTIONS.FACE_CAPTURE_SUCCESS:
    //   return {
    //     ...state,
    //     faceRecognition: {
    //       ...state.faceRecognition,
    //       isCapturing: false,
    //       capturedImage: action.payload,
    //       error: null
    //     }
    //   };
    
    // case ACTIONS.FACE_VERIFICATION_SUCCESS:
    //   return {
    //     ...state,
    //     sessionId: action.payload.sessionId,
    //     faceRecognition: {
    //       ...state.faceRecognition,
    //       verificationResult: 'verified',
    //       confidence: action.payload.confidence,
    //       error: null
    //     }
    //   };
    
    // case ACTIONS.FACE_VERIFICATION_ERROR:
    //   return {
    //     ...state,
    //     faceRecognition: {
    //       ...state.faceRecognition,
    //       verificationResult: 'failed',
    //       confidence: action.payload.confidence || 0,
    //       error: action.payload.message
    //     }
    //   };
    
    // case ACTIONS.RESET_FACE_RECOGNITION:
    //   return {
    //     ...state,
    //     faceRecognition: {
    //       ...initialState.faceRecognition
    //     }
    //   };
    
    // Authentication
    case ACTIONS.SET_AUTHENTICATED:
      return {
        ...state,
        isAuthenticated: action.payload
      };
    
    case ACTIONS.RESET_AUTH:
      return initialState;
    
    default:
      return state;
  }
};

// Provider component
export const StudentAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Get backend URL from environment
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  
  // Action creators
  const setStep = (step) => {
    dispatch({ type: ACTIONS.SET_STEP, payload: step });
  };
  
  const setLoading = (loading) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
  };
  
  const setError = (error) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error });
  };
  
  // Token validation
  const validateToken = async (token) => {
    dispatch({ type: ACTIONS.START_TOKEN_VALIDATION });
    
    try {
      const response = await axios.post(`${backendUrl}/api/student/validate-token`, {
        token: token.trim()
      });
      
      if (response.data.valid) {
        dispatch({ 
          type: ACTIONS.TOKEN_VALIDATION_SUCCESS, 
          payload: {
            token: token.trim(),
            examInfo: response.data.exam_info,
            studentInfo: response.data.student_token
          }
        });
        return { success: true, data: response.data };
      } else {
        dispatch({ 
          type: ACTIONS.TOKEN_VALIDATION_ERROR, 
          payload: response.data.message 
        });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Network error. Please try again.';
      dispatch({ 
        type: ACTIONS.TOKEN_VALIDATION_ERROR, 
        payload: errorMessage 
      });
      return { success: false, message: errorMessage };
    }
  };
  
  // Face verification - COMMENTED OUT: Face verification disabled
  // const verifyFace = async (imageData) => {
  //   if (!state.authToken) {
  //     throw new Error('No valid token found');
  //   }
  //   
  //   try {
  //     const response = await axios.post(`${backendUrl}/api/student/face-verification`, {
  //       token: state.authToken,
  //       face_image_data: imageData,
  //       confidence_threshold: 0.8
  //     });
  //     
  //     if (response.data.verified) {
  //       dispatch({
  //         type: ACTIONS.FACE_VERIFICATION_SUCCESS,
  //         payload: {
  //           sessionId: response.data.session_id,
  //           confidence: response.data.confidence
  //         }
  //       });
  //       return { success: true, data: response.data };
  //     } else {
  //       dispatch({
  //         type: ACTIONS.FACE_VERIFICATION_ERROR,
  //         payload: {
  //           message: response.data.message,
  //           confidence: response.data.confidence
  //         }
  //       });
  //       return { success: false, message: response.data.message };
  //     }
  //   } catch (error) {
  //     const errorMessage = error.response?.data?.detail || 'Face verification failed. Please try again.';
  //     dispatch({
  //       type: ACTIONS.FACE_VERIFICATION_ERROR,
  //       payload: { message: errorMessage }
  //     });
  //     return { success: false, message: errorMessage };
  //   }
  // };
  
  // Camera management - COMMENTED OUT: Face verification disabled
  // const setCameraReady = (ready) => {
  //   dispatch({ type: ACTIONS.SET_CAMERA_READY, payload: ready });
  // };
  
  // const startFaceCapture = () => {
  //   dispatch({ type: ACTIONS.START_FACE_CAPTURE });
  // };
  
  // const completeFaceCapture = (imageData) => {
  //   dispatch({ type: ACTIONS.FACE_CAPTURE_SUCCESS, payload: imageData });
  // };
  
  // Reset functions
  const resetTokenValidation = () => {
    dispatch({ type: ACTIONS.RESET_TOKEN_VALIDATION });
  };
  
  const resetFaceRecognition = () => {
    // COMMENTED OUT: Face verification disabled
    // dispatch({ type: ACTIONS.RESET_FACE_RECOGNITION });
  };
  
  const resetAuth = () => {
    dispatch({ type: ACTIONS.RESET_AUTH });
  };
  
  // Complete authentication - MODIFIED: Skip face verification
  const completeAuthentication = () => {
    dispatch({ type: ACTIONS.SET_AUTHENTICATED, payload: true });
    setStep('instructions');
  };
  
  // Create demo tokens (for testing)
  const createDemoTokens = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/student/create-demo-token`);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to create demo tokens';
      return { success: false, message: errorMessage };
    }
  };
  
  // Context value
  const value = {
    // State
    state,
    
    // Step management
    setStep,
    setLoading,
    setError,
    
    // Token validation
    validateToken,
    resetTokenValidation,
    
    // Face recognition
    verifyFace,
    setCameraReady,
    startFaceCapture,
    completeFaceCapture,
    resetFaceRecognition,
    
    // Authentication
    completeAuthentication,
    resetAuth,
    
    // Utilities
    createDemoTokens
  };
  
  return (
    <StudentAuthContext.Provider value={value}>
      {children}
    </StudentAuthContext.Provider>
  );
};

// Hook to use the context
export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
};