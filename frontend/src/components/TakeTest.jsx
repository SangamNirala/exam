import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Key,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Shield,
  Clock,
  FileText,
  HelpCircle,
  Eye,
  EyeOff,
  Copy,
  Play,
  Home,
  Timer,
  Book
} from 'lucide-react';
import ExamInterface from '../student_frontend/Assessment/ExamInterface';
import { useStudent } from '../contexts/StudentContext';

const TakeTest = () => {
  const [currentStep, setCurrentStep] = useState('token-entry');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [examData, setExamData] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  // Get backend URL from environment
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Demo tokens for easy access
  const demoTokens = ['DEMO1234', 'TEST5678', 'SAMPLE99'];

  // Handle token input changes
  const handleTokenChange = (value) => {
    setToken(value.toUpperCase().trim());
    if (validationResult) {
      setValidationResult(null);
    }
  };

  // Handle token validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setValidationResult({
        success: false,
        message: 'Please enter your exam token'
      });
      return;
    }

    // Validate token format - support both demo tokens (8 chars) and admin-generated tokens (with hyphens)
    const isDemoToken = demoTokens.includes(token);
    const isValidDemoFormat = /^[A-Z0-9]{8}$/.test(token);
    const isValidAdminFormat = /^[A-Z0-9]{4}-[A-Z0-9]{3,4}$/.test(token);
    
    if (!isDemoToken && !isValidDemoFormat && !isValidAdminFormat) {
      setValidationResult({
        success: false,
        message: 'Invalid token format. Token should be 8 alphanumeric characters or in XXXX-XXX format.'
      });
      setAttempts(prev => prev + 1);
      return;
    }

    setIsValidating(true);
    
    try {
      const response = await fetch(`${backendUrl}/api/student/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setValidationResult({
          success: true,
          message: 'Token validated successfully! Starting exam...'
        });
        
        // Set exam data for the ExamInterface
        setExamData({
          token: data.student_token,
          examInfo: data.exam_info
        });

        // Proceed directly to exam after a short delay
        setTimeout(() => {
          setCurrentStep('exam');
        }, 2000);
      } else {
        setValidationResult({
          success: false,
          message: data.message || 'Invalid token. Please try again.'
        });
        setAttempts(prev => prev + 1);
      }
    } catch (error) {
      setValidationResult({
        success: false,
        message: 'Connection error. Please check your internet connection and try again.'
      });
      setAttempts(prev => prev + 1);
    } finally {
      setIsValidating(false);
    }
  };

  // Handle token copy
  const copyToken = (tokenToCopy) => {
    setToken(tokenToCopy);
    navigator.clipboard.writeText(tokenToCopy);
  };

  // Calculate remaining attempts
  const remainingAttempts = maxAttempts - attempts;
  const isBlocked = attempts >= maxAttempts;

  // Go back to landing page
  const goBackToLanding = () => {
    window.location.href = '/';
  };

  // If user is in exam, show the ExamInterface
  if (currentStep === 'exam' && examData) {
    return <ExamInterface />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={goBackToLanding}
            className="mb-6 rounded-xl hover:bg-green-100"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl inline-block mb-6">
            <Play className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Take Test</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Enter your exam token to start your assessment immediately.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Token Entry Form */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-3">
                <Shield className="w-6 h-6 text-green-600" />
                <span>Quick Token Access</span>
              </CardTitle>
              <p className="text-slate-600">Enter your token and start your exam instantly</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Exam Token
                  </label>
                  <div className="relative">
                    <Input
                      type={showToken ? "text" : "password"}
                      placeholder="Enter your token (e.g. DEMO1234 or ABCD-EFG)"
                      value={token}
                      onChange={(e) => handleTokenChange(e.target.value)}
                      className={`text-center text-xl font-mono tracking-wider rounded-xl border-2 transition-all duration-200 pr-12 ${
                        validationResult && !validationResult.success 
                          ? 'border-red-300 focus:border-red-500' 
                          : validationResult?.success
                          ? 'border-green-300 focus:border-green-500'
                          : 'focus:border-green-500'
                      }`}
                      disabled={isValidating || isBlocked}
                      maxLength={12}
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      disabled={isValidating}
                    >
                      {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Character counter */}
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-slate-500">
                      {token.length}/12 characters
                    </span>
                    {!isBlocked && (
                      <span className="text-slate-500">
                        {remainingAttempts} attempts remaining
                      </span>
                    )}
                  </div>

                  {/* Error Messages */}
                  {validationResult && !validationResult.success && (
                    <div className="flex items-start mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-red-700 font-medium">
                          {validationResult.message}
                        </p>
                        {isBlocked && (
                          <p className="text-red-600 text-sm mt-1">
                            Too many failed attempts. Please refresh the page or contact your instructor.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {validationResult?.success && (
                    <div className="flex items-start mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-green-700 font-medium">
                          {validationResult.message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-4 text-lg font-semibold rounded-xl transition-all duration-300 disabled:opacity-50"
                  disabled={isValidating || !token.trim() || isBlocked || validationResult?.success}
                >
                  {isValidating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      Validating Token...
                    </>
                  ) : validationResult?.success ? (
                    <>
                      <Timer className="w-5 h-5 mr-3" />
                      Starting Exam...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-3" />
                      Start Test
                    </>
                  )}
                </Button>
              </form>

              {/* Security Info */}
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Secure & Fast</span>
                </div>
                <p className="text-xs text-green-600">
                  Instant token validation with secure encrypted connections
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Demo Tokens & Info */}
          <div className="space-y-6">
            {/* Demo Tokens */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span>Try Demo Tokens</span>
                  </div>
                </CardTitle>
                <p className="text-slate-600">Quick access demo tokens for testing</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {demoTokens.map((demoToken, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div>
                      <code className="text-lg font-mono font-bold text-green-700">
                        {demoToken}
                      </code>
                      <p className="text-sm text-slate-600 mt-1">
                        Demo Token {index + 1} - Instant access
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToken(demoToken)}
                      className="rounded-lg border-green-200 text-green-700 hover:bg-green-50"
                      disabled={isValidating}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Use
                    </Button>
                  </div>
                ))}
                
                <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-start space-x-2">
                    <Book className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-emerald-700">
                      <strong>Demo Features:</strong> Experience our complete assessment interface with 
                      sample questions and full functionality.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exam Preview */}
            {examData?.examInfo && (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-green-600" />
                    <span>Exam Ready</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">{examData.examInfo.title}</h4>
                    {examData.examInfo.description && (
                      <p className="text-slate-600 text-sm mb-4">{examData.examInfo.description}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="text-slate-600">Duration: {examData.examInfo.duration} minutes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-slate-600">{examData.examInfo.question_count} questions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {examData.examInfo.exam_type?.toUpperCase() || 'Mixed'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {examData.examInfo.difficulty || 'Intermediate'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Section */}
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <HelpCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Quick Start Guide</h4>
                    <p className="text-slate-600 text-sm mb-4">
                      Enter your token above and start your exam immediately - no additional steps required.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        <span className="text-slate-700">Admin tokens: XXXX-XXX format</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        <span className="text-slate-700">Demo tokens: 8 characters</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        <span className="text-slate-700">Instant exam access</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeTest;