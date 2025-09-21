import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCw,
  Shield,
  Camera,
  Mic,
  Wifi,
  Battery,
  Monitor,
  Zap,
  Target,
  ArrowRight,
  Settings
} from 'lucide-react';

const ExamCountdown = ({ 
  examDetails, 
  onExamStart, 
  onCancel, 
  countdownDuration = 10,
  finalChecks = true 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(countdownDuration);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [systemChecks, setSystemChecks] = useState({});
  const [isRunningFinalChecks, setIsRunningFinalChecks] = useState(false);
  const [checksComplete, setChecksComplete] = useState(false);
  const [canStart, setCanStart] = useState(false);
  
  const preparationTips = [
    {
      title: "Take a Deep Breath",
      description: "Relax and center yourself. You've prepared well for this moment.",
      icon: Target
    },
    {
      title: "Review Key Points",
      description: "Quickly recall the main concepts and strategies you've studied.",
      icon: CheckCircle
    },
    {
      title: "Stay Hydrated",
      description: "Take a sip of water, but remember you can't leave during the exam.",
      icon: Zap
    },
    {
      title: "Check Your Posture",
      description: "Sit comfortably and ensure you're properly positioned for the camera.",
      icon: Camera
    },
    {
      title: "Clear Your Mind",
      description: "Let go of any anxiety and focus on demonstrating your knowledge.",
      icon: Shield
    }
  ];

  useEffect(() => {
    if (finalChecks) {
      runFinalSystemChecks();
    } else {
      setChecksComplete(true);
      setCanStart(true);
    }
  }, [finalChecks]);

  useEffect(() => {
    if (isCountingDown && !isPaused && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsCountingDown(false);
            onExamStart();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isCountingDown, isPaused, timeRemaining, onExamStart]);

  const runFinalSystemChecks = async () => {
    setIsRunningFinalChecks(true);
    const checks = {};

    // Camera verification
    checks.camera = { name: 'Camera Access', status: 'checking' };
    setSystemChecks({...checks});
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      checks.camera.status = 'passed';
      checks.camera.details = 'Camera ready and accessible';
    } catch (error) {
      checks.camera.status = 'failed';
      checks.camera.details = 'Camera access issue detected';
    }

    // Microphone verification
    checks.microphone = { name: 'Microphone Access', status: 'checking' };
    setSystemChecks({...checks});
    await new Promise(resolve => setTimeout(resolve, 600));
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      checks.microphone.status = 'passed';
      checks.microphone.details = 'Microphone ready';
    } catch (error) {
      checks.microphone.status = 'failed';
      checks.microphone.details = 'Microphone access issue';
    }

    // Network connectivity
    checks.network = { name: 'Network Connection', status: 'checking' };
    setSystemChecks({...checks});
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const response = await fetch('/api/status', { method: 'HEAD' });
      if (response.ok) {
        checks.network.status = 'passed';
        checks.network.details = 'Stable connection detected';
      } else {
        checks.network.status = 'warning';
        checks.network.details = 'Intermittent connection';
      }
    } catch (error) {
      checks.network.status = 'failed';
      checks.network.details = 'Network connectivity issue';
    }

    // System performance
    checks.performance = { name: 'System Performance', status: 'checking' };
    setSystemChecks({...checks});
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const performance = navigator.hardwareConcurrency || 4;
    const memory = (navigator.deviceMemory || 4) * 1024; // GB to MB
    
    if (performance >= 2 && memory >= 2048) {
      checks.performance.status = 'passed';
      checks.performance.details = `${performance} cores, ${memory/1024}GB RAM`;
    } else {
      checks.performance.status = 'warning';
      checks.performance.details = 'Limited system resources';
    }

    // Browser compatibility
    checks.browser = { name: 'Browser Compatibility', status: 'checking' };
    setSystemChecks({...checks});
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const hasRequiredAPIs = !!(
      window.mediaDevices && 
      window.RTCPeerConnection && 
      window.speechSynthesis &&
      window.indexedDB
    );
    
    if (hasRequiredAPIs) {
      checks.browser.status = 'passed';
      checks.browser.details = 'All required APIs available';
    } else {
      checks.browser.status = 'warning';
      checks.browser.details = 'Some features may be limited';
    }

    // Battery status (if available)
    if ('getBattery' in navigator) {
      checks.battery = { name: 'Battery Status', status: 'checking' };
      setSystemChecks({...checks});
      await new Promise(resolve => setTimeout(resolve, 400));
      
      try {
        const battery = await navigator.getBattery();
        const batteryLevel = Math.round(battery.level * 100);
        
        if (batteryLevel > 20 || battery.charging) {
          checks.battery.status = 'passed';
          checks.battery.details = `${batteryLevel}% ${battery.charging ? '(charging)' : ''}`;
        } else {
          checks.battery.status = 'warning';
          checks.battery.details = `${batteryLevel}% - Consider plugging in`;
        }
      } catch (error) {
        checks.battery.status = 'passed';
        checks.battery.details = 'Battery status unavailable';
      }
    }

    setSystemChecks(checks);
    setIsRunningFinalChecks(false);
    setChecksComplete(true);

    // Determine if we can start
    const criticalChecks = ['camera', 'microphone', 'network'];
    const criticalFailures = criticalChecks.some(check => 
      checks[check] && checks[check].status === 'failed'
    );
    
    setCanStart(!criticalFailures);
  };

  const startCountdown = () => {
    setIsCountingDown(true);
    setIsPaused(false);
  };

  const pauseCountdown = () => {
    setIsPaused(!isPaused);
  };

  const resetCountdown = () => {
    setTimeRemaining(countdownDuration);
    setIsCountingDown(false);
    setIsPaused(false);
  };

  const startExamImmediately = () => {
    setIsCountingDown(false);
    onExamStart();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'checking':
        return <RotateCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />;
    }
  };

  const formatTime = (seconds) => {
    return seconds.toString().padStart(2, '0');
  };

  const getCurrentTip = () => {
    if (timeRemaining === 0) return preparationTips[0];
    const tipIndex = Math.abs(timeRemaining - 1) % preparationTips.length;
    return preparationTips[tipIndex];
  };

  const currentTip = getCurrentTip();
  const TipIcon = currentTip.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Exam Launch Preparation</h1>
              <p className="text-slate-600">{examDetails?.title}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-4 h-4 mr-1" />
                Ready to Begin
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Countdown Display */}
          <div className="space-y-8">
            {/* Main Countdown */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-green-50">
              <CardContent className="p-12 text-center">
                <div className="space-y-6">
                  <div className="p-6 bg-green-100 rounded-full inline-block">
                    <Clock className="w-16 h-16 text-green-600" />
                  </div>
                  
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                      {isCountingDown ? 'Starting in...' : 'Ready to Start'}
                    </h2>
                    
                    {isCountingDown ? (
                      <div className="text-8xl font-bold text-green-600 mb-6 font-mono">
                        {formatTime(timeRemaining)}
                      </div>
                    ) : (
                      <div className="text-6xl font-bold text-slate-400 mb-6">
                        --
                      </div>
                    )}
                  </div>

                  {isCountingDown && isPaused && (
                    <Badge className="bg-yellow-100 text-yellow-800 mb-4">
                      <Pause className="w-4 h-4 mr-1" />
                      Countdown Paused
                    </Badge>
                  )}

                  <div className="space-y-4">
                    {!isCountingDown ? (
                      <div className="space-y-3">
                        <Button 
                          onClick={startCountdown}
                          disabled={!canStart}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-xl font-semibold rounded-xl"
                        >
                          <Play className="w-6 h-6 mr-3" />
                          Start Countdown ({countdownDuration}s)
                        </Button>
                        
                        <Button 
                          onClick={startExamImmediately}
                          disabled={!canStart}
                          variant="outline"
                          className="w-full py-3 text-lg rounded-xl"
                        >
                          Skip Countdown - Start Now
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-4">
                        <Button 
                          onClick={pauseCountdown}
                          variant="outline"
                          className="flex-1 py-3 rounded-xl"
                        >
                          {isPaused ? (
                            <>
                              <Play className="w-5 h-5 mr-2" />
                              Resume
                            </>
                          ) : (
                            <>
                              <Pause className="w-5 h-5 mr-2" />
                              Pause
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          onClick={resetCountdown}
                          variant="outline"
                          className="flex-1 py-3 rounded-xl"
                        >
                          <RotateCw className="w-5 h-5 mr-2" />
                          Reset
                        </Button>
                        
                        <Button 
                          onClick={startExamImmediately}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
                        >
                          Start Now
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={onCancel}
                    variant="ghost"
                    className="mt-4 text-slate-600"
                  >
                    Cancel and Return
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preparation Tips */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <TipIcon className="w-6 h-6 text-purple-600" />
                  <span>Preparation Tip</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-bold text-slate-900">{currentTip.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{currentTip.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Checks and Exam Info */}
          <div className="space-y-8">
            {/* System Status */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Monitor className="w-6 h-6 text-blue-600" />
                    <span>Final System Check</span>
                  </div>
                  {isRunningFinalChecks ? (
                    <Badge className="bg-blue-100 text-blue-700">
                      <RotateCw className="w-4 h-4 mr-1 animate-spin" />
                      Checking...
                    </Badge>
                  ) : checksComplete ? (
                    <Badge className={canStart ? 
                      "bg-green-100 text-green-700" : 
                      "bg-red-100 text-red-700"
                    }>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {canStart ? 'All Clear' : 'Issues Detected'}
                    </Badge>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(systemChecks).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(systemChecks).map(([key, check]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(check.status)}
                          <span className="font-medium text-slate-900">{check.name}</span>
                        </div>
                        {check.details && (
                          <span className="text-sm text-slate-600">{check.details}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <RotateCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Running system checks...</p>
                  </div>
                )}

                {checksComplete && !canStart && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-800">Critical Issues Detected</h4>
                        <p className="text-red-700 text-sm">
                          Please resolve the failed checks before starting the exam. 
                          Contact technical support if you need assistance.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Exam Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-green-600" />
                  <span>Exam Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Title</span>
                    <span className="font-medium text-slate-900">
                      {examDetails?.title || 'Assessment'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Duration</span>
                    <span className="font-medium text-slate-900">
                      {examDetails?.duration || 60} minutes
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Questions</span>
                    <span className="font-medium text-slate-900">
                      {examDetails?.questions || 20} questions
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Type</span>
                    <span className="font-medium text-slate-900">
                      {examDetails?.type || 'Mixed Format'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Instructor</span>
                    <span className="font-medium text-slate-900">
                      {examDetails?.instructor || 'Course Instructor'}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Monitoring Active</h4>
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Camera className="w-4 h-4" />
                      <span>Video</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mic className="w-4 h-4" />
                      <span>Audio</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4" />
                      <span>Behavior</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Reminders */}
            <Card className="border-0 shadow-lg bg-blue-50">
              <CardContent className="p-6">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Final Reminders
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Keep your face visible to the camera at all times</li>
                  <li>• Avoid looking away from the screen frequently</li>
                  <li>• Ensure a quiet environment throughout the exam</li>
                  <li>• Have water nearby, but avoid leaving your seat</li>
                  <li>• Technical issues? Use the help button during the exam</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamCountdown;