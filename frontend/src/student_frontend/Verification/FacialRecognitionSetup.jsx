import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Camera,
  CheckCircle,
  AlertCircle,
  User,
  Shield,
  Eye,
  RotateCw,
  Settings,
  Play,
  Pause,
  ArrowLeft,
  ArrowRight,
  Info,
  Lock,
  Unlock,
  X
} from 'lucide-react';

const FacialRecognitionSetup = ({ tokenDetails, onVerificationSuccess, onSkip, onBack }) => {
  const [currentStep, setCurrentStep] = useState('permission'); // permission, setup, capture, verify, complete
  const [cameraPermission, setCameraPermission] = useState('unknown'); // unknown, granted, denied
  const [cameraStream, setCameraStream] = useState(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceQuality, setFaceQuality] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [livenessChecks, setLivenessChecks] = useState({
    blink: false,
    smile: false,
    headTurn: false
  });
  const [currentLivenessCheck, setCurrentLivenessCheck] = useState('blink');
  const [error, setError] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Camera permission and setup
  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      setCameraStream(stream);
      setCameraPermission('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);
      
      if (cameras.length > 0) {
        setSelectedCamera(cameras[0]);
        setCurrentStep('setup');
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraPermission('denied');
      setError('Camera access is required for identity verification. Please allow camera access and try again.');
    }
  };

  const switchCamera = async (deviceId) => {
    try {
      // Stop current stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          deviceId: { exact: deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const selectedCam = availableCameras.find(cam => cam.deviceId === deviceId);
      setSelectedCamera(selectedCam);
    } catch (error) {
      console.error('Camera switch error:', error);
      setError('Failed to switch camera. Please try again.');
    }
  };

  // Mock face detection (in real implementation, use face-api.js or similar)
  const mockFaceDetection = () => {
    // Simulate face detection after 2 seconds
    setTimeout(() => {
      setFaceDetected(true);
      setFaceQuality({
        lighting: 85,
        clarity: 92,
        positioning: 88,
        overall: 88
      });
    }, 2000);
  };

  const startFaceDetection = () => {
    setCurrentStep('capture');
    setFaceDetected(false);
    setFaceQuality(null);
    mockFaceDetection();
  };

  const captureFaceImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    setCurrentStep('verify');
  };

  const startLivenessDetection = () => {
    setCurrentStep('liveness');
    setCurrentLivenessCheck('blink');
    
    // Simulate liveness checks
    setTimeout(() => {
      setLivenessChecks(prev => ({ ...prev, blink: true }));
      setCurrentLivenessCheck('smile');
      
      setTimeout(() => {
        setLivenessChecks(prev => ({ ...prev, smile: true }));
        setCurrentLivenessCheck('headTurn');
        
        setTimeout(() => {
          setLivenessChecks(prev => ({ ...prev, headTurn: true }));
          captureFaceImage();
        }, 3000);
      }, 3000);
    }, 3000);
  };

  const handleVerificationComplete = () => {
    const verificationData = {
      faceImage: capturedImage,
      faceQuality: faceQuality,
      livenessChecks: livenessChecks,
      timestamp: new Date().toISOString(),
      cameraDetails: selectedCamera,
      sessionId: `face_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    onVerificationSuccess(verificationData);
  };

  const renderPermissionStep = () => (
    <div className="text-center space-y-8">
      <div className="p-6 bg-blue-100 rounded-3xl inline-block">
        <Camera className="w-16 h-16 text-blue-600" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Camera Access Required</h3>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          For security and verification purposes, we need to capture your photo before the exam. 
          This helps ensure exam integrity and prevents unauthorized access.
        </p>
      </div>

      <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <h4 className="font-semibold text-blue-800">Privacy Protection</h4>
        </div>
        <div className="space-y-2 text-sm text-blue-700">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4" />
            <span>Images are encrypted and secure</span>
          </div>
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>Used only for verification</span>
          </div>
          <div className="flex items-center space-x-2">
            <X className="w-4 h-4" />
            <span>Deleted after exam completion</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={requestCameraPermission}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-xl"
        >
          <Camera className="w-5 h-5 mr-3" />
          Allow Camera Access
        </Button>
        <Button 
          variant="outline" 
          onClick={onSkip}
          className="px-8 py-3 text-lg rounded-xl"
        >
          Skip Verification (Demo)
        </Button>
      </div>
    </div>
  );

  const renderSetupStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Camera Setup</h3>
        <p className="text-lg text-slate-600">
          Position yourself in front of the camera and ensure good lighting.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Camera Preview */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Camera Preview</span>
              {availableCameras.length > 1 && (
                <select 
                  className="text-sm border rounded-lg px-3 py-1"
                  onChange={(e) => switchCamera(e.target.value)}
                  value={selectedCamera?.deviceId || ''}
                >
                  {availableCameras.map((camera) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Camera ${camera.deviceId.substr(0, 8)}`}
                    </option>
                  ))}
                </select>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover"
              />
              {/* Face detection overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-80 border-4 border-blue-400 border-dashed rounded-2xl flex items-center justify-center">
                  <User className="w-16 h-16 text-blue-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Position Your Face</h4>
                  <p className="text-sm text-slate-600">Center your face within the outlined area</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Good Lighting</h4>
                  <p className="text-sm text-slate-600">Ensure your face is well-lit and clearly visible</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Look Directly</h4>
                  <p className="text-sm text-slate-600">Look straight at the camera, not the screen</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Remove Obstructions</h4>
                  <p className="text-sm text-slate-600">Remove hats, sunglasses, or masks if possible</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={startFaceDetection}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Face Detection
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCaptureStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Face Detection in Progress</h3>
        <p className="text-lg text-slate-600">
          Please remain still while we detect and analyze your face.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Camera Feed with Detection */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover"
              />
              {/* Face detection indicators */}
              <div className="absolute inset-0">
                {faceDetected ? (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-64 h-80 border-4 border-green-400 rounded-2xl animate-pulse">
                      <CheckCircle className="w-8 h-8 text-green-400 absolute -top-4 -right-4 bg-white rounded-full" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-64 h-80 border-4 border-yellow-400 border-dashed rounded-2xl">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <RotateCw className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-2" />
                          <p className="text-yellow-400 text-sm">Detecting face...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detection Results */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Detection Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!faceDetected ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <RotateCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-slate-600">Analyzing face position and quality...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h4 className="font-semibold text-green-800">Face Detected Successfully</h4>
                </div>

                {faceQuality && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Lighting Quality</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${faceQuality.lighting}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{faceQuality.lighting}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Image Clarity</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${faceQuality.clarity}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{faceQuality.clarity}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Face Position</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${faceQuality.positioning}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{faceQuality.positioning}%</span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">Overall Quality</span>
                        <Badge 
                          variant="outline" 
                          className={`${
                            faceQuality.overall >= 80 
                              ? 'bg-green-100 text-green-700 border-green-200' 
                              : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                          }`}
                        >
                          {faceQuality.overall >= 80 ? 'Excellent' : 'Good'} ({faceQuality.overall}%)
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={startLivenessDetection}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl mt-6"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Proceed to Liveness Check
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderLivenessStep = () => {
    const livenessInstructions = {
      blink: {
        title: "Blink Detection",
        instruction: "Please blink your eyes naturally a few times",
        icon: Eye
      },
      smile: {
        title: "Smile Detection", 
        instruction: "Please smile for the camera",
        icon: User
      },
      headTurn: {
        title: "Head Movement",
        instruction: "Slowly turn your head left, then right",
        icon: RotateCw
      }
    };

    const currentInstruction = livenessInstructions[currentLivenessCheck];
    const IconComponent = currentInstruction.icon;

    return (
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Liveness Verification</h3>
          <p className="text-lg text-slate-600">
            Follow the instructions below to verify you are a real person.
          </p>
        </div>

        <Card className="border-0 shadow-xl max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="p-6 bg-blue-100 rounded-2xl inline-block">
                <IconComponent className="w-12 h-12 text-blue-600" />
              </div>
              
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">
                  {currentInstruction.title}
                </h4>
                <p className="text-lg text-slate-600">
                  {currentInstruction.instruction}
                </p>
              </div>

              {/* Progress indicator */}
              <div className="flex justify-center space-x-4">
                {Object.keys(livenessChecks).map((check) => (
                  <div key={check} className="flex items-center space-x-2">
                    {livenessChecks[check] ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : currentLivenessCheck === check ? (
                      <div className="w-6 h-6 border-2 border-blue-600 rounded-full animate-pulse" />
                    ) : (
                      <div className="w-6 h-6 border-2 border-slate-300 rounded-full" />
                    )}
                    <span className="text-sm capitalize text-slate-600">{check}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Camera preview during liveness check */}
        <Card className="border-0 shadow-xl max-w-lg mx-auto">
          <CardContent className="p-4">
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderVerifyStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Verification Complete</h3>
        <p className="text-lg text-slate-600">
          Please review your captured image and verification results.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Captured Image */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Captured Image</CardTitle>
          </CardHeader>
          <CardContent>
            {capturedImage && (
              <img 
                src={capturedImage}
                alt="Captured face"
                className="w-full rounded-xl"
              />
            )}
          </CardContent>
        </Card>

        {/* Verification Results */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-green-800">Verification Successful</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Liveness Checks</h4>
              <div className="space-y-2">
                {Object.entries(livenessChecks).map(([check, passed]) => (
                  <div key={check} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-slate-700 capitalize">{check} Detection: Passed</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Image Quality</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Overall Quality</span>
                  <Badge className="bg-green-100 text-green-700">Excellent</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Verification Score</span>
                  <Badge className="bg-blue-100 text-blue-700">96%</Badge>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-3">
                <Lock className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-slate-900">Security Information</span>
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                <p>✓ Identity verification completed</p>
                <p>✓ Anti-spoofing checks passed</p>
                <p>✓ Image securely encrypted</p>
                <p>✓ Ready to proceed to exam</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                onClick={() => setCurrentStep('capture')}
                variant="outline"
                className="flex-1 rounded-xl"
              >
                Retake Photo
              </Button>
              <Button 
                onClick={handleVerificationComplete}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm & Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="hover:bg-slate-100 rounded-xl"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Identity Verification</h1>
                <p className="text-sm text-slate-600">{tokenDetails?.examTitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Step 2 of 3
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Render current step */}
        {currentStep === 'permission' && renderPermissionStep()}
        {currentStep === 'setup' && renderSetupStep()}
        {currentStep === 'capture' && renderCaptureStep()}
        {currentStep === 'liveness' && renderLivenessStep()}
        {currentStep === 'verify' && renderVerifyStep()}
      </div>
    </div>
  );
};

export default FacialRecognitionSetup;