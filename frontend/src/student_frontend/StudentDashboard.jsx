import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Key,
  FileText,
  Clock,
  Users,
  Play,
  Accessibility,
  Volume2,
  Mic,
  Type,
  Eye,
  Keyboard,
  CheckCircle,
  AlertCircle,
  Star,
  Trophy,
  Target,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { useStudent } from '../contexts/StudentContext';
import TokenLogin from './TokenLogin/LoginScreen';
import ExamInterface from './Assessment/ExamInterface';
import PWDControls from './AccessibilityPanel/PWDControls';

const StudentDashboard = () => {
  const { state, setView, toggleAccessibility } = useStudent();
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);

  // Mock data for demo
  const mockExamHistory = [
    { id: 1, title: 'AI Fundamentals Test', score: 85, maxScore: 100, date: '2024-01-15', status: 'completed' },
    { id: 2, title: 'Digital Literacy Assessment', score: 92, maxScore: 100, date: '2024-01-12', status: 'completed' },
    { id: 3, title: 'Programming Basics', score: 78, maxScore: 100, date: '2024-01-10', status: 'completed' }
  ];

  const mockAvailableExams = [
    {
      id: 'demo-1',
      title: 'Digital Literacy Fundamentals',
      description: 'Test your basic digital skills and computer literacy',
      duration: 30,
      questions: 15,
      difficulty: 'Beginner',
      type: 'MCQ',
      isDemo: true
    },
    {
      id: 'demo-2', 
      title: 'AI Awareness Assessment',
      description: 'Evaluate your understanding of artificial intelligence concepts',
      duration: 45,
      questions: 20,
      difficulty: 'Intermediate',
      type: 'Mixed',
      isDemo: true
    }
  ];

  const accessibilityFeatures = [
    {
      id: 'textToSpeech',
      name: 'Text-to-Speech',
      description: 'Listen to questions and content',
      icon: Volume2,
      enabled: state.accessibility.textToSpeech
    },
    {
      id: 'speechToText',
      name: 'Speech-to-Text',
      description: 'Voice input for answers',
      icon: Mic,
      enabled: state.accessibility.speechToText
    },
    {
      id: 'largeText',
      name: 'Large Text',
      description: 'Increase font size for better readability',
      icon: Type,
      enabled: state.accessibility.largeText
    },
    {
      id: 'highContrast',
      name: 'High Contrast',
      description: 'Enhanced visibility and contrast',
      icon: Eye,
      enabled: state.accessibility.highContrast
    },
    {
      id: 'keyboardNavigation',
      name: 'Keyboard Navigation',
      description: 'Navigate using keyboard only',
      icon: Keyboard,
      enabled: state.accessibility.keyboardNavigation
    }
  ];

  if (state.currentView === 'login') {
    return <TokenLogin />;
  }

  if (state.currentView === 'assessment') {
    return <ExamInterface setView={setView} toggleAccessibility={toggleAccessibility} />;
  }

  const ExamCard = ({ exam }) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {exam.title}
              </h3>
              {exam.isDemo && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Demo
                </Badge>
              )}
            </div>
            <p className="text-slate-600 mb-4 leading-relaxed">{exam.description}</p>
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {exam.duration} minutes
              </div>
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                {exam.questions} questions
              </div>
              <Badge variant="outline" className="text-xs">
                {exam.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {exam.type}
              </Badge>
            </div>
          </div>
        </div>
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl group-hover:scale-105 transition-all duration-300"
          onClick={() => setView('assessment')}
        >
          <Play className="w-4 h-4 mr-2" />
          Start Assessment
        </Button>
      </CardContent>
    </Card>
  );

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 bg-${color}-100 rounded-xl`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div>
            <p className="text-sm text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Student Portal</h2>
          <p className="text-slate-600 mt-1">Access your assessments and track your progress</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline"
            onClick={() => setShowAccessibilityPanel(true)}
            className="rounded-xl"
          >
            <Accessibility className="w-4 h-4 mr-2" />
            Accessibility
          </Button>
          <Button 
            variant="outline"
            onClick={() => setView('login')}
            className="rounded-xl"
          >
            <Key className="w-4 h-4 mr-2" />
            Enter Token
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard
          icon={Trophy}
          title="Assessments Completed"
          value={mockExamHistory.length}
          subtitle="All time"
          color="green"
        />
        <StatCard
          icon={Target}
          title="Average Score"
          value="85%"
          subtitle="Last 5 assessments"
          color="blue"
        />
        <StatCard
          icon={Clock}
          title="Time Saved"
          value="2.5 hrs"
          subtitle="With accessibility features"
          color="purple"
        />
        <StatCard
          icon={Star}
          title="Achievement Level"
          value="Proficient"
          subtitle="Keep it up!"
          color="yellow"
        />
      </div>

      {/* Available Assessments */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-900">Available Assessments</h3>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-4 h-4 mr-1" />
            Demo Ready
          </Badge>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {mockAvailableExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      </div>

      {/* Assessment History */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-6">Recent Assessment History</h3>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              {mockExamHistory.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FileText className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{exam.title}</h4>
                      <p className="text-sm text-slate-600">{exam.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{exam.score}/{exam.maxScore}</p>
                      <p className="text-sm text-slate-600">{Math.round((exam.score / exam.maxScore) * 100)}%</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={exam.score >= 80 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}
                    >
                      {exam.score >= 80 ? 'Excellent' : 'Good'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-8">
          <div className="flex items-start space-x-6">
            <div className="p-4 bg-white rounded-2xl shadow-sm">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-3">Getting Started Guide</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <span className="text-slate-700">Get your exam token from instructor</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <span className="text-slate-700">Configure accessibility features if needed</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <span className="text-slate-700">Start your assessment and answer questions</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <span className="text-slate-700">Review your answers before submission</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                    <span className="text-slate-700">Submit and get instant feedback</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="w-6 h-6 text-purple-600" />
                    <Button variant="ghost" className="text-purple-600 p-0 h-auto font-normal">
                      Need help? Contact support
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Panel Modal */}
      {showAccessibilityPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <PWDControls onClose={() => setShowAccessibilityPanel(false)} />
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;