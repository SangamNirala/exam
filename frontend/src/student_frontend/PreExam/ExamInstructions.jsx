import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  FileText,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  Volume2,
  VolumeX,
  Type,
  Eye,
  Keyboard,
  Users,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Monitor,
  Wifi,
  HelpCircle,
  ArrowRight,
  Timer
} from 'lucide-react';
import { useStudent } from '../../contexts/StudentContext';

const ExamInstructions = () => {
  const { state, setView, toggleAccessibility } = useStudent();
  const [hasAgreed, setHasAgreed] = useState(false);
  const [currentSection, setCurrentSection] = useState('overview');
  const [timeSpent, setTimeSpent] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [readingSections, setReadingSections] = useState(new Set());

  // Track time spent on instructions
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Text-to-speech functionality
  const speakText = (text) => {
    if (!state.accessibility.textToSpeech) return;
    
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsReading(true);
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const markSectionAsRead = (section) => {
    setReadingSections(prev => new Set([...prev, section]));
  };

  const handleProceedToExam = () => {
    if (!hasAgreed) {
      alert('Please read and agree to the exam rules before proceeding.');
      return;
    }
    setView('countdown');
  };

  const AccessibilityToggle = ({ feature, icon: Icon, label, description }) => (
    <button
      onClick={() => toggleAccessibility(feature)}
      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${
        state.accessibility[feature]
          ? 'border-blue-300 bg-blue-50'
          : 'border-slate-200 hover:border-slate-300 bg-white'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${
          state.accessibility[feature] ? 'bg-blue-100' : 'bg-slate-100'
        }`}>
          <Icon className={`w-4 h-4 ${
            state.accessibility[feature] ? 'text-blue-600' : 'text-slate-500'
          }`} />
        </div>
        <div className="text-left">
          <h4 className="font-medium text-slate-900 text-sm">{label}</h4>
          <p className="text-xs text-slate-600">{description}</p>
        </div>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        state.accessibility[feature]
          ? 'border-blue-500 bg-blue-500'
          : 'border-slate-300'
      }`}>
        {state.accessibility[feature] && (
          <CheckCircle className="w-3 h-3 text-white" />
        )}
      </div>
    </button>
  );

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const examInfo = state.examInfo || {};

  return (
    <div className={`min-h-screen bg-slate-50 ${
      state.accessibility.largeText ? 'text-lg' : ''
    } ${
      state.accessibility.highContrast ? 'bg-black text-white' : ''
    }`}>
      {/* Header */}
      <header className={`shadow-sm border-b ${
        state.accessibility.highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${
                state.accessibility.highContrast ? 'text-white' : 'text-slate-900'
              }`}>
                Pre-Exam Instructions
              </h1>
              <p className={`text-sm ${
                state.accessibility.highContrast ? 'text-gray-300' : 'text-slate-600'
              }`}>
                Please read all instructions carefully before starting your exam
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Timer className="w-4 h-4 mr-1" />
                Time: {formatTime(timeSpent)}
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Shield className="w-4 h-4 mr-1" />
                Secure Environment
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className={`border-0 shadow-lg ${
              state.accessibility.highContrast ? 'bg-gray-800 border-gray-600' : ''
            }`}>
              <CardHeader>
                <CardTitle className={`text-lg ${
                  state.accessibility.highContrast ? 'text-white' : 'text-slate-900'
                }`}>
                  Instruction Sections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { id: 'overview', label: 'Exam Overview', icon: FileText },
                  { id: 'rules', label: 'Academic Integrity', icon: Shield },
                  { id: 'technical', label: 'Technical Requirements', icon: Monitor },
                  { id: 'accessibility', label: 'Accessibility Features', icon: Eye },
                  { id: 'behavior', label: 'Expected Behavior', icon: Users }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setCurrentSection(id);
                      markSectionAsRead(id);
                    }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 ${
                      currentSection === id
                        ? (state.accessibility.highContrast ? 'bg-blue-700' : 'bg-blue-50 border-blue-200')
                        : (state.accessibility.highContrast ? 'hover:bg-gray-700' : 'hover:bg-slate-50')
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${
                      currentSection === id ? 'text-blue-600' : 'text-slate-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      currentSection === id
                        ? (state.accessibility.highContrast ? 'text-white' : 'text-blue-900')
                        : (state.accessibility.highContrast ? 'text-gray-300' : 'text-slate-700')
                    }`}>
                      {label}
                    </span>
                    {readingSections.has(id) && (
                      <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Accessibility Controls */}
            <Card className={`border-0 shadow-lg mt-6 ${
              state.accessibility.highContrast ? 'bg-gray-800 border-gray-600' : ''
            }`}>
              <CardHeader>
                <CardTitle className={`text-lg ${
                  state.accessibility.highContrast ? 'text-white' : 'text-slate-900'
                }`}>
                  Accessibility Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <AccessibilityToggle
                  feature="textToSpeech"
                  icon={isReading ? VolumeX : Volume2}
                  label="Text-to-Speech"
                  description="Listen to instructions"
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
                  label="Keyboard Only"
                  description="Navigate without mouse"
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className={`border-0 shadow-lg ${
              state.accessibility.highContrast ? 'bg-gray-800 border-gray-600' : ''
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className={`text-xl ${
                      state.accessibility.highContrast ? 'text-white' : 'text-slate-900'
                    }`}>
                      {examInfo.title || 'Assessment Instructions'}
                    </CardTitle>
                    <p className={`${
                      state.accessibility.highContrast ? 'text-gray-300' : 'text-slate-600'
                    }`}>
                      Duration: {examInfo.duration || 0} minutes • {examInfo.total_questions || 0} questions
                    </p>
                  </div>
                  {state.accessibility.textToSpeech && (
                    <Button
                      onClick={() => speakText(document.getElementById('instruction-content')?.textContent || '')}
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                    >
                      {isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      {isReading ? 'Stop' : 'Listen'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent id="instruction-content">
                {/* Dynamic content based on current section */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      {currentSection === 'overview' && 'Exam Overview'}
                      {currentSection === 'rules' && 'Academic Integrity Rules'}
                      {currentSection === 'technical' && 'Technical Requirements'}
                      {currentSection === 'accessibility' && 'Accessibility Features'}
                      {currentSection === 'behavior' && 'Expected Behavior'}
                    </h3>
                    
                    {currentSection === 'overview' && (
                      <div className="space-y-4">
                        <p className="text-slate-700">
                          This assessment will test your knowledge and understanding of the subject material. 
                          Please read all questions carefully and answer to the best of your ability.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
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
                            <span className="text-sm text-slate-700">Timer with warnings</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-slate-700">Accessibility support</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSection === 'rules' && (
                      <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <h4 className="font-semibold text-red-900 mb-2">Prohibited Actions</h4>
                          <ul className="space-y-1 text-sm text-red-700">
                            <li>• Using unauthorized materials or external resources</li>
                            <li>• Collaborating with others during the exam</li>
                            <li>• Switching browser tabs or applications</li>
                            <li>• Taking screenshots or recording the exam</li>
                          </ul>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-900 mb-2">Expected Behavior</h4>
                          <ul className="space-y-1 text-sm text-green-700">
                            <li>• Work independently using your own knowledge</li>
                            <li>• Stay focused on the exam window</li>
                            <li>• Report technical issues immediately</li>
                            <li>• Submit your work before time expires</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {(currentSection === 'technical' || currentSection === 'accessibility' || currentSection === 'behavior') && (
                      <p className="text-slate-700">
                        {currentSection === 'technical' && 'Ensure you have a stable internet connection, modern browser, and JavaScript enabled. Close unnecessary applications and disable notifications.'}
                        {currentSection === 'accessibility' && 'Our platform supports text-to-speech, font scaling, high contrast, and keyboard navigation. Configure these features to match your needs.'}
                        {currentSection === 'behavior' && 'Find a quiet environment, stay focused on the exam, and follow all academic integrity guidelines throughout the assessment.'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agreement and Proceed Section */}
            <Card className={`border-0 shadow-lg mt-8 ${
              state.accessibility.highContrast ? 'bg-gray-800 border-gray-600' : ''
            }`}>
              <CardContent className="p-6">
                <div className={`border-2 border-dashed rounded-xl p-6 ${
                  hasAgreed 
                    ? (state.accessibility.highContrast ? 'border-green-400 bg-green-900' : 'border-green-300 bg-green-50')
                    : (state.accessibility.highContrast ? 'border-gray-600 bg-gray-700' : 'border-slate-300 bg-slate-50')
                }`}>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        id="agreement"
                        checked={hasAgreed}
                        onChange={(e) => setHasAgreed(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label 
                        htmlFor="agreement" 
                        className={`font-semibold cursor-pointer ${
                          state.accessibility.highContrast ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        I have read and agree to all exam rules and requirements
                      </label>
                      <p className={`text-sm mt-1 ${
                        state.accessibility.highContrast ? 'text-gray-300' : 'text-slate-600'
                      }`}>
                        By checking this box, I acknowledge that I have carefully read all instructions, 
                        understand the academic integrity requirements, and agree to follow all exam policies.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className={
                      readingSections.size >= 3 
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {readingSections.size}/5 sections reviewed
                    </Badge>
                    <span className={`text-sm ${
                      state.accessibility.highContrast ? 'text-gray-300' : 'text-slate-600'
                    }`}>
                      Time spent: {formatTime(timeSpent)}
                    </span>
                  </div>
                  
                  <Button
                    onClick={handleProceedToExam}
                    disabled={!hasAgreed}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Proceed to Exam
                  </Button>
                </div>

                {!hasAgreed && (
                  <div className={`mt-4 text-center text-sm ${
                    state.accessibility.highContrast ? 'text-yellow-300' : 'text-yellow-600'
                  }`}>
                    Please agree to the exam rules to continue.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInstructions;