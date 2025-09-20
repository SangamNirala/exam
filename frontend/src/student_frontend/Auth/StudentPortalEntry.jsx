import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Key,
  Shield,
  Camera,
  CheckCircle,
  AlertCircle,
  Users,
  Clock,
  FileText,
  Accessibility,
  Eye,
  Volume2,
  Star,
  Award,
  Zap,
  Lock,
  ArrowRight,
  Play,
  BookOpen,
  Globe,
  Heart
} from 'lucide-react';
import { useStudentAuth } from '../../contexts/StudentAuthContext';

const StudentPortalEntry = () => {
  const { state, setStep, createDemoTokens } = useStudentAuth();
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);
  const [demoTokens, setDemoTokens] = useState([]);
  const [showFeatures, setShowFeatures] = useState(false);

  // Auto-create demo tokens on component mount
  useEffect(() => {
    const initializeDemoTokens = async () => {
      setIsCreatingDemo(true);
      try {
        const result = await createDemoTokens();
        if (result.success) {
          setDemoTokens(result.data.tokens || []);
        }
      } catch (error) {
        console.error('Failed to create demo tokens:', error);
      } finally {
        setIsCreatingDemo(false);
      }
    };

    initializeDemoTokens();
  }, [createDemoTokens]);

  const features = [
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Multi-layer security with token validation and biometric verification',
      color: 'blue'
    },
    {
      icon: Camera,
      title: 'Facial Recognition',
      description: 'Advanced facial recognition for identity verification and exam monitoring',
      color: 'green'
    },
    {
      icon: Accessibility,
      title: 'Full Accessibility',
      description: 'WCAG 2.1 AAA compliant with comprehensive disability support',
      color: 'purple'
    },
    {
      icon: Eye,
      title: 'Exam Monitoring',
      description: 'AI-powered behavior analysis ensures exam integrity',
      color: 'orange'
    },
    {
      icon: Volume2,
      title: 'Audio Support',
      description: 'Text-to-speech, voice commands, and audio instructions',
      color: 'pink'
    },
    {
      icon: Zap,
      title: 'Real-time Processing',
      description: 'Instant feedback and seamless exam experience',
      color: 'yellow'
    }
  ];

  const stats = [
    { icon: Users, label: 'Students Served', value: '10,000+', color: 'blue' },
    { icon: CheckCircle, label: 'Success Rate', value: '99.8%', color: 'green' },
    { icon: Award, label: 'Accessibility Rating', value: 'AAA', color: 'purple' },
    { icon: Star, label: 'User Satisfaction', value: '4.9/5', color: 'yellow' }
  ];

  const FeatureCard = ({ feature }) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 bg-${feature.color}-100 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
            <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">{feature.title}</h4>
            <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const StatCard = ({ stat }) => (
    <div className="text-center">
      <div className={`inline-flex p-3 bg-${stat.color}-100 rounded-xl mb-3`}>
        <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
      <div className="text-sm text-slate-600">{stat.label}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            {/* Logo/Icon */}
            <div className="inline-flex items-center space-x-3 mb-8">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-slate-900">StudentScan Portal</h1>
                <p className="text-slate-600 text-sm">Advanced Assessment Platform</p>
              </div>
            </div>

            {/* Main Heading */}
            <h2 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Welcome to Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Secure Assessment Experience
              </span>
            </h2>

            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Experience next-generation online assessments with advanced security, 
              comprehensive accessibility features, and AI-powered monitoring that 
              ensures fairness while respecting your privacy.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button 
                onClick={() => setStep('token')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                disabled={state.loading}
              >
                <Key className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                Enter Assessment Portal
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setShowFeatures(!showFeatures)}
                className="border-2 border-slate-300 hover:border-blue-400 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
              >
                <Eye className="w-5 h-5 mr-3" />
                Explore Features
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      {showFeatures && (
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Powerful Features for Everyone
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform is designed with advanced technology and inclusive design 
              principles to provide the best assessment experience for all students.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      )}

      {/* Demo Section */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl mb-4">
                <Play className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Try Our Demo Assessment</h3>
              <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Experience all features of our platform with our interactive demo. 
                Test facial recognition, accessibility features, and our comprehensive 
                assessment interface.
              </p>
            </div>

            {/* Demo Tokens */}
            {demoTokens.length > 0 && (
              <div className="bg-white rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
                  <Key className="w-5 h-5 mr-2 text-blue-600" />
                  Demo Tokens Available
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {demoTokens.map((token, index) => (
                    <div key={index} className="bg-slate-50 rounded-lg p-4 text-center">
                      <code className="text-lg font-mono font-bold text-blue-600 block mb-2">
                        {token}
                      </code>
                      <span className="text-sm text-slate-600">Demo Token {index + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <strong>Instructions:</strong> Copy any token above and use it in the next step. 
                      Each demo token provides full access to our assessment platform with sample questions.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isCreatingDemo && (
              <div className="text-center py-8">
                <div className="inline-flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-slate-600">Preparing demo environment...</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="text-center">
              <Button 
                onClick={() => setStep('token')}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                disabled={state.loading || isCreatingDemo}
              >
                <Play className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                Start Demo Assessment
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trust Indicators */}
      <div className="bg-slate-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">Trusted by Educational Institutions Worldwide</h3>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Our platform meets the highest standards for security, accessibility, and reliability.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <Lock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Bank-Grade Security</h4>
              <p className="text-sm text-slate-300">End-to-end encryption and secure data handling</p>
            </div>
            <div className="text-center">
              <Globe className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">GDPR Compliant</h4>
              <p className="text-sm text-slate-300">Full privacy protection and data rights</p>
            </div>
            <div className="text-center">
              <Heart className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Inclusive Design</h4>
              <p className="text-sm text-slate-300">WCAG 2.1 AAA accessibility compliance</p>
            </div>
            <div className="text-center">
              <Award className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Award Winning</h4>
              <p className="text-sm text-slate-300">Recognized for innovation in education tech</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPortalEntry;