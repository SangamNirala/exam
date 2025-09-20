import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Camera,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Eye,
  RotateCcw,
  Zap,
  Shield,
  Target,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import useFaceDetection from '../../hooks/useFaceDetection';

const FaceCapture = () => {
  const { 
    state, 
    setStep, 
    verifyFace, 
    startFaceCapture, 
    completeFaceCapture 
  } = useStudentAuth();
  
  const {
    isLoaded,
    isLoading,
    error: faceApiError,
    detections,
    confidence,
    videoRef,
    canvasRef,
    startVideo,
    stopVideo,
    captureFaceImage,
    hasFace,
    isGoodQuality,
    faceCount
  } = useFaceDetection();

  const [captureStep, setCaptureStep] = useState('setup'); // setup, detecting, captured, verifying, complete
  const [capturedImage, setCapturedImage] = useState(null);
  const [captureAttempts, setCaptureAttempts] = useState(0);
  const [verificationResult, setVerificationResult] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [guidelines, setGuidelines] = useState({
    lighting: false,
    position: false,
    distance: false,
    stability: false
  });

  const maxAttempts = 3;
  const { faceRecognition } = state;

  // Initialize camera when component mounts
  useEffect(() => {
    initializeCamera();
    return () => {
      stopVideo();
    };
  }, []);

  // Monitor face detection quality
  useEffect(() => {
    if (captureStep === 'detecting') {
      updateGuidelines();
    }
  }, [detections, confidence, captureStep]);

  const initializeCamera = async () => {
    try {
      await startVideo();
      setCaptureStep('detecting');
    } catch (error) {
      console.error('Camera initialization failed:', error);
      // For demo mode, simulate camera working
      console.log('Demo mode: simulating camera for testing');
      setCaptureStep('demo-mode');
    }
  };

  const updateGuidelines = () => {
    setGuidelines({
      lighting: confidence > 0.5, // Decent confidence suggests good lighting
      position: hasFace && faceCount === 1, // Single face detected
      distance: confidence > 0.7, // Good confidence suggests proper distance
      stability: confidence > 0.8 // High confidence suggests stability
    });
  };

  const isReadyForCapture = () => {
    return hasFace && 
           faceCount === 1 && 
           confidence > 0.7 && 
           captureStep === 'detecting';
  };

  const startCountdown = () => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          performCapture();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const performCapture = async () => {
    startFaceCapture();
    setCaptureStep('capturing');
    
    try {
      const result = await captureFaceImage();
      setCapturedImage(result.imageData);
      completeFaceCapture(result.imageData);
      setCaptureStep('captured');
      setCaptureAttempts(prev => prev + 1);
    } catch (error) {
      console.error('Capture failed:', error);
      setCaptureStep('detecting');
      setCaptureAttempts(prev => prev + 1);
    }
  };

  const handleVerifyFace = async () => {
    if (!capturedImage) return;
    
    setCaptureStep('verifying');
    setVerificationResult(null);
    
    try {
      const result = await verifyFace(capturedImage);
      setVerificationResult(result);
      
      if (result.success) {
        setCaptureStep('complete');
        // Auto-advance to instructions after 2 seconds
        setTimeout(() => {
          setStep('instructions');
        }, 2000);
      } else {
        setCaptureStep('captured');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationResult({
        success: false,
        message: 'Verification failed. Please try again.'
      });
      setCaptureStep('captured');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setVerificationResult(null);
    setCaptureStep('detecting');
  };

  const GuidelineItem = ({ icon: Icon, text, status, critical = false }) => (
    <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
      status 
        ? 'bg-green-50 border border-green-200' 
        : critical 
        ? 'bg-red-50 border border-red-200'
        : 'bg-yellow-50 border border-yellow-200'
    }`}>
      <Icon className={`w-5 h-5 ${
        status 
          ? 'text-green-600' 
          : critical 
          ? 'text-red-600'
          : 'text-yellow-600'
      }`} />
      <span className={`text-sm ${
        status 
          ? 'text-green-800' 
          : critical 
          ? 'text-red-800'
          : 'text-yellow-800'
      }`}>
        {text}
      </span>
      {status && <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />}
    </div>
  );

  // Render different states
  const renderContent = () => {
    switch (captureStep) {
      case 'setup':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Initializing camera...</p>
          </div>
        );

      case 'demo-mode':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Demo Mode Active</h3>
              <p className="text-slate-600 mb-6">
                Camera not available in this environment. Click below to simulate face capture for demo purposes.
              </p>
            </div>

            {/* Simulated Camera Area */}
            <div className="relative bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl overflow-hidden">
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 border-2 border-dashed border-white/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-12 h-12" />
                  </div>
                  <p className="text-lg font-medium mb-2">Simulated Camera Feed</p>
                  <p className="text-white/70 text-sm">Demo mode - no actual camera required</p>
                </div>
              </div>
              
              {/* Demo Capture Button */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Button
                  onClick={() => {
                    setCaptureStep('captured');
                    // Simulate captured image
                    const demoImageData = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjM2NmYxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5EZW1vIEZhY2UgQ2FwdHVyZTwvdGV4dD48L3N2Zz4=';
                    setCapturedImage(demoImageData);
                    completeFaceCapture(demoImageData);
                  }}
                  className="rounded-full w-16 h-16 p-0 bg-blue-600 hover:bg-blue-700"
                >
                  <Camera className="w-8 h-8" />
                </Button>
              </div>
            </div>

            {/* Demo Instructions */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start space-x-3">
                <Info className="w-6 h-6 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Demo Mode Instructions</h4>
                  <p className="text-blue-700 text-sm mb-4">
                    Since no camera is detected, you can simulate the face capture process. 
                    Click the camera button above to capture a demo image and proceed with verification.
                  </p>
                  <div className="space-y-2 text-sm text-blue-600">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Demo face data will be used</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Verification will be simulated</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete authentication flow available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Camera Error</h3>
            <p className="text-slate-600 mb-6">
              {faceApiError || 'Unable to access camera. Please check permissions and try again.'}
            </p>
            <Button onClick={initializeCamera} className="rounded-xl">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        );

      case 'detecting':
      case 'capturing':
        return (
          <div className="space-y-6">
            {/* Video Feed */}
            <div className="relative bg-slate-900 rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-80 object-cover"
                autoPlay
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ mixBlendMode: 'multiply' }}
              />
              
              {/* Overlay UI */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Face Detection Overlay */}
                <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-xl flex items-center justify-center">
                  {countdown > 0 && (
                    <div className="text-6xl font-bold text-white bg-black/50 rounded-full w-24 h-24 flex items-center justify-center">
                      {countdown}
                    </div>
                  )}
                  {!hasFace && countdown === 0 && (
                    <div className="text-white bg-black/50 rounded-xl p-4 text-center">
                      <Target className="w-8 h-8 mx-auto mb-2" />
                      <p>Position your face in the frame</p>
                    </div>
                  )}
                </div>

                {/* Status Indicators */}
                <div className="absolute top-4 left-4 space-y-2">
                  <Badge variant={hasFace ? "default" : "destructive"} className="rounded-lg">
                    {hasFace ? `Face Detected (${confidence.toFixed(2)})` : 'No Face'}
                  </Badge>
                  {faceCount > 1 && (
                    <Badge variant="destructive" className="rounded-lg">
                      Multiple Faces ({faceCount})
                    </Badge>
                  )}
                </div>

                {/* Capture Button */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Button
                    onClick={startCountdown}
                    disabled={!isReadyForCapture() || countdown > 0}
                    className={`rounded-full w-16 h-16 p-0 ${
                      isReadyForCapture() 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-slate-600'
                    }`}
                  >
                    <Camera className="w-8 h-8" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Capture Guidelines:</h4>
              <GuidelineItem
                icon={Eye}
                text="Look directly at the camera"
                status={guidelines.position}
                critical={faceCount > 1}
              />
              <GuidelineItem
                icon={Zap}
                text="Ensure good lighting on your face"
                status={guidelines.lighting}
              />
              <GuidelineItem
                icon={Target}
                text="Position at arm's length from camera"
                status={guidelines.distance}
              />
              <GuidelineItem
                icon={Shield}
                text="Keep your head steady"
                status={guidelines.stability}
              />
            </div>

            {/* Capture Status */}
            {isReadyForCapture() && countdown === 0 && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">Ready for capture!</p>
                <p className="text-green-600 text-sm">Click the camera button below the video</p>
              </div>
            )}
          </div>
        );

      case 'captured':
        return (
          <div className="space-y-6">
            {/* Captured Image Preview */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Face Captured Successfully</h3>
              {capturedImage && (
                <div className="inline-block border-4 border-green-200 rounded-xl overflow-hidden">
                  <img
                    src={capturedImage}
                    alt="Captured face"
                    className="w-64 h-48 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Verification Result */}
            {verificationResult && (
              <div className={`p-4 rounded-xl border ${
                verificationResult.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start space-x-3">
                  {verificationResult.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      verificationResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {verificationResult.success ? 'Verification Successful!' : 'Verification Failed'}
                    </p>
                    <p className={`text-sm mt-1 ${
                      verificationResult.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {verificationResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                onClick={handleRetake}
                className="rounded-xl"
                disabled={captureAttempts >= maxAttempts}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Photo
              </Button>
              
              <Button
                onClick={handleVerifyFace}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                disabled={captureStep === 'verifying'}
              >
                {captureStep === 'verifying' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Identity
                  </>
                )}
              </Button>
            </div>

            {/* Attempt Counter */}
            {captureAttempts > 0 && (
              <div className="text-center text-sm text-slate-600">
                Attempt {captureAttempts} of {maxAttempts}
                {captureAttempts >= maxAttempts && (
                  <span className="text-red-600 ml-2">
                    (Maximum attempts reached - contact instructor if needed)
                  </span>
                )}
              </div>
            )}
          </div>
        );

      case 'verifying':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Verifying Your Identity</h3>
            <p className="text-slate-600">Please wait while we verify your face...</p>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Identity Verified!</h3>
            <p className="text-slate-600 mb-4">
              Your identity has been successfully verified. Proceeding to exam instructions...
            </p>
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => setStep('faceSetup')}
            className="mb-6 rounded-xl"
            disabled={captureStep === 'verifying' || captureStep === 'complete'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Setup
          </Button>
          
          <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl inline-block mb-6">
            <Camera className="w-12 h-12 text-blue-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Face Capture & Verification</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Position yourself in front of the camera and follow the guidelines for a successful capture.
          </p>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            {renderContent()}
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full" />
            <span className="text-slate-600">Token Validated</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-300" />
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              captureStep === 'complete' ? 'bg-green-600' : 'bg-blue-600'
            }`} />
            <span className="text-slate-600">Face Verification</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-300" />
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-slate-300 rounded-full" />
            <span className="text-slate-400">Exam Instructions</span>
          </div>
        </div>

        {/* Technical Info */}
        {isLoaded && (
          <div className="text-center text-xs text-slate-500">
            Face detection: {isLoaded ? 'Active' : 'Loading'} • 
            Confidence: {(confidence * 100).toFixed(1)}% • 
            Faces detected: {faceCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceCapture;