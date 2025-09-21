import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Eye,
  AlertTriangle,
  CheckCircle,
  Camera,
  Mic,
  Shield,
  Target,
  Brain,
  Activity,
  Users,
  Volume2,
  WifiOff,
  Wifi
} from 'lucide-react';

const ContinuousMonitoring = ({ 
  isActive = true,
  onViolationDetected,
  onMonitoringUpdate,
  examSettings = {}
}) => {
  const [monitoringData, setMonitoringData] = useState({
    faceDetection: { status: 'active', confidence: 0, lastSeen: Date.now() },
    eyeTracking: { status: 'active', focusLevel: 100, gazePattern: 'normal' },
    headPose: { status: 'active', position: 'center', movement: 'stable' },
    multipleFaces: { status: 'clear', count: 1, lastDetected: null },
    audioLevel: { status: 'normal', level: 20, speaking: false },
    tabFocus: { status: 'focused', switchCount: 0, lastSwitch: null },
    networkStatus: { status: 'connected', quality: 'excellent', lastCheck: Date.now() },
    behaviorScore: { overall: 95, trend: 'stable', violations: [] }
  });

  const [violations, setViolations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(isActive);
  
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const monitoringIntervalRef = useRef(null);
  const violationCountRef = useRef(0);

  // Initialize monitoring systems
  useEffect(() => {
    if (isMonitoringEnabled) {
      initializeMonitoring();
      startMonitoringLoop();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [isMonitoringEnabled]);

  // Monitor tab focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('tab_switch', 'Student switched away from exam tab', 'medium');
        setMonitoringData(prev => ({
          ...prev,
          tabFocus: {
            ...prev.tabFocus,
            status: 'unfocused',
            switchCount: prev.tabFocus.switchCount + 1,
            lastSwitch: Date.now()
          }
        }));
      } else {
        setMonitoringData(prev => ({
          ...prev,
          tabFocus: {
            ...prev.tabFocus,
            status: 'focused'
          }
        }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const initializeMonitoring = async () => {
    try {
      // Initialize camera for face detection
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize audio context for volume monitoring
      if (window.AudioContext || window.webkitAudioContext) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        const analyser = audioContextRef.current.createAnalyser();
        source.connect(analyser);
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkAudioLevel = () => {
          if (audioContextRef.current && audioContextRef.current.state === 'running') {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            
            setMonitoringData(prev => ({
              ...prev,
              audioLevel: {
                ...prev.audioLevel,
                level: Math.round(average),
                speaking: average > 30
              }
            }));

            // Check for conversation (sustained high audio)
            if (average > 50) {
              recordViolation('audio_conversation', 'Sustained audio detected - possible conversation', 'high');
            }
          }
        };

        setInterval(checkAudioLevel, 500);
      }

    } catch (error) {
      console.error('Failed to initialize monitoring:', error);
      addAlert('Failed to access camera/microphone for monitoring', 'error');
    }
  };

  const startMonitoringLoop = () => {
    monitoringIntervalRef.current = setInterval(() => {
      performFaceDetection();
      performBehaviorAnalysis();
      checkNetworkStatus();
      updateBehaviorScore();
      
      // Send update to parent
      if (onMonitoringUpdate) {
        onMonitoringUpdate(monitoringData);
      }
    }, 2000); // Check every 2 seconds
  };

  const stopMonitoring = () => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const performFaceDetection = () => {
    // Simulate face detection (in real implementation, use face-api.js or similar)
    const faceDetected = Math.random() > 0.1; // 90% chance of face detection
    const multipleFaces = Math.random() > 0.95; // 5% chance of multiple faces
    const confidence = faceDetected ? Math.random() * 40 + 60 : 0; // 60-100% confidence

    setMonitoringData(prev => ({
      ...prev,
      faceDetection: {
        status: faceDetected ? 'active' : 'lost',
        confidence: Math.round(confidence),
        lastSeen: faceDetected ? Date.now() : prev.faceDetection.lastSeen
      },
      multipleFaces: {
        status: multipleFaces ? 'detected' : 'clear',
        count: multipleFaces ? Math.floor(Math.random() * 2) + 2 : 1,
        lastDetected: multipleFaces ? Date.now() : prev.multipleFaces.lastDetected
      }
    }));

    // Record violations
    if (!faceDetected) {
      const timeSinceLastSeen = Date.now() - monitoringData.faceDetection.lastSeen;
      if (timeSinceLastSeen > 5000) { // 5 seconds without face
        recordViolation('face_not_detected', 'Face not visible for extended period', 'high');
      }
    }

    if (multipleFaces) {
      recordViolation('multiple_faces', 'Multiple faces detected in camera view', 'critical');
    }
  };

  const performBehaviorAnalysis = () => {
    // Simulate behavior analysis
    const eyeFocusLevel = Math.random() * 30 + 70; // 70-100%
    const headPosition = ['center', 'left', 'right', 'up', 'down'][Math.floor(Math.random() * 5)];
    const movement = ['stable', 'slight', 'excessive'][Math.floor(Math.random() * 3)];
    
    setMonitoringData(prev => ({
      ...prev,
      eyeTracking: {
        status: eyeFocusLevel > 60 ? 'active' : 'distracted',
        focusLevel: Math.round(eyeFocusLevel),
        gazePattern: eyeFocusLevel > 80 ? 'normal' : 'irregular'
      },
      headPose: {
        status: headPosition === 'center' ? 'normal' : 'deviated',
        position: headPosition,
        movement: movement
      }
    }));

    // Record violations
    if (eyeFocusLevel < 40) {
      recordViolation('low_attention', 'Low attention detected - looking away frequently', 'medium');
    }

    if (movement === 'excessive') {
      recordViolation('excessive_movement', 'Excessive head/body movement detected', 'medium');
    }
  };

  const checkNetworkStatus = () => {
    // Simulate network monitoring
    const isOnline = navigator.onLine;
    const quality = Math.random() > 0.1 ? 'excellent' : 'poor';
    
    setMonitoringData(prev => ({
      ...prev,
      networkStatus: {
        status: isOnline ? 'connected' : 'disconnected',
        quality: quality,
        lastCheck: Date.now()
      }
    }));

    if (!isOnline) {
      recordViolation('network_disconnect', 'Network connection lost', 'critical');
    }
  };

  const updateBehaviorScore = () => {
    const recentViolations = violations.filter(v => Date.now() - v.timestamp < 300000); // Last 5 minutes
    let score = 100;
    
    recentViolations.forEach(violation => {
      switch (violation.severity) {
        case 'critical': score -= 15; break;
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    });

    score = Math.max(0, score);
    
    const trend = score >= monitoringData.behaviorScore.overall ? 'improving' : 
                 score < monitoringData.behaviorScore.overall - 5 ? 'declining' : 'stable';

    setMonitoringData(prev => ({
      ...prev,
      behaviorScore: {
        overall: score,
        trend: trend,
        violations: recentViolations
      }
    }));
  };

  const recordViolation = (type, description, severity) => {
    const violation = {
      id: Date.now() + Math.random(),
      type,
      description,
      severity,
      timestamp: Date.now()
    };

    setViolations(prev => [...prev, violation]);
    violationCountRef.current += 1;
    
    // Add alert for high severity violations
    if (severity === 'critical' || severity === 'high') {
      addAlert(description, severity);
    }

    // Notify parent component
    if (onViolationDetected) {
      onViolationDetected(violation);
    }
  };

  const addAlert = (message, type) => {
    const alert = {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: Date.now()
    };

    setAlerts(prev => [...prev.slice(-4), alert]); // Keep only last 5 alerts
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'normal':
      case 'focused':
      case 'connected':
      case 'clear':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'distracted':
      case 'slight':
      case 'deviated':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'lost':
      case 'unfocused':
      case 'disconnected':
      case 'detected':
      case 'excessive':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (!isMonitoringEnabled) {
    return (
      <Card className="border-0 shadow-sm bg-slate-50">
        <CardContent className="p-4 text-center">
          <Shield className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600">Monitoring Disabled</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hidden video element for face detection */}
      <video ref={videoRef} autoPlay muted className="hidden" />

      {/* Real-time Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(-3).map((alert) => (
            <div 
              key={alert.id}
              className={`p-3 rounded-lg border ${
                alert.type === 'error' || alert.type === 'critical' ? 'bg-red-50 border-red-200 text-red-800' :
                alert.type === 'high' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                'bg-yellow-50 border-yellow-200 text-yellow-800'
              } animate-slide-in`}
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">{alert.message}</span>
                <span className="text-xs opacity-75">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Monitoring Status Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Face Detection */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-slate-700">Face Detection</span>
            </div>
            <div className="space-y-1">
              <Badge className={`text-xs ${getStatusColor(monitoringData.faceDetection.status)}`}>
                {monitoringData.faceDetection.status}
              </Badge>
              <p className="text-xs text-slate-600">
                {monitoringData.faceDetection.confidence}% confidence
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Eye Tracking */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-slate-700">Attention</span>
            </div>
            <div className="space-y-1">
              <Badge className={`text-xs ${getStatusColor(monitoringData.eyeTracking.status)}`}>
                {monitoringData.eyeTracking.focusLevel}% focused
              </Badge>
              <p className="text-xs text-slate-600">
                {monitoringData.eyeTracking.gazePattern}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Head Position */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-slate-700">Position</span>
            </div>
            <div className="space-y-1">
              <Badge className={`text-xs ${getStatusColor(monitoringData.headPose.status)}`}>
                {monitoringData.headPose.position}
              </Badge>
              <p className="text-xs text-slate-600">
                {monitoringData.headPose.movement} movement
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Multiple Faces */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-slate-700">People Count</span>
            </div>
            <div className="space-y-1">
              <Badge className={`text-xs ${getStatusColor(monitoringData.multipleFaces.status)}`}>
                {monitoringData.multipleFaces.count} detected
              </Badge>
              <p className="text-xs text-slate-600">
                {monitoringData.multipleFaces.status}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Audio Level */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-slate-700">Audio</span>
            </div>
            <div className="space-y-1">
              <Badge className={`text-xs ${
                monitoringData.audioLevel.speaking ? 'text-yellow-600 bg-yellow-100' : 'text-green-600 bg-green-100'
              }`}>
                {monitoringData.audioLevel.level}% level
              </Badge>
              <p className="text-xs text-slate-600">
                {monitoringData.audioLevel.speaking ? 'speaking' : 'quiet'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tab Focus */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-medium text-slate-700">Focus</span>
            </div>
            <div className="space-y-1">
              <Badge className={`text-xs ${getStatusColor(monitoringData.tabFocus.status)}`}>
                {monitoringData.tabFocus.status}
              </Badge>
              <p className="text-xs text-slate-600">
                {monitoringData.tabFocus.switchCount} switches
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Network Status */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              {monitoringData.networkStatus.status === 'connected' ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <span className="text-xs font-medium text-slate-700">Network</span>
            </div>
            <div className="space-y-1">
              <Badge className={`text-xs ${getStatusColor(monitoringData.networkStatus.status)}`}>
                {monitoringData.networkStatus.status}
              </Badge>
              <p className="text-xs text-slate-600">
                {monitoringData.networkStatus.quality}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Behavior Score */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-slate-700">Behavior</span>
            </div>
            <div className="space-y-1">
              <Badge className={`text-xs ${
                monitoringData.behaviorScore.overall >= 80 ? 'text-green-600 bg-green-100' :
                monitoringData.behaviorScore.overall >= 60 ? 'text-yellow-600 bg-yellow-100' :
                'text-red-600 bg-red-100'
              }`}>
                {monitoringData.behaviorScore.overall}% score
              </Badge>
              <p className="text-xs text-slate-600">
                {monitoringData.behaviorScore.trend}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Violations */}
      {violations.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span>Recent Activity ({violations.length} total)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {violations.slice(-5).reverse().map((violation) => (
                <div 
                  key={violation.id}
                  className={`p-2 rounded border text-xs ${getSeverityColor(violation.severity)}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{violation.description}</span>
                    <span className="opacity-75">
                      {new Date(violation.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContinuousMonitoring;