import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Key,
  Play,
  CheckCircle,
  AlertCircle,
  Shield,
  Accessibility,
  HelpCircle,
  Eye,
  EyeOff,
  Clock,
  Users,
  FileText,
  ArrowLeft
} from 'lucide-react';

const StudentPortalEntry = ({ onBack, onAuthSuccess }) => {
  const [examToken, setExamToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  // Rate limiting - block after 5 failed attempts for 15 minutes
  const MAX_ATTEMPTS = 5;
  const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

  // Check if user is currently blocked
  useEffect(() => {
    const blockData = localStorage.getItem('student-auth-block');
    if (blockData) {
      const { timestamp, attempts } = JSON.parse(blockData);
      const timeElapsed = Date.now() - timestamp;
      
      if (attempts >= MAX_ATTEMPTS && timeElapsed < BLOCK_DURATION) {
        setIsBlocked(true);
        setBlockTimeRemaining(Math.ceil((BLOCK_DURATION - timeElapsed) / 1000));
        setAttemptCount(attempts);
      } else if (timeElapsed >= BLOCK_DURATION) {
        // Block period expired, reset
        localStorage.removeItem('student-auth-block');
        setAttemptCount(0);
      } else {
        setAttemptCount(attempts);
      }
    }
  }, []);

  // Countdown timer for block period
  useEffect(() => {
    if (isBlocked && blockTimeRemaining > 0) {
      const timer = setInterval(() => {
        setBlockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            localStorage.removeItem('student-auth-block');
            setAttemptCount(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isBlocked, blockTimeRemaining]);

  const validateTokenFormat = (token) => {
    // Token should be 8-character alphanumeric
    const tokenRegex = /^[A-Z0-9]{8}$/;
    return tokenRegex.test(token.toUpperCase());
  };

  const updateAttemptCount = (newCount) => {
    const blockData = {
      timestamp: Date.now(),
      attempts: newCount
    };
    localStorage.setItem('student-auth-block', JSON.stringify(blockData));
    setAttemptCount(newCount);

    if (newCount >= MAX_ATTEMPTS) {
      setIsBlocked(true);
      setBlockTimeRemaining(BLOCK_DURATION / 1000);
    }
  };

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    
    if (isBlocked) {
      setError(`Too many failed attempts. Please wait ${Math.ceil(blockTimeRemaining / 60)} minutes.`);
      return;
    }

    if (!examToken.trim()) {
      setError('Please enter your exam token');
      return;
    }

    // Format validation
    if (!validateTokenFormat(examToken)) {
      setError('Invalid token format. Please enter an 8-character alphanumeric token.');
      const newAttemptCount = attemptCount + 1;
      updateAttemptCount(newAttemptCount);
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      // Simulate backend validation with different scenarios
      await new Promise(resolve => setTimeout(resolve, 1500));

      const upperToken = examToken.toUpperCase();
      
      // Valid demo tokens
      const validTokens = ['DEMO1234', 'TEST5678', 'SAMPLE99'];
      
      if (validTokens.includes(upperToken)) {
        // Success - reset attempt count
        localStorage.removeItem('student-auth-block');
        onAuthSuccess(upperToken);
      } else if (upperToken === 'EXPIRED1') {
        setError('Token has expired. Please contact your instructor for a new token.');
        const newAttemptCount = attemptCount + 1;
        updateAttemptCount(newAttemptCount);
      } else {
        setError('Invalid token. Please check your token and try again.');
        const newAttemptCount = attemptCount + 1;
        updateAttemptCount(newAttemptCount);
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAttemptMessage = () => {
    const remaining = MAX_ATTEMPTS - attemptCount;
    if (remaining <= 2 && remaining > 0) {
      return `${remaining} attempt${remaining === 1 ? '' : 's'} remaining`;
    }
    return '';
  };

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
                Back to Home
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <h1 className="text-2xl font-bold text-slate-900">Student Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Shield className="w-4 h-4 mr-1" />
                Secure Environment
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl inline-block mb-8">
            <Key className="w-16 h-16 text-blue-600 mx-auto" />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Welcome to Your Assessment</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Enter your unique exam token to begin your secure assessment. Our system ensures 
            a fair and accessible testing environment for all students.
          </p>
        </div>

        {/* Token Input Card */}
        <Card className="border-0 shadow-2xl max-w-lg mx-auto mb-12">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-slate-900">Enter Exam Token</CardTitle>
            <p className="text-slate-600">Provided by your instructor</p>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            {isBlocked && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-800">Account Temporarily Blocked</h4>
                    <p className="text-red-700 text-sm">
                      Too many failed attempts. Please wait {formatTime(blockTimeRemaining)} before trying again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleTokenSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Exam Token (8 characters)
                </label>
                <div className="relative">
                  <Input
                    type={showToken ? "text" : "password"}
                    placeholder="Enter token (e.g., DEMO1234)"
                    value={examToken}
                    onChange={(e) => {
                      setExamToken(e.target.value.toUpperCase());
                      setError('');
                    }}
                    maxLength={8}
                    className={`text-center text-xl font-mono tracking-wider rounded-xl border-2 h-14 pr-12 transition-all duration-200 ${
                      error ? 'border-red-300 focus:border-red-500' : 'focus:border-blue-500'
                    }`}
                    disabled={isValidating || isBlocked}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                
                {error && (
                  <div className="flex items-center mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}

                {getAttemptMessage() && !error && (
                  <div className="flex items-center mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" />
                    <span className="text-yellow-700 text-sm">{getAttemptMessage()}</span>
                  </div>
                )}

                <p className="text-sm text-slate-500 mt-3 text-center">
                  Format: 8-character alphanumeric code (A-Z, 0-9)
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-xl transition-all duration-300 disabled:opacity-50"
                disabled={isValidating || isBlocked || !examToken.trim()}
              >
                {isValidating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    Validating Token...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-3" />
                    Proceed to Verification
                  </>
                )}
              </Button>
            </form>

            {/* Demo Token Info */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-slate-900">Demo Tokens Available</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Try our assessment platform with these demo tokens:
              </p>
              <div className="space-y-2">
                {['DEMO1234', 'TEST5678', 'SAMPLE99'].map(token => (
                  <div key={token} className="bg-white rounded-lg p-3 flex items-center justify-between">
                    <code className="text-blue-600 font-mono font-bold">{token}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExamToken(token)}
                      className="text-xs"
                    >
                      Use This
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-green-600" />
                <span>Security Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-slate-700">Token-based authentication</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-slate-700">Rate limiting protection</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-slate-700">Secure session management</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-slate-700">Encrypted data transmission</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Accessibility className="w-6 h-6 text-purple-600" />
                <span>Accessibility Ready</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-slate-700">Screen reader compatible</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-slate-700">Keyboard navigation</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-slate-700">High contrast mode</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-slate-700">Text-to-speech support</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-blue-50">
          <CardContent className="p-8">
            <div className="text-center">
              <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Need Help?</h3>
              <p className="text-slate-600 mb-6">
                If you're having trouble with your token or need assistance, we're here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="rounded-xl">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="rounded-xl">
                  <FileText className="w-4 h-4 mr-2" />
                  User Guide
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentPortalEntry;