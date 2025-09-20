import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Camera,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Shield,
  Eye,
  Monitor,
  Settings,
  Info,
  Lightbulb,
  Lock,
  Globe,
  Heart,
  HelpCircle,
  Smartphone,
  Laptop,
  Tablet
} from 'lucide-react';
import { useStudentAuth } from '../../contexts/StudentAuthContext';

const FacialRecognitionSetup = () => {
  const { state, setStep, setCameraReady } = useStudentAuth();
  const [hasCamera, setHasCamera] = useState(false);
  const [isCheckingCamera, setIsCheckingCamera] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState({});

  // Check camera availability on component mount
  useEffect(() => {
    checkCameraAvailability();
  }, []);

  const checkCameraAvailability = async () => {
    setIsCheckingCamera(true);
    setCameraError(null);

    try {
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      // Get device information
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      // Test camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      // Success - camera is available
      setHasCamera(true);
      setCameraReady(true);
      setDeviceInfo({
        deviceCount: videoDevices.length,
        primaryDevice: videoDevices[0].label || 'Camera',
        hasMultipleCameras: videoDevices.length > 1
      });

      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());

    } catch (error) {
      console.error('Camera check failed:', error);
      setHasCamera(false);
      setCameraReady(false);
      
      // Set user-friendly error message
      if (error.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Please allow camera access and refresh the page.');
      } else if (error.name === 'NotFoundError') {
        setCameraError('No camera found. Please connect a camera and refresh the page.');
      } else if (error.name === 'NotReadableError') {
        setCameraError('Camera is being used by another application. Please close other apps and try again.');
      } else {
        setCameraError(error.message || 'Camera access failed. Please check your camera settings.');
      }
    } finally {
      setIsCheckingCamera(false);
    }
  };

  const handleProceedToCapture = () => {
    if (hasCamera) {
      setStep('faceCapture');
    } else {
      // For demo purposes, allow proceeding even without camera
      console.log('Demo mode: proceeding without camera for testing');
      setCameraReady(true);
      setStep('faceCapture');
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'Privacy Protected',
      description: 'Face data is processed locally and encrypted during transmission',
      color: 'green'
    },
    {
      icon: Eye,
      title: 'Liveness Detection',
      description: 'Advanced algorithms detect real faces vs photos or videos',
      color: 'blue'
    },
    {
      icon: Lock,
      title: 'Secure Verification',
      description: 'Biometric data is immediately deleted after verification',
      color: 'purple'
    },
    {
      icon: Globe,
      title: 'GDPR Compliant',
      description: 'Full compliance with international privacy regulations',
      color: 'orange'
    }
  ];

  const requirements = [
    { icon: Camera, text: 'Working camera (webcam or built-in)', status: hasCamera },
    { icon: Lightbulb, text: 'Good lighting on your face', status: true },
    { icon: Monitor, text: 'Stable internet connection', status: true },
    { icon: Settings, text: 'Browser camera permissions enabled', status: hasCamera }
  ];

  const getDeviceIcon = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile')) return Smartphone;
    if (userAgent.includes('tablet')) return Tablet;
    return Laptop;
  };

  const DeviceIcon = getDeviceIcon();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => setStep('token')}
            className="mb-6 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Token
          </Button>
          
          <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl inline-block mb-6">
            <Camera className="w-12 h-12 text-blue-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Facial Recognition Setup</h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            To ensure exam security and verify your identity, we'll capture a photo of your face. 
            This process is completely secure and protects your privacy.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Camera Status & Setup */}
          <div className="space-y-6">
            {/* Camera Status Card */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Camera className="w-6 h-6 text-blue-600" />
                    <span>Camera Status</span>
                  </div>
                  {isCheckingCamera ? (
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Badge variant={hasCamera ? "default" : "destructive"} className="rounded-lg">
                      {hasCamera ? "Ready" : "Not Available"}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {isCheckingCamera ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center space-x-3">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-slate-600">Checking camera availability...</span>
                    </div>
                  </div>
                ) : hasCamera ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl border border-green-200">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Camera detected and ready!</p>
                        <p className="text-sm text-green-600">
                          {deviceInfo.primaryDevice} • {deviceInfo.deviceCount} camera(s) available
                        </p>
                      </div>
                    </div>

                    {deviceInfo.hasMultipleCameras && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start space-x-2">
                          <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-700">
                            <strong>Multiple cameras detected:</strong> We'll use your front-facing camera by default.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-xl border border-red-200">
                      <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Camera not available</p>
                        <p className="text-sm text-red-600 mt-1">{cameraError}</p>
                      </div>
                    </div>

                    {/* Troubleshooting Steps */}
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-3 flex items-center">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Troubleshooting Steps:
                      </h4>
                      <ol className="text-sm text-yellow-700 space-y-1 ml-4">
                        <li>1. Click "Allow" when prompted for camera access</li>
                        <li>2. Check that your camera isn't being used by other apps</li>
                        <li>3. Refresh the page and try again</li>
                        <li>4. Contact your instructor if issues persist</li>
                      </ol>
                    </div>

                    <Button 
                      onClick={checkCameraAvailability}
                      variant="outline"
                      className="w-full rounded-xl"
                      disabled={isCheckingCamera}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Try Camera Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Requirements Checklist */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span>System Requirements</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {requirements.map((req, index) => (
                  <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    req.status ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <req.icon className={`w-5 h-5 ${req.status ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={`${req.status ? 'text-green-800' : 'text-red-800'}`}>
                      {req.text}
                    </span>
                    {req.status ? (
                      <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 ml-auto" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Device Info */}
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-slate-100 rounded-xl">
                    <DeviceIcon className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Your Device</h4>
                    <p className="text-sm text-slate-600">
                      {navigator.userAgent.includes('mobile') ? 'Mobile Device' : 
                       navigator.userAgent.includes('tablet') ? 'Tablet' : 'Desktop/Laptop'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Privacy & Security Info */}
          <div className="space-y-6">
            {/* Privacy Features */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Heart className="w-6 h-6 text-pink-600" />
                  <span>Privacy & Security</span>
                </CardTitle>
                <p className="text-slate-600">Your privacy is our top priority</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl">
                    <div className={`p-2 bg-${feature.color}-100 rounded-lg`}>
                      <feature.icon className={`w-5 h-5 text-${feature.color}-600`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-slate-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* What Happens Next */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Info className="w-6 h-6 text-blue-600" />
                  <span>What Happens Next</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <span className="text-slate-700">Camera will activate for face capture</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <span className="text-slate-700">Position your face in the capture area</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <span className="text-slate-700">AI verifies your identity securely</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <span className="text-slate-700">Proceed to exam instructions</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <strong>Pro Tip:</strong> Ensure good lighting on your face and look directly at the camera 
                      for best results. The process takes just a few seconds.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <Button 
            variant="outline"
            onClick={() => setStep('token')}
            className="px-8 py-4 text-lg font-semibold rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 mr-3" />
            Back to Token
          </Button>
          
          <Button 
            onClick={handleProceedToCapture}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
          >
            <Camera className="w-5 h-5 mr-3" />
            {hasCamera ? 'Start Face Capture' : 'Continue with Demo Mode'}
            <ArrowRight className="w-5 h-5 ml-3" />
          </Button>
        </div>

        {/* Demo Mode Notice */}
        {!hasCamera && (
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 text-center">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-blue-600 mt-0.5" />
              <div className="text-blue-700">
                <h4 className="font-semibold mb-2">Demo Mode Available</h4>
                <p className="text-sm">
                  Camera not detected in this environment. You can continue with demo mode 
                  to experience the complete authentication flow with simulated face verification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="text-center text-sm text-slate-500 max-w-2xl mx-auto">
          By proceeding, you consent to facial recognition for identity verification. 
          Your biometric data is processed securely and deleted immediately after verification. 
          <br />
          <button className="text-blue-600 hover:text-blue-700 underline">
            View full privacy policy
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacialRecognitionSetup;