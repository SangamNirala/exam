import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Eye,
  User,
  RotateCw,
  CheckCircle,
  AlertCircle,
  Camera,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';

const LivenessDetection = ({ videoStream, onLivenessComplete, onRetry }) => {
  const [currentCheck, setCurrentCheck] = useState('blink');
  const [livenessResults, setLivenessResults] = useState({
    blink: { completed: false, attempts: 0 },
    smile: { completed: false, attempts: 0 },
    headTurn: { completed: false, attempts: 0 }
  });
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [instruction, setInstruction] = useState('');
  const [detectionStatus, setDetectionStatus] = useState('waiting'); // waiting, detecting, success, failed

  const videoRef = useRef(null);
  const detectionInterval = useRef(null);

  const livenessChecks = {
    blink: {
      title: 'Blink Detection',
      instruction: 'Please blink your eyes naturally 3-4 times',
      icon: Eye,
      duration: 5000, // 5 seconds
      description: 'We will detect your natural blinking pattern'
    },
    smile: {
      title: 'Smile Detection',
      instruction: 'Please smile naturally for the camera',
      icon: User,
      duration: 3000, // 3 seconds
      description: 'Show a natural smile to verify liveness'
    },
    headTurn: {
      title: 'Head Movement',
      instruction: 'Slowly turn your head left, then center, then right',
      icon: RotateCw,
      duration: 6000, // 6 seconds
      description: 'Turn your head naturally to complete verification'
    }
  };

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  useEffect(() => {
    if (isActive && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isActive && countdown === 0) {
      startDetection();
    }
  }, [isActive, countdown]);

  const startLivenessCheck = () => {
    setIsActive(true);
    setCountdown(3);
    setDetectionStatus('waiting');
    setInstruction(`Get ready for ${livenessChecks[currentCheck].title.toLowerCase()}`);
  };

  const startDetection = () => {
    setDetectionStatus('detecting');
    setInstruction(livenessChecks[currentCheck].instruction);
    
    // Simulate detection process
    detectionInterval.current = setTimeout(() => {
      simulateDetection();
    }, livenessChecks[currentCheck].duration);
  };

  const simulateDetection = () => {
    // Simulate detection logic with high success rate
    const isSuccess = Math.random() > 0.2; // 80% success rate
    
    if (isSuccess) {
      setDetectionStatus('success');
      setLivenessResults(prev => ({
        ...prev,
        [currentCheck]: { 
          completed: true, 
          attempts: prev[currentCheck].attempts + 1 
        }
      }));
      
      setTimeout(() => {
        moveToNextCheck();
      }, 1500);
    } else {
      setDetectionStatus('failed');
      setLivenessResults(prev => ({
        ...prev,
        [currentCheck]: { 
          ...prev[currentCheck],
          attempts: prev[currentCheck].attempts + 1 
        }
      }));
    }
  };

  const moveToNextCheck = () => {
    const checks = Object.keys(livenessChecks);
    const currentIndex = checks.indexOf(currentCheck);
    
    if (currentIndex < checks.length - 1) {
      // Move to next check
      setCurrentCheck(checks[currentIndex + 1]);
      setIsActive(false);
      setCountdown(3);
      setDetectionStatus('waiting');
    } else {
      // All checks completed
      const allCompleted = Object.values(livenessResults).every(result => result.completed) &&
                          livenessResults[currentCheck].completed;
      
      if (allCompleted || (livenessResults.blink.completed && livenessResults.smile.completed)) {
        // Pass the liveness data to parent
        onLivenessComplete({
          results: livenessResults,
          timestamp: new Date().toISOString(),
          totalAttempts: Object.values(livenessResults).reduce((sum, result) => sum + result.attempts, 0)
        });
      }
    }
  };

  const retryCurrentCheck = () => {
    setIsActive(false);
    setCountdown(3);
    setDetectionStatus('waiting');
    startLivenessCheck();
  };

  const skipCurrentCheck = () => {
    // Mark as completed for demo purposes
    setLivenessResults(prev => ({
      ...prev,
      [currentCheck]: { completed: true, attempts: prev[currentCheck].attempts + 1 }
    }));
    moveToNextCheck();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'detecting': return 'border-blue-500 bg-blue-50';
      case 'success': return 'border-green-500 bg-green-50';
      case 'failed': return 'border-red-500 bg-red-50';
      default: return 'border-slate-300 bg-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'detecting': return <RotateCw className="w-6 h-6 text-blue-600 animate-spin" />;
      case 'success': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'failed': return <AlertCircle className="w-6 h-6 text-red-600" />;
      default: return <Camera className="w-6 h-6 text-slate-400" />;
    }
  };

  const currentCheckData = livenessChecks[currentCheck];
  const IconComponent = currentCheckData.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="p-4 bg-blue-100 rounded-2xl inline-block mb-6">
          <IconComponent className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Liveness Verification</h2>
        <p className="text-lg text-slate-600">
          Complete these simple actions to verify you are a real person
        </p>
      </div>

      {/* Progress Indicator */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Verification Progress</h3>
            <Badge variant="outline">
              {Object.values(livenessResults).filter(r => r.completed).length} of {Object.keys(livenessChecks).length} completed
            </Badge>
          </div>
          <div className="flex space-x-4">
            {Object.entries(livenessChecks).map(([key, check]) => {
              const IconComp = check.icon;
              const isCompleted = livenessResults[key].completed;
              const isCurrent = key === currentCheck;
              
              return (
                <div 
                  key={key}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    isCompleted ? 'border-green-300 bg-green-50' :
                    isCurrent ? 'border-blue-300 bg-blue-50' :
                    'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="text-center">
                    <div className={`p-2 rounded-lg inline-block mb-2 ${
                      isCompleted ? 'bg-green-100' :
                      isCurrent ? 'bg-blue-100' :
                      'bg-slate-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <IconComp className={`w-6 h-6 ${
                          isCurrent ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                      )}
                    </div>
                    <h4 className="font-semibold text-sm text-slate-900">{check.title}</h4>
                    {livenessResults[key].attempts > 0 && (
                      <p className="text-xs text-slate-600">
                        {isCompleted ? 'Completed' : `Attempt ${livenessResults[key].attempts}`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Camera Feed */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Camera View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`relative rounded-xl overflow-hidden border-4 ${getStatusColor(detectionStatus)}`}>
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="w-full aspect-video object-cover"
              />
              
              {/* Overlay indicators */}
              <div className="absolute inset-0 flex items-center justify-center">
                {countdown > 0 && isActive && (
                  <div className="bg-black bg-opacity-50 rounded-full w-24 h-24 flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">{countdown}</span>
                  </div>
                )}
                
                {detectionStatus !== 'waiting' && countdown === 0 && (
                  <div className="absolute top-4 right-4">
                    {getStatusIcon(detectionStatus)}
                  </div>
                )}
              </div>

              {/* Face detection guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-64 border-2 border-white border-dashed rounded-2xl opacity-30" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Panel */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <IconComponent className="w-6 h-6 text-blue-600" />
              <span>{currentCheckData.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-slate-600 mb-4">{currentCheckData.description}</p>
              
              {instruction && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="font-semibold text-blue-800">{instruction}</p>
                </div>
              )}
            </div>

            {detectionStatus === 'waiting' && !isActive && (
              <Button 
                onClick={startLivenessCheck}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
              >
                <Play className="w-5 h-5 mr-2" />
                Start {currentCheckData.title}
              </Button>
            )}

            {detectionStatus === 'detecting' && (
              <div className="text-center">
                <RotateCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                <p className="text-blue-600 font-medium">Detecting {currentCheck}...</p>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4" />
                </div>
              </div>
            )}

            {detectionStatus === 'success' && (
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-green-600 font-semibold">
                  {currentCheckData.title} Successful!
                </p>
                <p className="text-sm text-slate-600">Moving to next verification...</p>
              </div>
            )}

            {detectionStatus === 'failed' && (
              <div className="space-y-4">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                  <p className="text-red-600 font-semibold">Detection Failed</p>
                  <p className="text-sm text-slate-600">
                    Please try again. Make sure you follow the instructions clearly.
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    onClick={retryCurrentCheck}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button 
                    onClick={skipCurrentCheck}
                    variant="outline"
                    className="flex-1 rounded-xl"
                  >
                    Skip (Demo)
                  </Button>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-900 mb-2">Tips for Success</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Ensure good lighting on your face</li>
                <li>• Keep your face centered in the frame</li>
                <li>• Move naturally and clearly</li>
                <li>• Look directly at the camera</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LivenessDetection;