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
  Timer,
  Users,
  FileText,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useStudent } from '../../contexts/StudentContext';

const EnhancedTokenLogin = () => {
  const { state, setView, setAuthToken, setExamInfo } = useStudent();
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitTime, setRateLimitTime] = useState(0);

  // Rate limiting countdown
  useEffect(() => {
    let interval;
    if (isRateLimited && rateLimitTime > 0) {
      interval = setInterval(() => {
        setRateLimitTime((prev) => {
          if (prev <= 1) {
            setIsRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRateLimited, rateLimitTime]);

  const validateToken = async (tokenValue) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tokens/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenValue }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Token validation error:', error);
      return {
        valid: false,
        error_message: 'Network error. Please check your connection and try again.'
      };
    }
  };

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('Please enter your exam token');
      return;
    }

    // Check rate limiting
    if (isRateLimited) {
      return;
    }

    // Token format validation (8-character alphanumeric)
    const tokenRegex = /^[A-Za-z0-9]{4,}$/;
    if (!tokenRegex.test(token)) {
      setError('Token must be at least 4 characters long and contain only letters and numbers');
      return;
    }

    setIsValidating(true);
    setError('');

    const result = await validateToken(token);

    if (result.valid && result.exam_info) {
      // Success - store token and exam info
      setAuthToken(token);
      setExamInfo(result.exam_info);
      setView('instructions'); // Go to instructions page
      setAttempts(0);
    } else {
      // Handle failed attempts
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(result.error_message || 'Invalid token. Please check and try again.');

      // Rate limiting after 3 attempts
      if (newAttempts >= 3) {
        setIsRateLimited(true);
        setRateLimitTime(60 * Math.pow(2, Math.floor(newAttempts / 3) - 1)); // Exponential backoff
      }
    }

    setIsValidating(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl inline-block mb-6">
            <Key className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Welcome to Your Assessment</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Enter your unique exam token to begin. Our platform ensures a secure, accessible, 
            and fair assessment experience for all students.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Token Login Form */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-3">
                <Shield className="w-6 h-6 text-green-600" />
                <span>Secure Token Login</span>
              </CardTitle>
              <p className="text-slate-600">No registration required - just your token</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleTokenSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Exam Token
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your exam token (e.g., ABC12345)"
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value.toUpperCase());
                      setError('');
                    }}
                    className={`text-center text-lg font-mono tracking-wider rounded-xl border-2 transition-all duration-200 ${
                      error ? 'border-red-300 focus:border-red-500' : 'focus:border-blue-500'
                    }`}
                    disabled={isValidating || isRateLimited}
                    maxLength={20}
                  />
                  
                  {error && (
                    <div className="flex items-center mt-2 text-red-600">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                  
                  {isRateLimited && (
                    <div className="flex items-center mt-2 text-orange-600">
                      <Timer className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        Too many attempts. Please wait {formatTime(rateLimitTime)} before retrying.
                      </span>
                    </div>
                  )}
                  
                  <p className="text-sm text-slate-500 mt-2 text-center">
                    Token provided by your instructor
                  </p>
                </div>

                {attempts > 0 && attempts < 3 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-700">
                        {attempts} of 3 attempts used. {3 - attempts} remaining.
                      </span>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-xl transition-all duration-300 disabled:opacity-50"
                  disabled={isValidating || !token.trim() || isRateLimited}
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Validating Token...
                    </>
                  ) : isRateLimited ? (
                    <>
                      <Timer className="w-5 h-5 mr-3" />
                      Please Wait ({formatTime(rateLimitTime)})
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-3" />
                      Validate & Continue
                    </>
                  )}
                </Button>
              </form>

              {/* Demo Information */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-slate-900">Demo Available</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Try our platform with the demo token. Experience all accessibility features 
                  and assessment capabilities with a sample exam.
                </p>
                <div className="bg-white rounded-lg p-3">
                  <code className="text-blue-600 font-mono font-bold text-lg">DEMO</code>
                  <span className="text-slate-600 ml-2">← Use this token to try the demo</span>
                </div>
              </div>

              {/* Support Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="text-slate-600">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-600">
                    Retrieve Lost Token
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Accessibility className="w-6 h-6 text-purple-600" />
                <span>Assessment Information</span>
              </CardTitle>
              <p className="text-slate-600">What to expect in your exam</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Security Features */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Security & Privacy</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-700">Secure token-based authentication</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-700">End-to-end encrypted connections</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-700">Privacy-compliant data handling</span>
                  </div>
                </div>
              </div>

              {/* Accessibility Features */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Accessibility Support</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-slate-700">Text-to-speech functionality</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-slate-700">Adjustable font size and contrast</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-slate-700">Keyboard navigation support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-slate-700">Screen reader optimization</span>
                  </div>
                </div>
              </div>

              {/* System Requirements */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-3">System Requirements</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <span>Modern web browser (Chrome, Firefox, Safari, Edge)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <span>Stable internet connection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <span>JavaScript enabled</span>
                  </div>
                </div>
              </div>

              {/* WCAG Compliance Badge */}
              <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                    WCAG 2.1 AAA Compliant
                  </Badge>
                </div>
                <p className="text-sm text-purple-700">
                  Our platform meets the highest accessibility standards to ensure 
                  equal access for all learners with diverse abilities.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTokenLogin;