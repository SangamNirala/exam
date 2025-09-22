import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  BookOpen,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Shield,
  Eye,
  Clock,
  FileText,
  Users,
  Monitor,
  Wifi,
  Battery,
  Volume2,
  Accessibility,
  Play,
  Info,
  HelpCircle,
  Settings,
  Zap,
  Target,
  Award
} from 'lucide-react';
import { useStudentAuth } from '../../contexts/StudentAuthContext';

const ExamInstructions = () => {
  const { state, setStep, completeAuthentication } = useStudentAuth();
  const { examInfo, studentInfo } = state;
  
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState(new Set());
  const [acknowledgments, setAcknowledments] = useState({
    academicIntegrity: false,
    technicalRequirements: false,
    monitoringConsent: false,
    accessibilityNotice: false
  });
  const [systemCheck, setSystemCheck] = useState({
    camera: true,
    microphone: false,
    internet: true,
    battery: true,
    browser: true
  });

  const sections = [
    {
      id: 'welcome',
      title: 'Welcome & Overview',
      icon: BookOpen,
      color: 'blue'
    },
    {
      id: 'integrity',
      title: 'Academic Integrity',
      icon: Shield,
      color: 'red'
    },
    {
      id: 'technical',
      title: 'Technical Requirements',
      icon: Monitor,
      color: 'green'
    },
    {
      id: 'monitoring',
      title: 'Exam Monitoring',
      icon: Eye,
      color: 'purple'
    },
    {
      id: 'accessibility',
      title: 'Accessibility Support',
      icon: Accessibility,
      color: 'pink'
    },
    {
      id: 'final',
      title: 'Final Confirmation',
      icon: CheckCircle,
      color: 'yellow'
    }
  ];

  // Auto-mark section as completed when viewed for 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCompletedSections(prev => new Set([...prev, currentSection]));
    }, 10000);

    return () => clearTimeout(timer);
  }, [currentSection]);

  const handleSectionChange = (index) => {
    setCurrentSection(index);
    setCompletedSections(prev => new Set([...prev, currentSection]));
  };

  const handleAcknowledgment = (key, value) => {
    setAcknowledments(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    return Object.values(acknowledgments).every(Boolean) && 
           completedSections.size >= sections.length - 1;
  };

  const handleStartExam = () => {
    // Set authentication as complete and move to exam
    dispatch({ type: 'SET_AUTHENTICATED', payload: true });
    setStep('exam');
  };

  const renderWelcomeSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl inline-block mb-6">
          <BookOpen className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Welcome to Your Assessment</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          You're about to begin your assessment. Please read through these instructions carefully 
          to ensure a smooth and successful exam experience.
        </p>
      </div>

      {examInfo && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <span>Assessment Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{examInfo.title}</h3>
              {examInfo.description && (
                <p className="text-slate-600 mb-4">{examInfo.description}</p>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Duration</p>
                  <p className="text-blue-600">{examInfo.duration} minutes</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Questions</p>
                  <p className="text-green-600">{examInfo.question_count} questions</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Target className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-800">Type</p>
                  <p className="text-purple-600">{examInfo.exam_type?.toUpperCase() || 'Mixed'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Award className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Difficulty</p>
                  <p className="text-yellow-600">{examInfo.difficulty || 'Intermediate'}</p>
                </div>
              </div>
            </div>

            {studentInfo?.name && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Student</p>
                    <p className="text-green-600">{studentInfo.name}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderIntegritySection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="p-4 bg-gradient-to-r from-red-100 to-orange-100 rounded-2xl inline-block mb-6">
          <Shield className="w-12 h-12 text-red-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Academic Integrity</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          This assessment is designed to evaluate your individual knowledge and skills. 
          Please review and acknowledge these academic integrity guidelines.
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">You agree to:</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Work independently</p>
                  <p className="text-green-600 text-sm">Complete the assessment using only your own knowledge and skills</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">No external assistance</p>
                  <p className="text-green-600 text-sm">Not seek help from other people, websites, or resources during the exam</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Maintain exam security</p>
                  <p className="text-green-600 text-sm">Not share, discuss, or disclose exam content with others</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Follow monitoring guidelines</p>
                  <p className="text-green-600 text-sm">Comply with all monitoring and behavioral requirements</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Violations Result In:</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• Immediate exam termination</li>
                  <li>• Automatic failing grade</li>
                  <li>• Report to academic administration</li>
                  <li>• Additional disciplinary action</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="integrity-agreement"
              checked={acknowledgments.academicIntegrity}
              onChange={(e) => handleAcknowledgment('academicIntegrity', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label htmlFor="integrity-agreement" className="text-slate-700 font-medium">
              I understand and agree to uphold academic integrity standards during this assessment
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTechnicalSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl inline-block mb-6">
          <Monitor className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Technical Requirements</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Your system has been verified and meets all technical requirements for the assessment.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: 'camera', label: 'Camera Access', icon: Eye, status: systemCheck.camera },
              { key: 'internet', label: 'Internet Connection', icon: Wifi, status: systemCheck.internet },
              { key: 'battery', label: 'Battery Level', icon: Battery, status: systemCheck.battery },
              { key: 'browser', label: 'Browser Compatibility', icon: Monitor, status: systemCheck.browser }
            ].map(item => (
              <div key={item.key} className={`flex items-center space-x-3 p-3 rounded-lg ${
                item.status ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <item.icon className={`w-5 h-5 ${item.status ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`font-medium ${item.status ? 'text-green-800' : 'text-red-800'}`}>
                  {item.label}
                </span>
                {item.status ? (
                  <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 ml-auto" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Info className="w-6 h-6 text-blue-600" />
              <span>Technical Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <span className="text-slate-700">Keep your browser tab active during the exam</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <span className="text-slate-700">Ensure stable internet connection throughout</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <span className="text-slate-700">Close unnecessary applications to optimize performance</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <span className="text-slate-700">Your progress is automatically saved</span>
              </div>
            </div>

            <div className="mt-6 flex items-center space-x-3">
              <input
                type="checkbox"
                id="technical-agreement"
                checked={acknowledgments.technicalRequirements}
                onChange={(e) => handleAcknowledgment('technicalRequirements', e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <label htmlFor="technical-agreement" className="text-slate-700 font-medium">
                I understand the technical requirements and my system is ready
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMonitoringSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl inline-block mb-6">
          <Eye className="w-12 h-12 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Exam Monitoring</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          To ensure exam integrity, your assessment session will be monitored using advanced AI technology.
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900">What We Monitor:</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800">Face position and attention</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Monitor className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800">Screen focus and tab switching</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800">Multiple person detection</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800">Suspicious behavior patterns</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900">Your Privacy:</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Data Protection</p>
                    <p className="text-green-600 text-sm">All monitoring data is encrypted and automatically deleted after exam review</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Settings className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Purpose Limited</p>
                    <p className="text-green-600 text-sm">Monitoring is used only for exam integrity, not for surveillance</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <HelpCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Transparent Process</p>
                    <p className="text-green-600 text-sm">You'll receive notifications about any monitoring alerts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">During Your Exam:</h4>
                <ul className="text-purple-700 text-sm space-y-1">
                  <li>• Keep your face visible to the camera at all times</li>
                  <li>• Avoid looking away from the screen for extended periods</li>
                  <li>• Don't cover or obstruct your camera</li>
                  <li>• Stay alone in the room during the entire assessment</li>
                  <li>• Minimize movements and distractions</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="monitoring-consent"
              checked={acknowledgments.monitoringConsent}
              onChange={(e) => handleAcknowledgment('monitoringConsent', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label htmlFor="monitoring-consent" className="text-slate-700 font-medium">
              I consent to exam monitoring and understand the privacy policies
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAccessibilitySection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl inline-block mb-6">
          <Accessibility className="w-12 h-12 text-pink-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Accessibility Support</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Our platform provides comprehensive accessibility features to ensure equal access for all students.
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900">Available Features:</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800">Text-to-speech with voice control</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <Eye className="w-5 h-5 text-green-600" />
                  <span className="text-green-800">High contrast and large text modes</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <Settings className="w-5 h-5 text-purple-600" />
                  <span className="text-purple-800">Keyboard-only navigation</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <HelpCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800">Screen reader compatibility</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900">Additional Support:</h3>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <HelpCircle className="w-6 h-6 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Need More Help?</h4>
                    <p className="text-blue-700 text-sm mb-4">
                      If you require accommodations not covered by our built-in features, 
                      please contact your instructor before beginning the exam.
                    </p>
                    <Button variant="outline" size="sm" className="rounded-lg">
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-pink-50 rounded-lg p-6 border border-pink-200">
            <div className="flex items-start space-x-3">
              <Accessibility className="w-6 h-6 text-pink-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-pink-800 mb-2">WCAG 2.1 AAA Compliant</h4>
                <p className="text-pink-700 text-sm">
                  Our platform meets the highest international accessibility standards to ensure 
                  equal access for students with disabilities. All features are designed with 
                  inclusive design principles.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="accessibility-acknowledgment"
              checked={acknowledgments.accessibilityNotice}
              onChange={(e) => handleAcknowledgment('accessibilityNotice', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label htmlFor="accessibility-acknowledgment" className="text-slate-700 font-medium">
              I understand the accessibility features available and how to access them
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFinalSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="p-4 bg-gradient-to-r from-yellow-100 to-green-100 rounded-2xl inline-block mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Begin</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          You've completed all required sections. Review your acknowledgments and start your assessment when ready.
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 space-y-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Acknowledgment Summary:</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: 'academicIntegrity', label: 'Academic Integrity Agreement', icon: Shield },
              { key: 'technicalRequirements', label: 'Technical Requirements', icon: Monitor },
              { key: 'monitoringConsent', label: 'Monitoring Consent', icon: Eye },
              { key: 'accessibilityNotice', label: 'Accessibility Notice', icon: Accessibility }
            ].map(item => (
              <div key={item.key} className={`flex items-center space-x-3 p-4 rounded-lg border-2 ${
                acknowledgments[item.key] 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <item.icon className={`w-5 h-5 ${
                  acknowledgments[item.key] ? 'text-green-600' : 'text-red-600'
                }`} />
                <span className={`font-medium ${
                  acknowledgments[item.key] ? 'text-green-800' : 'text-red-800'
                }`}>
                  {item.label}
                </span>
                {acknowledgments[item.key] ? (
                  <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 ml-auto" />
                )}
              </div>
            ))}
          </div>

          {canProceed() ? (
            <div className="bg-green-50 rounded-lg p-6 border border-green-200 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-green-800 mb-2">All Requirements Met!</h4>
              <p className="text-green-700 text-sm mb-4">
                You have completed all necessary acknowledgments and are ready to begin your assessment.
              </p>
              <Button 
                onClick={handleStartExam}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-xl"
              >
                <Play className="w-5 h-5 mr-3" />
                Start Assessment
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </div>
          ) : (
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200 text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
              <h4 className="font-semibold text-yellow-800 mb-2">Complete All Sections</h4>
              <p className="text-yellow-700 text-sm">
                Please review and acknowledge all sections before proceeding to the assessment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentSection = () => {
    switch (sections[currentSection].id) {
      case 'welcome': return renderWelcomeSection();
      case 'integrity': return renderIntegritySection();
      case 'technical': return renderTechnicalSection();
      case 'monitoring': return renderMonitoringSection();
      case 'accessibility': return renderAccessibilitySection();
      case 'final': return renderFinalSection();
      default: return renderWelcomeSection();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setStep('faceCapture')}
            className="mb-6 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Verification
          </Button>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Assessment Instructions</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Please review all sections carefully before beginning your assessment.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(index)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 ${
                      index === currentSection
                        ? `bg-${section.color}-100 border-2 border-${section.color}-300`
                        : completedSections.has(index)
                        ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                        : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <section.icon className={`w-5 h-5 ${
                      index === currentSection
                        ? `text-${section.color}-600`
                        : completedSections.has(index)
                        ? 'text-green-600'
                        : 'text-slate-500'
                    }`} />
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${
                        index === currentSection
                          ? `text-${section.color}-800`
                          : completedSections.has(index)
                          ? 'text-green-800'
                          : 'text-slate-700'
                      }`}>
                        {section.title}
                      </p>
                    </div>
                    {completedSections.has(index) && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Progress */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">Progress</p>
                  <div className="text-2xl font-bold text-slate-900">
                    {Math.round((completedSections.size / sections.length) * 100)}%
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(completedSections.size / sections.length) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderCurrentSection()}
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => handleSectionChange(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
                className="rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentSection < sections.length - 1 ? (
                <Button
                  onClick={() => handleSectionChange(currentSection + 1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : canProceed() ? (
                <Button 
                  onClick={handleStartExam}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Assessment
                </Button>
              ) : (
                <Button disabled className="rounded-xl">
                  Complete All Sections
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInstructions;