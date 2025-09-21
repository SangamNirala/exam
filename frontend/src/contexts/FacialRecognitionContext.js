import React, { createContext, useContext, useReducer, useRef } from 'react';

const FacialRecognitionContext = createContext();

const initialState = {
  // Camera State
  cameraPermission: 'unknown', // unknown, granted, denied
  cameraStream: null,
  availableCameras: [],
  selectedCamera: null,
  cameraError: null,
  
  // Face Detection
  faceDetectionActive: false,
  currentFaceData: {
    detected: false,
    confidence: 0,
    position: { x: 0, y: 0, width: 0, height: 0 },
    landmarks: null,
    quality: {
      lighting: 0,
      sharpness: 0,
      positioning: 0,
      eyesOpen: false,
      frontalPose: false
    }
  },
  
  // Liveness Detection
  livenessActive: false,
  livenessChecks: {
    blink: { completed: false, attempts: 0, confidence: 0 },
    smile: { completed: false, attempts: 0, confidence: 0 },
    headTurn: { completed: false, attempts: 0, confidence: 0 }
  },
  currentLivenessCheck: null,
  
  // Image Capture
  capturedImages: [],
  bestCaptureImage: null,
  captureInProgress: false,
  
  // Verification Results
  verificationComplete: false,
  verificationScore: 0,
  verificationData: null,
  
  // Anti-Spoofing
  antiSpoofingActive: true,
  spoofingAttempts: [],
  
  // Settings
  settings: {
    minFaceSize: 100,
    maxFaceAge: 300000, // 5 minutes
    confidenceThreshold: 0.8,
    qualityThreshold: 0.7,
    autoCapture: true,
    captureDelay: 1000,
    livenessRequired: true,
    antiSpoofingLevel: 'medium'
  },
  
  // Performance
  processingStats: {
    fps: 0,
    avgProcessingTime: 0,
    frameCount: 0,
    lastFrameTime: 0
  },
  
  // Error Handling
  errors: {},
  loading: false
};

const faceRecognitionReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CAMERA_PERMISSION':
      return {
        ...state,
        cameraPermission: action.payload.status,
        cameraError: action.payload.error || null
      };

    case 'SET_CAMERA_STREAM':
      return {
        ...state,
        cameraStream: action.payload.stream,
        availableCameras: action.payload.cameras || state.availableCameras,
        selectedCamera: action.payload.selectedCamera || state.selectedCamera
      };

    case 'SET_AVAILABLE_CAMERAS':
      return {
        ...state,
        availableCameras: action.payload,
        selectedCamera: state.selectedCamera || (action.payload.length > 0 ? action.payload[0] : null)
      };

    case 'SELECT_CAMERA':
      return {
        ...state,
        selectedCamera: action.payload
      };

    case 'START_FACE_DETECTION':
      return {
        ...state,
        faceDetectionActive: true,
        errors: { ...state.errors, faceDetection: null }
      };

    case 'STOP_FACE_DETECTION':
      return {
        ...state,
        faceDetectionActive: false
      };

    case 'UPDATE_FACE_DATA':
      return {
        ...state,
        currentFaceData: {
          ...state.currentFaceData,
          ...action.payload,
          lastUpdate: Date.now()
        }
      };

    case 'START_LIVENESS_DETECTION':
      return {
        ...state,
        livenessActive: true,
        currentLivenessCheck: action.payload.startWith || 'blink'
      };

    case 'STOP_LIVENESS_DETECTION':
      return {
        ...state,
        livenessActive: false,
        currentLivenessCheck: null
      };

    case 'UPDATE_LIVENESS_CHECK':
      const checkType = action.payload.type;
      return {
        ...state,
        livenessChecks: {
          ...state.livenessChecks,
          [checkType]: {
            ...state.livenessChecks[checkType],
            ...action.payload.data
          }
        }
      };

    case 'SET_CURRENT_LIVENESS_CHECK':
      return {
        ...state,
        currentLivenessCheck: action.payload
      };

    case 'START_CAPTURE':
      return {
        ...state,
        captureInProgress: true
      };

    case 'ADD_CAPTURED_IMAGE':
      const newImages = [...state.capturedImages, action.payload];
      const bestImage = newImages.reduce((best, current) => 
        (current.quality?.overall || 0) > (best.quality?.overall || 0) ? current : best
      );
      
      return {
        ...state,
        capturedImages: newImages,
        bestCaptureImage: bestImage,
        captureInProgress: false
      };

    case 'SET_BEST_CAPTURE':
      return {
        ...state,
        bestCaptureImage: action.payload
      };

    case 'COMPLETE_VERIFICATION':
      return {
        ...state,
        verificationComplete: true,
        verificationScore: action.payload.score,
        verificationData: action.payload.data,
        faceDetectionActive: false,
        livenessActive: false
      };

    case 'RECORD_SPOOFING_ATTEMPT':
      return {
        ...state,
        spoofingAttempts: [
          ...state.spoofingAttempts,
          {
            id: Date.now(),
            type: action.payload.type,
            confidence: action.payload.confidence,
            timestamp: Date.now()
          }
        ]
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };

    case 'UPDATE_PROCESSING_STATS':
      const frameCount = state.processingStats.frameCount + 1;
      const avgProcessingTime = (state.processingStats.avgProcessingTime * (frameCount - 1) + action.payload.processingTime) / frameCount;
      const currentTime = Date.now();
      const fps = frameCount > 1 ? 1000 / (currentTime - state.processingStats.lastFrameTime) : 0;
      
      return {
        ...state,
        processingStats: {
          fps: Math.round(fps),
          avgProcessingTime: Math.round(avgProcessingTime),
          frameCount,
          lastFrameTime: currentTime
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

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'RESET_STATE':
      return {
        ...initialState,
        settings: state.settings // Preserve settings
      };

    case 'RESET_CAPTURE_DATA':
      return {
        ...state,
        capturedImages: [],
        bestCaptureImage: null,
        captureInProgress: false
      };

    case 'RESET_LIVENESS_DATA':
      return {
        ...state,
        livenessChecks: {
          blink: { completed: false, attempts: 0, confidence: 0 },
          smile: { completed: false, attempts: 0, confidence: 0 },
          headTurn: { completed: false, attempts: 0, confidence: 0 }
        },
        livenessActive: false,
        currentLivenessCheck: null
      };

    default:
      return state;
  }
};

export const FacialRecognitionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(faceRecognitionReducer, initialState);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const value = {
    state,
    dispatch,
    
    // Camera Management
    requestCameraPermission: async (preferredDeviceId = null) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const constraints = {
          video: preferredDeviceId 
            ? { deviceId: { exact: preferredDeviceId } }
            : { facingMode: 'user' }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
        // Get available cameras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        
        const selectedCamera = cameras.find(cam => 
          stream.getVideoTracks()[0].getSettings().deviceId === cam.deviceId
        ) || cameras[0];
        
        dispatch({
          type: 'SET_CAMERA_PERMISSION',
          payload: { status: 'granted' }
        });
        
        dispatch({
          type: 'SET_CAMERA_STREAM',
          payload: { stream, cameras, selectedCamera }
        });
        
        return { success: true, stream, cameras };
      } catch (error) {
        console.error('Camera access error:', error);
        dispatch({
          type: 'SET_CAMERA_PERMISSION',
          payload: { status: 'denied', error: error.message }
        });
        
        dispatch({
          type: 'SET_ERROR',
          payload: { type: 'camera', error: error.message }
        });
        
        return { success: false, error: error.message };
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    
    switchCamera: async (deviceId) => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      return await value.requestCameraPermission(deviceId);
    },
    
    stopCamera: () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      
      dispatch({
        type: 'SET_CAMERA_STREAM',
        payload: { stream: null }
      });
      
      dispatch({ type: 'STOP_FACE_DETECTION' });
    },
    
    // Face Detection
    startFaceDetection: () => {
      dispatch({ type: 'START_FACE_DETECTION' });
      
      // Start detection loop
      detectionIntervalRef.current = setInterval(() => {
        if (streamRef.current) {
          value.performFaceDetection();
        }
      }, 100); // 10 FPS
    },
    
    stopFaceDetection: () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      
      dispatch({ type: 'STOP_FACE_DETECTION' });
    },
    
    performFaceDetection: () => {
      const startTime = Date.now();
      
      // Simulate face detection (replace with actual implementation)
      const mockDetection = {
        detected: Math.random() > 0.1,
        confidence: Math.random() * 0.4 + 0.6,
        position: {
          x: Math.random() * 100,
          y: Math.random() * 100,
          width: Math.random() * 200 + 100,
          height: Math.random() * 250 + 120
        },
        quality: {
          lighting: Math.random() * 40 + 60,
          sharpness: Math.random() * 30 + 70,
          positioning: Math.random() * 25 + 75,
          eyesOpen: Math.random() > 0.2,
          frontalPose: Math.random() > 0.3
        }
      };
      
      dispatch({
        type: 'UPDATE_FACE_DATA',
        payload: mockDetection
      });
      
      // Update processing stats
      dispatch({
        type: 'UPDATE_PROCESSING_STATS',
        payload: { processingTime: Date.now() - startTime }
      });
      
      // Check for spoofing
      if (mockDetection.detected && state.antiSpoofingActive) {
        value.performAntiSpoofingCheck(mockDetection);
      }
    },
    
    // Liveness Detection
    startLivenessDetection: (startWith = 'blink') => {
      dispatch({
        type: 'START_LIVENESS_DETECTION',
        payload: { startWith }
      });
    },
    
    stopLivenessDetection: () => {
      dispatch({ type: 'STOP_LIVENESS_DETECTION' });
    },
    
    performLivenessCheck: async (checkType, duration = 3000) => {
      dispatch({
        type: 'UPDATE_LIVENESS_CHECK',
        payload: {
          type: checkType,
          data: { attempts: state.livenessChecks[checkType].attempts + 1 }
        }
      });
      
      // Simulate liveness check
      await new Promise(resolve => setTimeout(resolve, duration));
      
      const success = Math.random() > 0.2; // 80% success rate
      const confidence = success ? Math.random() * 0.3 + 0.7 : Math.random() * 0.5;
      
      dispatch({
        type: 'UPDATE_LIVENESS_CHECK',
        payload: {
          type: checkType,
          data: {
            completed: success,
            confidence: confidence,
            timestamp: Date.now()
          }
        }
      });
      
      return { success, confidence };
    },
    
    // Anti-Spoofing
    performAntiSpoofingCheck: (faceData) => {
      // Simple spoofing detection based on quality metrics
      const spoofingScore = (
        faceData.quality.lighting +
        faceData.quality.sharpness +
        faceData.quality.positioning
      ) / 3;
      
      if (spoofingScore < 50) {
        dispatch({
          type: 'RECORD_SPOOFING_ATTEMPT',
          payload: {
            type: 'poor_quality',
            confidence: 100 - spoofingScore
          }
        });
      }
      
      // Check for static image (very high quality consistently)
      if (spoofingScore > 95) {
        dispatch({
          type: 'RECORD_SPOOFING_ATTEMPT',
          payload: {
            type: 'static_image',
            confidence: spoofingScore - 80
          }
        });
      }
    },
    
    // Image Capture
    captureImage: (video, canvas) => {
      if (!video || !canvas) return null;
      
      dispatch({ type: 'START_CAPTURE' });
      
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = {
        id: Date.now(),
        dataUrl: canvas.toDataURL('image/jpeg', 0.85),
        blob: null,
        timestamp: Date.now(),
        faceData: { ...state.currentFaceData },
        quality: {
          overall: (
            state.currentFaceData.quality.lighting +
            state.currentFaceData.quality.sharpness +
            state.currentFaceData.quality.positioning
          ) / 3,
          ...state.currentFaceData.quality
        }
      };
      
      // Convert to blob
      canvas.toBlob((blob) => {
        imageData.blob = blob;
        
        dispatch({
          type: 'ADD_CAPTURED_IMAGE',
          payload: imageData
        });
      }, 'image/jpeg', 0.85);
      
      return imageData;
    },
    
    // Verification
    completeVerification: () => {
      const hasValidCapture = state.bestCaptureImage && 
        state.bestCaptureImage.quality.overall > state.settings.qualityThreshold * 100;
      
      const livenessScore = Object.values(state.livenessChecks)
        .filter(check => check.completed)
        .reduce((sum, check) => sum + check.confidence, 0) / 3;
      
      const spoofingPenalty = Math.min(state.spoofingAttempts.length * 10, 30);
      
      const finalScore = hasValidCapture ? 
        Math.max(0, Math.min(100, livenessScore * 100 - spoofingPenalty)) : 0;
      
      const verificationData = {
        faceImage: state.bestCaptureImage,
        livenessChecks: state.livenessChecks,
        spoofingAttempts: state.spoofingAttempts,
        processingStats: state.processingStats,
        timestamp: new Date().toISOString(),
        sessionId: `verification_${Date.now()}`
      };
      
      dispatch({
        type: 'COMPLETE_VERIFICATION',
        payload: { score: finalScore, data: verificationData }
      });
      
      return { score: finalScore, data: verificationData };
    },
    
    // Utility Methods
    updateSettings: (newSettings) => {
      dispatch({
        type: 'UPDATE_SETTINGS',
        payload: newSettings
      });
    },
    
    setError: (type, error) => {
      dispatch({
        type: 'SET_ERROR',
        payload: { type, error }
      });
    },
    
    clearError: (type) => {
      dispatch({ type: 'CLEAR_ERROR', payload: type });
    },
    
    resetState: () => {
      value.stopCamera();
      dispatch({ type: 'RESET_STATE' });
    },
    
    resetCaptureData: () => {
      dispatch({ type: 'RESET_CAPTURE_DATA' });
    },
    
    resetLivenessData: () => {
      dispatch({ type: 'RESET_LIVENESS_DATA' });
    },
    
    // Status Getters
    getFaceQualityScore: () => {
      if (!state.currentFaceData.detected) return 0;
      
      const quality = state.currentFaceData.quality;
      return Math.round((quality.lighting + quality.sharpness + quality.positioning) / 3);
    },
    
    getLivenessProgress: () => {
      const completed = Object.values(state.livenessChecks)
        .filter(check => check.completed).length;
      return Math.round((completed / 3) * 100);
    },
    
    getVerificationReadiness: () => {
      const faceQuality = value.getFaceQualityScore();
      const livenessProgress = value.getLivenessProgress();
      
      return {
        ready: faceQuality >= 70 && livenessProgress >= 67, // 2/3 liveness checks
        faceQuality,
        livenessProgress,
        spoofingAttempts: state.spoofingAttempts.length
      };
    }
  };

  return (
    <FacialRecognitionContext.Provider value={value}>
      {children}
    </FacialRecognitionContext.Provider>
  );
};

export const useFacialRecognition = () => {
  const context = useContext(FacialRecognitionContext);
  if (!context) {
    throw new Error('useFacialRecognition must be used within a FacialRecognitionProvider');
  }
  return context;
};

export default FacialRecognitionContext;