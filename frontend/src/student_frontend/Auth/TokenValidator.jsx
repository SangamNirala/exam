import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  User,
  FileText,
  Calendar,
  Loader2,
  RefreshCw,
  X
} from 'lucide-react';

const TokenValidator = ({ token, onValidationSuccess, onValidationError, onCancel }) => {
  const [validationStep, setValidationStep] = useState('format'); // format, server, complete
  const [validationResults, setValidationResults] = useState({
    format: null,
    exists: null,
    active: null,
    expired: null
  });
  const [tokenDetails, setTokenDetails] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      startValidation();
    }
  }, [token]);

  const validateTokenFormat = (token) => {
    // Check if token is exactly 8 characters and alphanumeric
    const formatRegex = /^[A-Z0-9]{8}$/;
    return formatRegex.test(token.toUpperCase());
  };

  const simulateServerValidation = async (token) => {
    // Simulate different server responses based on token
    const upperToken = token.toUpperCase();
    
    // Mock token database
    const tokenDatabase = {
      'DEMO1234': {
        id: 'demo-001',
        examId: 'exam-digital-literacy',
        examTitle: 'Digital Literacy Fundamentals',
        studentName: 'Demo Student',
        instructor: 'Prof. Sarah Johnson',
        duration: 30,
        questions: 15,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isActive: true,
        usageCount: 0,
        maxUsage: 3
      },
      'TEST5678': {
        id: 'test-002',
        examId: 'exam-ai-fundamentals',
        examTitle: 'AI Fundamentals Assessment',
        studentName: 'Test User',
        instructor: 'Dr. Michael Chen',
        duration: 45,
        questions: 20,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        isActive: true,
        usageCount: 1,
        maxUsage: 1
      },
      'SAMPLE99': {
        id: 'sample-003',
        examId: 'exam-programming-basics',
        examTitle: 'Programming Basics Quiz',
        studentName: 'Sample Student',
        instructor: 'Ms. Lisa Wang',
        duration: 60,
        questions: 25,
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isActive: true,
        usageCount: 0,
        maxUsage: 2
      },
      'EXPIRED1': {
        id: 'expired-001',
        examId: 'exam-expired',
        examTitle: 'Expired Assessment',
        studentName: 'Expired User',
        instructor: 'Dr. Test',
        duration: 30,
        questions: 10,
        expiresAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (expired)
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        isActive: false,
        usageCount: 0,
        maxUsage: 1
      }
    };

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const tokenData = tokenDatabase[upperToken];
        
        if (!tokenData) {
          reject(new Error('Token not found in system'));
          return;
        }

        const now = new Date();
        const isExpired = now > tokenData.expiresAt;
        const isUsageExceeded = tokenData.usageCount >= tokenData.maxUsage;

        resolve({
          exists: true,
          active: tokenData.isActive && !isExpired && !isUsageExceeded,
          expired: isExpired,
          usageExceeded: isUsageExceeded,
          tokenDetails: tokenData
        });
      }, 2000 + Math.random() * 1000); // 2-3 seconds delay
    });
  };

  const startValidation = async () => {
    setIsValidating(true);
    setError('');
    setValidationStep('format');

    try {
      // Step 1: Format validation
      const formatValid = validateTokenFormat(token);
      setValidationResults(prev => ({ ...prev, format: formatValid }));

      if (!formatValid) {
        throw new Error('Invalid token format. Token must be 8 alphanumeric characters.');
      }

      await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause for UX

      // Step 2: Server validation
      setValidationStep('server');
      const serverResult = await simulateServerValidation(token);
      
      setValidationResults(prev => ({
        ...prev,
        exists: serverResult.exists,
        active: serverResult.active,
        expired: serverResult.expired
      }));

      setTokenDetails(serverResult.tokenDetails);

      if (!serverResult.exists) {
        throw new Error('Token not found. Please check your token and try again.');
      }

      if (serverResult.expired) {
        throw new Error('Token has expired. Please contact your instructor for a new token.');
      }

      if (serverResult.usageExceeded) {
        throw new Error('Token usage limit exceeded. Please contact your instructor.');
      }

      if (!serverResult.active) {
        throw new Error('Token is not active. Please contact your instructor.');
      }

      // Step 3: Validation complete
      setValidationStep('complete');
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause for success display

      onValidationSuccess(token, serverResult.tokenDetails);

    } catch (error) {
      setError(error.message);
      onValidationError(error.message);
    } finally {
      setIsValidating(false);
    }
  };

  const ValidationStep = ({ step, title, status, description }) => {
    const getStatusIcon = () => {
      if (validationStep === step && isValidating) {
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      }
      if (status === true) {
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      }
      if (status === false) {
        return <X className="w-5 h-5 text-red-600" />;
      }
      return <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />;
    };

    const getStatusColor = () => {
      if (status === true) return 'border-green-300 bg-green-50';
      if (status === false) return 'border-red-300 bg-red-50';
      if (validationStep === step && isValidating) return 'border-blue-300 bg-blue-50';
      return 'border-slate-200 bg-white';
    };

    return (
      <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${getStatusColor()}`}>
        <div className="flex items-center space-x-4">
          {getStatusIcon()}
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900">{title}</h4>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
        </div>
      </div>
    );
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="p-4 bg-blue-100 rounded-2xl inline-block mb-6">
            <Shield className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Validating Your Token</h2>
          <p className="text-lg text-slate-600">
            Please wait while we verify your exam token and prepare your assessment.
          </p>
        </div>

        {/* Token Display */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Validating Token:</p>
              <div className="text-3xl font-mono font-bold text-blue-600 tracking-wider">
                {token}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation Steps */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Validation Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ValidationStep
              step="format"
              title="Token Format Check"
              status={validationResults.format}
              description="Verifying token meets required format (8 alphanumeric characters)"
            />
            <ValidationStep
              step="server"
              title="Server Verification"
              status={validationResults.exists}
              description="Checking token existence and validity in our secure database"
            />
            <ValidationStep
              step="complete"
              title="Access Authorization"
              status={validationResults.active}
              description="Confirming token is active and authorizing exam access"
            />
          </CardContent>
        </Card>

        {/* Token Details (shown after successful validation) */}
        {tokenDetails && validationStep === 'complete' && (
          <Card className="border-0 shadow-xl bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-green-800">Token Validated Successfully</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Assessment Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-slate-700">{tokenDetails.examTitle}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-slate-700">{tokenDetails.instructor}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-slate-700">{tokenDetails.duration} minutes • {tokenDetails.questions} questions</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Token Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-slate-700">Expires: {formatDate(tokenDetails.expiresAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-slate-700">
                        Usage: {tokenDetails.usageCount}/{tokenDetails.maxUsage}
                      </span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Valid & Active
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-0 shadow-lg border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">Validation Failed</h4>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {error && (
            <Button 
              variant="outline" 
              onClick={startValidation}
              className="rounded-xl"
              disabled={isValidating}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Validation
            </Button>
          )}
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="rounded-xl"
            disabled={isValidating}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TokenValidator;