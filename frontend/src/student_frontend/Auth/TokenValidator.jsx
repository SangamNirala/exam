import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Key,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Shield,
  Clock,
  Users,
  FileText,
  HelpCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  AlertTriangle
} from 'lucide-react';
import { useStudentAuth } from '../../contexts/StudentAuthContext';

const TokenValidator = () => {
  const { state, setStep, validateToken, resetTokenValidation } = useStudentAuth();
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const { tokenValidation, examInfo, studentInfo } = state;
  const { isValidating, error, attempts, maxAttempts } = tokenValidation;

  // Demo tokens for easy access
  const demoTokens = ['DEMO1234', 'TEST5678', 'SAMPLE99'];

  // Reset validation state when component mounts
  useEffect(() => {
    resetTokenValidation();
  }, [resetTokenValidation]);

  // Handle token input changes
  const handleTokenChange = (value) => {
    setToken(value.toUpperCase().trim());
    if (error) resetValidationResult();
  };

  // Reset validation result
  const resetValidationResult = () => {
    setValidationResult(null);
    resetTokenValidation();
  };

  // Handle token submission
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
    const isValidAdminFormat = /^[A-Z0-9]{4}-[A-Z0-9]{3,4}$/.test(token); // Format like ZPCU-KOC, DDHV-HNVR
    
    if (!isDemoToken && !isValidDemoFormat && !isValidAdminFormat) {
      setValidationResult({
        success: false,
        message: 'Invalid token format. Token should be 8 alphanumeric characters or in XXXX-XXX format.'
      });
      return;
    }

    const result = await validateToken(token);
    setValidationResult(result);
    
    if (result.success) {
      // FACE VERIFICATION BYPASSED: Go directly to instructions after successful token validation
      setTimeout(() => {
        setStep('instructions');
      }, 2000);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => setStep('entry')}
            className="mb-6 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portal
          </Button>
          
          <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl inline-block mb-6">
            <Key className="w-12 h-12 text-blue-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Enter Your Exam Token</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Please enter the unique token provided by your instructor to access your assessment.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Token Entry Form */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-3">
                <Shield className="w-6 h-6 text-green-600" />
                <span>Secure Token Validation</span>
              </CardTitle>
              <p className="text-slate-600">Your token is encrypted and validated securely</p>
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
                      placeholder="Enter your 8-character token"
                      value={token}
                      onChange={(e) => handleTokenChange(e.target.value)}
                      className={`text-center text-xl font-mono tracking-wider rounded-xl border-2 transition-all duration-200 pr-12 ${
                        error || (validationResult && !validationResult.success) 
                          ? 'border-red-300 focus:border-red-500' 
                          : validationResult?.success
                          ? 'border-green-300 focus:border-green-500'
                          : 'focus:border-blue-500'
                      }`}
                      disabled={isValidating || isBlocked}
                      maxLength={8}
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
                      {token.length}/8 characters
                    </span>
                    {!isBlocked && (
                      <span className="text-slate-500">
                        {remainingAttempts} attempts remaining
                      </span>
                    )}
                  </div>

                  {/* Error Messages */}
                  {(error || (validationResult && !validationResult.success)) && (
                    <div className="flex items-start mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-red-700 font-medium">
                          {error || validationResult?.message}
                        </p>
                        {isBlocked && (
                          <p className="text-red-600 text-sm mt-1">
                            Too many failed attempts. Please contact your instructor or try again later.
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
                          Token validated successfully!
                        </p>
                        <p className="text-green-600 text-sm mt-1">
                          Proceeding to exam instructions...
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-xl transition-all duration-300 disabled:opacity-50"
                  disabled={isValidating || !token.trim() || isBlocked || validationResult?.success}
                >
                  {isValidating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      Validating Token...
                    </>
                  ) : validationResult?.success ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-3" />
                      Validation Complete
                    </>
                  ) : (
                    <>
                      <Key className="w-5 h-5 mr-3" />
                      Validate Token
                    </>
                  )}
                </Button>
              </form>

              {/* Security Info */}
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Secure Validation</span>
                </div>
                <p className="text-xs text-slate-600">
                  All tokens are validated using encrypted connections and stored securely
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
                    <span>Demo Tokens Available</span>
                  </div>
                </CardTitle>
                <p className="text-slate-600">Try our platform with these demo tokens</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {demoTokens.map((demoToken, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                    <div>
                      <code className="text-lg font-mono font-bold text-green-700">
                        {demoToken}
                      </code>
                      <p className="text-sm text-slate-600 mt-1">
                        Demo Token {index + 1} - Full platform access
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToken(demoToken)}
                      className="rounded-lg"
                      disabled={isValidating}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Use
                    </Button>
                  </div>
                ))}
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <strong>Demo Features:</strong> Experience facial recognition, accessibility features, 
                      sample questions, and our complete assessment interface.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exam Information */}
            {examInfo && (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <span>Assessment Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">{examInfo.title}</h4>
                    {examInfo.description && (
                      <p className="text-slate-600 text-sm mb-4">{examInfo.description}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-slate-600">Duration: {examInfo.duration} minutes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-slate-600">{examInfo.question_count} questions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {examInfo.exam_type?.toUpperCase() || 'Mixed'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {examInfo.difficulty || 'Intermediate'}
                      </Badge>
                    </div>
                  </div>
                  
                  {studentInfo?.name && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          Welcome, {studentInfo.name}
                        </span>
                      </div>
                    </div>
                  )}
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
                    <h4 className="font-semibold text-slate-900 mb-2">Need Help?</h4>
                    <p className="text-slate-600 text-sm mb-4">
                      If you don't have your token or encounter issues, please contact your instructor.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <span className="text-slate-700">Tokens are case-insensitive</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <span className="text-slate-700">Tokens are valid for single use</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <span className="text-slate-700">Demo tokens can be reused</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Rate Limiting Warning */}
        {attempts > 0 && !isBlocked && (
          <Card className="border-0 shadow-lg bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-yellow-800 font-medium">
                    {attempts === 1 ? 'First attempt failed' : `${attempts} attempts made`}
                  </p>
                  <p className="text-yellow-700 text-sm">
                    You have {remainingAttempts} more attempts before being temporarily blocked.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TokenValidator;