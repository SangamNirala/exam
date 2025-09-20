import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Key,
  Play,
  CheckCircle,
  AlertCircle,
  Users,
  Clock,
  FileText,
  Shield,
  Accessibility,
  Volume2,
  Mic,
  Type,
  Eye,
  Keyboard,
  HelpCircle
} from 'lucide-react';
import { useStudent } from '../../contexts/StudentContext';

const LoginScreen = () => {
  const { state, setView, setAuthToken, toggleAccessibility } = useStudent();
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [showAccessibilityHelp, setShowAccessibilityHelp] = useState(false);

  const mockExamInfo = {
    title: "Digital Literacy Fundamentals",
    duration: "30 minutes",
    questions: 15,
    type: "Multiple Choice",
    instructor: "Prof. Sarah Johnson"
  };

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter your exam token');
      return;
    }

    setIsValidating(true);
    setError('');

    // Simulate token validation
    setTimeout(() => {
      if (token.toLowerCase() === 'demo' || token.length >= 6) {
        setAuthToken(token);
        setView('dashboard');
      } else {
        setError('Invalid token. Please check and try again.');
      }
      setIsValidating(false);
    }, 1500);
  };

  const AccessibilityToggle = ({ feature, icon: Icon, label, description }) => (
    <button
      onClick={() => toggleAccessibility(feature)}
      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
        state.accessibility[feature]
          ? 'border-blue-300 bg-blue-50'
          : 'border-slate-200 hover:border-slate-300 bg-white'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${
          state.accessibility[feature] ? 'bg-blue-100' : 'bg-slate-100'
        }`}>
          <Icon className={`w-5 h-5 ${
            state.accessibility[feature] ? 'text-blue-600' : 'text-slate-500'
          }`} />
        </div>
        <div className="text-left">
          <h4 className="font-medium text-slate-900">{label}</h4>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
        state.accessibility[feature]
          ? 'border-blue-500 bg-blue-500'
          : 'border-slate-300'
      }`}>
        {state.accessibility[feature] && (
          <CheckCircle className="w-4 h-4 text-white" />
        )}
      </div>
    </button>
  );

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
            Enter your unique exam token to begin. Our platform is designed to be accessible 
            and inclusive for all learners.
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
                    placeholder="Enter your exam token (try: demo)"
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value);
                      setError('');
                    }}
                    className={`text-center text-lg font-mono tracking-wider rounded-xl border-2 transition-all duration-200 ${
                      error ? 'border-red-300 focus:border-red-500' : 'focus:border-blue-500'
                    }`}
                    disabled={isValidating}
                  />
                  {error && (
                    <div className="flex items-center mt-2 text-red-600">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                  <p className="text-sm text-slate-500 mt-2 text-center">
                    Token provided by your instructor
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-xl transition-all duration-300 disabled:opacity-50"
                  disabled={isValidating || !token.trim()}
                >
                  {isValidating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      Validating Token...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-3" />
                      Start Assessment
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
                  and assessment capabilities.
                </p>
                <div className="bg-white rounded-lg p-3">
                  <code className="text-blue-600 font-mono font-bold">demo</code>
                  <span className="text-slate-600 ml-2">← Use this token to try the demo</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Features */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Accessibility className="w-6 h-6 text-purple-600" />
                  <span>Accessibility Features</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAccessibilityHelp(true)}
                  className="rounded-lg"
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </CardTitle>
              <p className="text-slate-600">Customize your assessment experience</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <AccessibilityToggle
                feature="textToSpeech"
                icon={Volume2}
                label="Text-to-Speech"
                description="Listen to questions and content"
              />
              <AccessibilityToggle
                feature="speechToText"
                icon={Mic}
                label="Speech-to-Text"
                description="Voice input for answers"
              />
              <AccessibilityToggle
                feature="largeText"
                icon={Type}
                label="Large Text"
                description="Increase font size"
              />
              <AccessibilityToggle
                feature="highContrast"
                icon={Eye}
                label="High Contrast"
                description="Enhanced visibility"
              />
              <AccessibilityToggle
                feature="keyboardNavigation"
                icon={Keyboard}
                label="Keyboard Navigation"
                description="Navigate without mouse"
              />

              <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                    WCAG 2.1 AAA Compliant
                  </Badge>
                </div>
                <p className="text-sm text-purple-700">
                  Our platform meets the highest accessibility standards to ensure 
                  equal access for all learners.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sample Assessment Preview */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-slate-50 to-blue-50">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Sample Assessment Preview</h3>
              <p className="text-slate-600">Here's what you can expect</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-slate-900 mb-4">{mockExamInfo.title}</h4>
                <div className="space-y-3 text-slate-600">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Duration: {mockExamInfo.duration}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span>{mockExamInfo.questions} questions • {mockExamInfo.type}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span>Instructor: {mockExamInfo.instructor}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h5 className="font-semibold text-slate-900 mb-3">Assessment Features</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-700">Auto-save progress</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-700">Review before submit</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-700">Offline capability</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-700">Instant feedback</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Modal */}
        {showAccessibilityHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Accessibility Help</CardTitle>
                  <Button variant="ghost" onClick={() => setShowAccessibilityHelp(false)}>
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Text-to-Speech</h4>
                    <p className="text-sm text-slate-600">
                      Automatically reads questions, answers, and instructions aloud. 
                      Great for visual impairments or learning disabilities.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Speech-to-Text</h4>
                    <p className="text-sm text-slate-600">
                      Speak your answers instead of typing. Perfect for motor disabilities 
                      or when typing is difficult.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">High Contrast & Large Text</h4>
                    <p className="text-sm text-slate-600">
                      Improve readability with enhanced contrast and larger fonts. 
                      Helpful for visual impairments and dyslexia.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Keyboard Navigation</h4>
                    <p className="text-sm text-slate-600">
                      Navigate the entire assessment using only keyboard. 
                      Essential for motor disabilities and screen reader users.
                    </p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-700">
                    <strong>Need more help?</strong> These features can be enabled at any time 
                    during your assessment. Contact your instructor if you need additional support.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;