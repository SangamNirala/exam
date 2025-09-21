import React, { createContext, useContext, useReducer, useRef } from 'react';

const ExamMonitoringContext = createContext();

const initialState = {
  // Monitoring Status
  isActive: false,
  sessionId: null,
  startTime: null,
  
  // Real-time Detection
  currentDetections: {
    face: { status: 'unknown', confidence: 0, timestamp: null },
    eyes: { status: 'unknown', focusLevel: 0, timestamp: null },
    head: { position: 'center', movement: 'stable', timestamp: null },
    audio: { level: 0, speaking: false, timestamp: null },
    multipleFaces: { count: 0, detected: false, timestamp: null }
  },
  
  // Behavioral Analysis
  behaviorMetrics: {
    attentionScore: 100,
    stabilityScore: 100,
    integrityScore: 100,
    overallScore: 100,
    trend: 'stable'
  },
  
  // Violation Tracking
  violations: [],
  violationCounts: {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  },
  
  // System Monitoring
  systemStatus: {
    camera: 'unknown',
    microphone: 'unknown',
    network: 'unknown',
    browser: 'unknown',
    performance: 'unknown'
  },
  
  // Tab and Focus Monitoring
  tabFocus: {
    focused: true,
    switchCount: 0,
    lastSwitch: null,
    unfocusedDuration: 0
  },
  
  // Network Monitoring
  networkStats: {
    connected: true,
    quality: 'excellent',
    downtime: 0,
    lastCheck: null
  },
  
  // Configuration
  config: {
    detectionInterval: 1000, // ms
    violationThresholds: {
      faceConfidence: 0.6,
      attentionLevel: 0.4,
      audioThreshold: 50,
      maxUnfocusedTime: 10000 // 10 seconds
    },
    enabledChecks: {
      faceDetection: true,
      eyeTracking: true,
      audioMonitoring: true,
      tabFocus: true,
      networkMonitoring: true,
      multipleFaceDetection: true
    },
    alertLevels: {
      critical: { threshold: 3, action: 'immediate' },
      high: { threshold: 5, action: 'warning' },
      medium: { threshold: 10, action: 'log' }
    }
  },
  
  // Statistics
  stats: {
    totalDetections: 0,
    averageConfidence: 0,
    uptime: 0,
    dataPoints: 0,
    lastUpdate: null
  },
  
  // Alerts and Notifications
  alerts: [],
  notifications: [],
  
  // Performance
  performance: {
    fps: 0,
    processingTime: 0,
    memoryUsage: 0,
    cpuUsage: 0
  }
};

const monitoringReducer = (state, action) => {
  switch (action.type) {
    case 'START_MONITORING':
      return {
        ...state,
        isActive: true,
        sessionId: action.payload.sessionId || `monitor_${Date.now()}`,
        startTime: Date.now()
      };

    case 'STOP_MONITORING':
      return {
        ...state,
        isActive: false
      };

    case 'UPDATE_FACE_DETECTION':
      const faceData = action.payload;
      return {
        ...state,
        currentDetections: {
          ...state.currentDetections,
          face: {
            status: faceData.detected ? 'detected' : 'lost',
            confidence: faceData.confidence || 0,
            timestamp: Date.now()
          }
        }
      };

    case 'UPDATE_EYE_TRACKING':
      return {
        ...state,
        currentDetections: {
          ...state.currentDetections,
          eyes: {
            status: action.payload.focused ? 'focused' : 'distracted',
            focusLevel: action.payload.focusLevel || 0,
            timestamp: Date.now()
          }
        }
      };

    case 'UPDATE_HEAD_POSITION':
      return {
        ...state,
        currentDetections: {
          ...state.currentDetections,
          head: {
            position: action.payload.position || 'center',
            movement: action.payload.movement || 'stable',
            timestamp: Date.now()
          }
        }
      };

    case 'UPDATE_AUDIO_LEVEL':
      return {
        ...state,
        currentDetections: {
          ...state.currentDetections,
          audio: {
            level: action.payload.level || 0,
            speaking: action.payload.speaking || false,
            timestamp: Date.now()
          }
        }
      };

    case 'UPDATE_MULTIPLE_FACES':
      return {
        ...state,
        currentDetections: {
          ...state.currentDetections,
          multipleFaces: {
            count: action.payload.count || 0,
            detected: (action.payload.count || 0) > 1,
            timestamp: Date.now()
          }
        }
      };

    case 'RECORD_VIOLATION':
      const violation = {
        id: Date.now() + Math.random(),
        type: action.payload.type,
        severity: action.payload.severity,
        description: action.payload.description,
        timestamp: Date.now(),
        sessionId: state.sessionId,
        metadata: action.payload.metadata || {}
      };

      const newViolationCounts = {
        ...state.violationCounts,
        [action.payload.severity]: state.violationCounts[action.payload.severity] + 1
      };

      return {
        ...state,
        violations: [...state.violations, violation],
        violationCounts: newViolationCounts
      };

    case 'UPDATE_BEHAVIOR_METRICS':
      const metrics = action.payload;
      return {
        ...state,
        behaviorMetrics: {
          ...state.behaviorMetrics,
          ...metrics,
          overallScore: Math.round(
            (metrics.attentionScore + metrics.stabilityScore + metrics.integrityScore) / 3
          )
        }
      };

    case 'UPDATE_SYSTEM_STATUS':
      return {
        ...state,
        systemStatus: {
          ...state.systemStatus,
          ...action.payload
        }
      };

    case 'UPDATE_TAB_FOCUS':
      const focusData = action.payload;
      return {
        ...state,
        tabFocus: {
          ...state.tabFocus,
          focused: focusData.focused,
          switchCount: focusData.focused ? state.tabFocus.switchCount : state.tabFocus.switchCount + 1,
          lastSwitch: focusData.focused ? state.tabFocus.lastSwitch : Date.now(),
          unfocusedDuration: focusData.focused ? 0 : 
            (state.tabFocus.lastSwitch ? Date.now() - state.tabFocus.lastSwitch : 0)
        }
      };

    case 'UPDATE_NETWORK_STATUS':
      return {
        ...state,
        networkStats: {
          ...state.networkStats,
          ...action.payload,
          lastCheck: Date.now()
        }
      };

    case 'ADD_ALERT':
      const alert = {
        id: Date.now() + Math.random(),
        type: action.payload.type,
        severity: action.payload.severity,
        message: action.payload.message,
        timestamp: Date.now(),
        read: false
      };

      return {
        ...state,
        alerts: [...state.alerts.slice(-9), alert] // Keep only last 10 alerts
      };

    case 'MARK_ALERT_READ':
      return {
        ...state,
        alerts: state.alerts.map(alert =>
          alert.id === action.payload ? { ...alert, read: true } : alert
        )
      };

    case 'ADD_NOTIFICATION':
      const notification = {
        id: Date.now() + Math.random(),
        message: action.payload.message,
        type: action.payload.type || 'info',
        timestamp: Date.now(),
        duration: action.payload.duration || 5000
      };

      return {
        ...state,
        notifications: [...state.notifications.slice(-4), notification]
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case 'UPDATE_STATS':
      const statsUpdate = action.payload;
      const newDataPoints = state.stats.dataPoints + 1;
      
      return {
        ...state,
        stats: {
          totalDetections: state.stats.totalDetections + (statsUpdate.detectionCount || 0),
          averageConfidence: statsUpdate.confidence ? 
            (state.stats.averageConfidence * (newDataPoints - 1) + statsUpdate.confidence) / newDataPoints :
            state.stats.averageConfidence,
          uptime: state.startTime ? Date.now() - state.startTime : 0,
          dataPoints: newDataPoints,
          lastUpdate: Date.now()
        }
      };

    case 'UPDATE_PERFORMANCE':
      return {
        ...state,
        performance: {
          ...state.performance,
          ...action.payload
        }
      };

    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: {
          ...state.config,
          ...action.payload
        }
      };

    case 'RESET_SESSION':
      return {
        ...initialState,
        config: state.config // Preserve configuration
      };

    default:
      return state;
  }
};

export const ExamMonitoringProvider = ({ children }) => {
  const [state, dispatch] = useReducer(monitoringReducer, initialState);
  const intervalRefs = useRef({});
  const streamRef = useRef(null);

  const value = {
    state,
    dispatch,

    // Core Monitoring Control
    startMonitoring: (sessionId) => {
      dispatch({
        type: 'START_MONITORING',
        payload: { sessionId }
      });

      // Start various monitoring intervals
      value.startFaceDetection();
      value.startSystemMonitoring();
      value.startNetworkMonitoring();
      value.enableTabFocusMonitoring();
    },

    stopMonitoring: () => {
      // Clear all intervals
      Object.values(intervalRefs.current).forEach(interval => {
        if (interval) clearInterval(interval);
      });
      intervalRefs.current = {};

      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      dispatch({ type: 'STOP_MONITORING' });
    },

    // Face Detection Monitoring
    startFaceDetection: async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        streamRef.current = stream;

        intervalRefs.current.faceDetection = setInterval(() => {
          value.performFaceDetection();
          value.performAudioAnalysis();
        }, state.config.detectionInterval);

        dispatch({
          type: 'UPDATE_SYSTEM_STATUS',
          payload: { camera: 'active', microphone: 'active' }
        });

      } catch (error) {
        console.error('Failed to start face detection:', error);
        dispatch({
          type: 'UPDATE_SYSTEM_STATUS',
          payload: { camera: 'error', microphone: 'error' }
        });

        value.addAlert('camera_error', 'high', 'Failed to access camera for monitoring');
      }
    },

    performFaceDetection: () => {
      // Simulate face detection
      const faceDetected = Math.random() > 0.05; // 95% detection rate
      const confidence = faceDetected ? Math.random() * 0.4 + 0.6 : 0;
      const multipleFaces = Math.random() > 0.98; // 2% chance

      dispatch({
        type: 'UPDATE_FACE_DETECTION',
        payload: { detected: faceDetected, confidence }
      });

      dispatch({
        type: 'UPDATE_MULTIPLE_FACES',
        payload: { count: multipleFaces ? Math.floor(Math.random() * 2) + 2 : 1 }
      });

      // Simulate eye tracking
      const focusLevel = Math.random() * 40 + 60; // 60-100%
      dispatch({
        type: 'UPDATE_EYE_TRACKING',
        payload: { focused: focusLevel > 50, focusLevel }
      });

      // Simulate head position
      const positions = ['center', 'left', 'right', 'up', 'down'];
      const movements = ['stable', 'slight', 'excessive'];
      
      dispatch({
        type: 'UPDATE_HEAD_POSITION',
        payload: {
          position: positions[Math.floor(Math.random() * positions.length)],
          movement: movements[Math.floor(Math.random() * movements.length)]
        }
      });

      // Check for violations
      if (!faceDetected) {
        value.recordViolation('face_not_detected', 'high', 'Face not visible to camera');
      }

      if (multipleFaces) {
        value.recordViolation('multiple_faces', 'critical', 'Multiple people detected');
      }

      if (focusLevel < 40) {
        value.recordViolation('low_attention', 'medium', 'Low attention detected');
      }

      // Update stats
      dispatch({
        type: 'UPDATE_STATS',
        payload: { detectionCount: 1, confidence }
      });
    },

    performAudioAnalysis: () => {
      // Simulate audio level monitoring
      const audioLevel = Math.random() * 100;
      const speaking = audioLevel > 30;

      dispatch({
        type: 'UPDATE_AUDIO_LEVEL',
        payload: { level: audioLevel, speaking }
      });

      // Check for conversation
      if (audioLevel > state.config.violationThresholds.audioThreshold) {
        value.recordViolation('high_audio', 'medium', 'Sustained audio detected - possible conversation');
      }
    },

    // System Monitoring
    startSystemMonitoring: () => {
      intervalRefs.current.systemMonitoring = setInterval(() => {
        // Check browser performance
        const performance = {
          fps: Math.floor(Math.random() * 10) + 55, // 55-65 FPS
          processingTime: Math.floor(Math.random() * 20) + 5, // 5-25ms
          memoryUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
          cpuUsage: Math.floor(Math.random() * 40) + 20 // 20-60%
        };

        dispatch({ type: 'UPDATE_PERFORMANCE', payload: performance });

        // Update system status
        dispatch({
          type: 'UPDATE_SYSTEM_STATUS',
          payload: {
            browser: 'active',
            performance: performance.cpuUsage < 80 ? 'good' : 'stressed'
          }
        });
      }, 5000); // Check every 5 seconds
    },

    // Network Monitoring
    startNetworkMonitoring: () => {
      intervalRefs.current.networkMonitoring = setInterval(async () => {
        try {
          const startTime = Date.now();
          await fetch('/api/status', { method: 'HEAD' });
          const latency = Date.now() - startTime;

          const quality = latency < 100 ? 'excellent' :
                         latency < 300 ? 'good' :
                         latency < 500 ? 'fair' : 'poor';

          dispatch({
            type: 'UPDATE_NETWORK_STATUS',
            payload: { connected: true, quality, latency }
          });

          dispatch({
            type: 'UPDATE_SYSTEM_STATUS',
            payload: { network: 'connected' }
          });

        } catch (error) {
          dispatch({
            type: 'UPDATE_NETWORK_STATUS',
            payload: { connected: false, quality: 'disconnected' }
          });

          dispatch({
            type: 'UPDATE_SYSTEM_STATUS',
            payload: { network: 'disconnected' }
          });

          value.recordViolation('network_disconnect', 'high', 'Network connection lost');
        }
      }, 10000); // Check every 10 seconds
    },

    // Tab Focus Monitoring
    enableTabFocusMonitoring: () => {
      const handleVisibilityChange = () => {
        const focused = !document.hidden;
        
        dispatch({
          type: 'UPDATE_TAB_FOCUS',
          payload: { focused }
        });

        if (!focused) {
          value.recordViolation('tab_switch', 'medium', 'Student switched away from exam tab');
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Store cleanup function
      intervalRefs.current.tabFocusCleanup = () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    },

    // Violation Management
    recordViolation: (type, severity, description, metadata = {}) => {
      dispatch({
        type: 'RECORD_VIOLATION',
        payload: { type, severity, description, metadata }
      });

      // Add alert for high severity violations
      if (severity === 'critical' || severity === 'high') {
        value.addAlert(type, severity, description);
      }

      // Check if action is needed based on violation count
      const currentCount = state.violationCounts[severity] + 1;
      const threshold = state.config.alertLevels[severity]?.threshold;

      if (threshold && currentCount >= threshold) {
        value.addAlert(
          'violation_threshold',
          'critical',
          `${severity} violation threshold reached (${currentCount})`
        );
      }

      // Update behavior metrics
      value.updateBehaviorScores();
    },

    updateBehaviorScores: () => {
      const recentViolations = state.violations.filter(
        v => Date.now() - v.timestamp < 300000 // Last 5 minutes
      );

      let attentionScore = 100;
      let stabilityScore = 100;
      let integrityScore = 100;

      recentViolations.forEach(violation => {
        const penalty = {
          critical: 15,
          high: 10,
          medium: 5,
          low: 2
        }[violation.severity] || 0;

        switch (violation.type) {
          case 'low_attention':
          case 'face_not_detected':
            attentionScore = Math.max(0, attentionScore - penalty);
            break;
          case 'excessive_movement':
          case 'multiple_faces':
            stabilityScore = Math.max(0, stabilityScore - penalty);
            break;
          case 'tab_switch':
          case 'high_audio':
          case 'network_disconnect':
            integrityScore = Math.max(0, integrityScore - penalty);
            break;
        }
      });

      const previousOverall = state.behaviorMetrics.overallScore;
      const currentOverall = Math.round((attentionScore + stabilityScore + integrityScore) / 3);
      
      const trend = currentOverall > previousOverall ? 'improving' :
                   currentOverall < previousOverall - 5 ? 'declining' : 'stable';

      dispatch({
        type: 'UPDATE_BEHAVIOR_METRICS',
        payload: { attentionScore, stabilityScore, integrityScore, trend }
      });
    },

    // Alert and Notification Management
    addAlert: (type, severity, message) => {
      dispatch({
        type: 'ADD_ALERT',
        payload: { type, severity, message }
      });
    },

    markAlertRead: (alertId) => {
      dispatch({
        type: 'MARK_ALERT_READ',
        payload: alertId
      });
    },

    addNotification: (message, type = 'info', duration = 5000) => {
      const notification = dispatch({
        type: 'ADD_NOTIFICATION',
        payload: { message, type, duration }
      });

      // Auto-remove notification after duration
      setTimeout(() => {
        dispatch({
          type: 'REMOVE_NOTIFICATION',
          payload: notification.payload.id
        });
      }, duration);
    },

    // Configuration
    updateConfig: (configUpdates) => {
      dispatch({
        type: 'UPDATE_CONFIG',
        payload: configUpdates
      });
    },

    // Utility Methods
    getViolationSummary: () => {
      const recent = state.violations.filter(
        v => Date.now() - v.timestamp < 300000
      );
      
      return {
        total: state.violations.length,
        recent: recent.length,
        bySeverity: state.violationCounts,
        lastViolation: state.violations[state.violations.length - 1] || null
      };
    },

    getMonitoringHealth: () => {
      const systemsActive = Object.values(state.systemStatus)
        .filter(status => status === 'active' || status === 'connected' || status === 'good')
        .length;
      
      const totalSystems = Object.keys(state.systemStatus).length;
      const healthPercentage = Math.round((systemsActive / totalSystems) * 100);

      return {
        healthy: healthPercentage >= 80,
        percentage: healthPercentage,
        issues: Object.entries(state.systemStatus)
          .filter(([_, status]) => status === 'error' || status === 'disconnected')
          .map(([system]) => system)
      };
    },

    getSessionSummary: () => {
      return {
        sessionId: state.sessionId,
        duration: state.startTime ? Date.now() - state.startTime : 0,
        violations: state.violations.length,
        behaviorScore: state.behaviorMetrics.overallScore,
        systemHealth: value.getMonitoringHealth(),
        dataPoints: state.stats.dataPoints
      };
    },

    resetSession: () => {
      value.stopMonitoring();
      dispatch({ type: 'RESET_SESSION' });
    }
  };

  return (
    <ExamMonitoringContext.Provider value={value}>
      {children}
    </ExamMonitoringContext.Provider>
  );
};

export const useExamMonitoring = () => {
  const context = useContext(ExamMonitoringContext);
  if (!context) {
    throw new Error('useExamMonitoring must be used within an ExamMonitoringProvider');
  }
  return context;
};

export default ExamMonitoringContext;