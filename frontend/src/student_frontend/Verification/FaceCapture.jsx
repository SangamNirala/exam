import React, { useState, useRef, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Camera,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Eye,
  Zap,
  Target,
  Image as ImageIcon,
  RotateCw
} from 'lucide-react';

const FaceCapture = ({ videoStream, onCaptureComplete, onRetake }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [qualityAnalysis, setQualityAnalysis] = useState(null);
  const [autoCapture, setAutoCapture] = useState(true);
  const [countdown, setCountdown] = useState(0);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const analysisInterval = useRef(null);

  React.useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
      
      if (autoCapture) {
        startAutoCapture();
      }
    }

    return () => {
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
      }
    };
  }, [videoStream, autoCapture]);

  const startAutoCapture = () => {
    // Start continuous quality analysis
    analysisInterval.current = setInterval(() => {
      analyzeFrameQuality();
    }, 500);
  };

  const analyzeFrameQuality = () => {
    if (!videoRef.current || isCapturing) return;

    // Simulate frame quality analysis
    const mockQuality = {
      lighting: Math.random() * 40 + 60, // 60-100%
      sharpness: Math.random() * 30 + 70, // 70-100%
      positioning: Math.random() * 25 + 75, // 75-100%
      faceDetected: Math.random() > 0.3, // 70% chance
      eyesOpen: Math.random() > 0.2, // 80% chance
      frontalPose: Math.random() > 0.4 // 60% chance
    };

    const overall = mockQuality.faceDetected && mockQuality.eyesOpen && mockQuality.frontalPose
      ? (mockQuality.lighting + mockQuality.sharpness + mockQuality.positioning) / 3
      : 0;

    setQualityAnalysis({
      ...mockQuality,
      overall: Math.round(overall),
      timestamp: Date.now()
    });

    // Auto-capture if quality is excellent
    if (overall > 85 && autoCapture && !isCapturing) {
      setTimeout(() => {
        if (overall > 85) { // Double-check quality hasn't degraded
          captureImage(true);
        }
      }, 1000);
    }
  };

  const captureImage = useCallback((isAuto = false) => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);

    if (!isAuto) {
      // Manual capture with countdown
      setCountdown(3);
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            performCapture();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Auto capture
      performCapture();
    }
  }, [isCapturing]);

  const performCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob and data URL
    canvas.toBlob((blob) => {
      const imageUrl = URL.createObjectURL(blob);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      
      setCapturedImage({
        blob,
        dataUrl,
        url: imageUrl,
        width: canvas.width,
        height: canvas.height,
        timestamp: new Date().toISOString(),
        quality: qualityAnalysis
      });

      setIsCapturing(false);
      
      // Stop quality analysis
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
      }
    }, 'image/jpeg', 0.85);
  };

  const retakePhoto = () => {
    if (capturedImage?.url) {
      URL.revokeObjectURL(capturedImage.url);
    }
    setCapturedImage(null);
    setQualityAnalysis(null);
    setCountdown(0);
    setIsCapturing(false);
    
    if (autoCapture) {
      startAutoCapture();
    }
    
    onRetake?.();
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCaptureComplete(capturedImage);
    }
  };

  const downloadImage = () => {
    if (capturedImage?.dataUrl) {
      const link = document.createElement('a');
      link.download = `face-capture-${Date.now()}.jpg`;
      link.href = capturedImage.dataUrl;
      link.click();
    }
  };

  const getQualityColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBadge = (score) => {
    if (score >= 85) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="p-4 bg-blue-100 rounded-2xl inline-block mb-6">
          <Camera className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          {capturedImage ? 'Review Your Photo' : 'Capture Your Photo'}
        </h2>
        <p className="text-lg text-slate-600">
          {capturedImage 
            ? 'Please review your captured image and quality analysis' 
            : 'Position yourself properly and we\'ll capture your photo automatically'
          }
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Camera/Image View */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-3">
                  <Camera className="w-6 h-6 text-blue-600" />
                  <span>{capturedImage ? 'Captured Image' : 'Live Camera'}</span>
                </CardTitle>
                {!capturedImage && (
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoCapture}
                        onChange={(e) => setAutoCapture(e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-600">Auto-capture</span>
                    </label>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!capturedImage ? (
                <div className="relative">
                  {/* Video stream */}
                  <div className="relative bg-black rounded-xl overflow-hidden">
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline 
                      muted
                      className="w-full aspect-video object-cover"
                    />
                    
                    {/* Face guide overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className={`w-64 h-80 border-4 rounded-2xl transition-colors ${
                        qualityAnalysis?.overall > 85 ? 'border-green-400' :
                        qualityAnalysis?.overall > 70 ? 'border-yellow-400' :
                        'border-white border-dashed'
                      }`}>
                        {/* Face detection indicators */}
                        {qualityAnalysis?.faceDetected && (
                          <div className="absolute -top-2 -right-2">
                            <CheckCircle className="w-6 h-6 text-green-400 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Countdown overlay */}
                    {countdown > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="text-center">
                          <div className="text-6xl font-bold text-white mb-2">{countdown}</div>
                          <p className="text-white text-lg">Get ready...</p>
                        </div>
                      </div>
                    )}

                    {/* Capturing indicator */}
                    {isCapturing && countdown === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-20">
                        <div className="text-center">
                          <Camera className="w-16 h-16 text-white animate-pulse mb-4" />
                          <p className="text-white text-lg font-semibold">Capturing...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Manual capture button */}
                  {!autoCapture && !isCapturing && (
                    <div className="flex justify-center mt-6">
                      <Button 
                        onClick={() => captureImage(false)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-xl"
                      >
                        <Camera className="w-5 h-5 mr-3" />
                        Capture Photo
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Captured image */}
                  <div className="relative">
                    <img 
                      src={capturedImage.dataUrl}
                      alt="Captured face"
                      className="w-full rounded-xl shadow-lg"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Captured
                      </Badge>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button 
                      onClick={retakePhoto}
                      variant="outline"
                      className="rounded-xl"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retake Photo
                    </Button>
                    <Button 
                      onClick={downloadImage}
                      variant="outline"
                      className="rounded-xl"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      onClick={confirmCapture}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm & Continue
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quality Analysis Panel */}
        <div>
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-purple-600" />
                <span>Image Quality</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!qualityAnalysis ? (
                <div className="text-center py-8">
                  <RotateCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-4" />
                  <p className="text-slate-500">Analyzing image quality...</p>
                </div>
              ) : (
                <>
                  {/* Overall Quality */}
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${getQualityColor(qualityAnalysis.overall)}`}>
                      {qualityAnalysis.overall}%
                    </div>
                    <Badge className={getQualityBadge(qualityAnalysis.overall)}>
                      {qualityAnalysis.overall >= 85 ? 'Excellent' : 
                       qualityAnalysis.overall >= 70 ? 'Good' : 'Poor'}
                    </Badge>
                  </div>

                  {/* Quality Metrics */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700 flex items-center">
                          <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                          Lighting
                        </span>
                        <span className="text-sm font-bold">{Math.round(qualityAnalysis.lighting)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            qualityAnalysis.lighting >= 80 ? 'bg-green-500' : 
                            qualityAnalysis.lighting >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${qualityAnalysis.lighting}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700 flex items-center">
                          <Eye className="w-4 h-4 mr-2 text-blue-500" />
                          Sharpness
                        </span>
                        <span className="text-sm font-bold">{Math.round(qualityAnalysis.sharpness)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            qualityAnalysis.sharpness >= 80 ? 'bg-green-500' : 
                            qualityAnalysis.sharpness >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${qualityAnalysis.sharpness}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-purple-500" />
                          Positioning
                        </span>
                        <span className="text-sm font-bold">{Math.round(qualityAnalysis.positioning)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            qualityAnalysis.positioning >= 80 ? 'bg-green-500' : 
                            qualityAnalysis.positioning >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${qualityAnalysis.positioning}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Detection Status */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Face Detected</span>
                      {qualityAnalysis.faceDetected ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Eyes Open</span>
                      {qualityAnalysis.eyesOpen ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Frontal Pose</span>
                      {qualityAnalysis.frontalPose ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {qualityAnalysis.overall < 85 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Improve Quality</h4>
                      <div className="text-sm text-yellow-700 space-y-1">
                        {qualityAnalysis.lighting < 80 && <p>• Improve lighting on your face</p>}
                        {qualityAnalysis.sharpness < 80 && <p>• Hold still for sharper image</p>}
                        {qualityAnalysis.positioning < 80 && <p>• Center your face in the frame</p>}
                        {!qualityAnalysis.faceDetected && <p>• Ensure your face is clearly visible</p>}
                        {!qualityAnalysis.eyesOpen && <p>• Keep your eyes open</p>}
                        {!qualityAnalysis.frontalPose && <p>• Look directly at the camera</p>}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default FaceCapture;