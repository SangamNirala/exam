import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  ArrowLeft,
  Key,
  FileText,
  Clock,
  Users,
  Volume2,
  VolumeX,
  Type,
  Eye,
  Mic,
  Keyboard,
  Accessibility,
  CheckCircle,
  AlertCircle,
  Play
} from 'lucide-react';

const StudentPortal = ({ onBack }) => {
  const [examToken, setExamToken] = useState('');
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [currentView, setCurrentView] = useState('login'); // login, taking-exam, completed

  const mockExamInfo = {
    title: "AI Fundamentals Assessment",
    duration: "90 minutes",
    questions: 25,
    type: "Mixed (MCQ + Descriptive)",
    instructor: "Dr. Priya Sharma"
  };

  const accessibilityFeatures = [
    {
      id: 'tts',
      name: 'Text-to-Speech',
      description: 'Listen to questions and content',
      icon: Volume2,
      enabled: false
    },
    {
      id: 'stt',
      name: 'Speech-to-Text',
      description: 'Voice input for answers',
      icon: Mic,
      enabled: false
    },
    {
      id: 'large-text',
      name: 'Large Text',
      description: 'Increase font size',
      icon: Type,
      enabled: false
    },
    {
      id: 'high-contrast',
      name: 'High Contrast',
      description: 'Enhanced visibility',
      icon: Eye,
      enabled: false
    },
    {
      id: 'keyboard-nav',
      name: 'Keyboard Navigation',
      description: 'Navigate using keyboard only',
      icon: Keyboard,
      enabled: false
    }
  ];

  const handleTokenSubmit = (e) => {
    e.preventDefault();
    if (examToken.trim()) {
      setCurrentView('taking-exam');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
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
                <CheckCircle className="w-4 h-4 mr-1" />
                Secure Environment
              </Badge>
              <Button 
                variant="outline"
                onClick={() => setAccessibilityMode(!accessibilityMode)}
                className={`rounded-xl ${accessibilityMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
              >
                <Accessibility className="w-4 h-4 mr-2" />
                Accessibility
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Token Login View */}
        {currentView === 'login' && (
          <div className="space-y-8">
            {/* Welcome Message */}
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-blue-100 to-slate-100 rounded-2xl inline-block mb-6">
                <Key className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Welcome to Your Assessment</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Enter your unique exam token to begin your assessment. No registration required – 
                just your token and you're ready to start.
              </p>
            </div>

            {/* Token Input Form */}
            <Card className="border-0 shadow-xl max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-slate-900">Enter Exam Token</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTokenSubmit} className="space-y-6">
                  <div>
                    <Input
                      type="text"
                      placeholder="Enter your exam token"
                      value={examToken}
                      onChange={(e) => setExamToken(e.target.value)}
                      className="text-center text-lg font-mono tracking-wider rounded-xl border-2 focus:border-blue-500"
                    />
                    <p className="text-sm text-slate-500 mt-2 text-center">
                      Token provided by your instructor
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-xl"
                    disabled={!examToken.trim()}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Assessment
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Accessibility Panel */}
            {accessibilityMode && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-900">
                    <Accessibility className="w-6 h-6 mr-3 text-blue-600" />
                    Accessibility Features
                  </CardTitle>
                  <p className="text-slate-600">Customize your assessment experience</p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {accessibilityFeatures.map((feature) => {
                      const IconComponent = feature.icon;
                      return (
                        <div key={feature.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <IconComponent className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900">{feature.name}</h4>
                              <p className="text-sm text-slate-600">{feature.description}</p>
                            </div>
                          </div>
                          <Button 
                            variant={feature.enabled ? "default" : "outline"}
                            size="sm"
                            className="rounded-lg"
                          >
                            {feature.enabled ? 'On' : 'Off'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sample Demo */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900">Try a Sample Assessment</CardTitle>
                <p className="text-slate-600">Experience our assessment interface with a demo exam</p>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Demo: Digital Literacy Test</h3>
                      <div className="flex items-center space-x-6 text-sm text-slate-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          15 minutes
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          10 questions
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          MCQ Format
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setCurrentView('taking-exam')}
                      className="bg-slate-700 hover:bg-slate-800 text-white rounded-xl"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Try Demo
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">No registration required • Instant access</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Taking Exam View */}
        {currentView === 'taking-exam' && (
          <div className="space-y-6">
            {/* Exam Header */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{mockExamInfo.title}</h2>
                    <div className="flex items-center space-x-6 text-slate-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Time Remaining: 85:32
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Question 1 of {mockExamInfo.questions}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" size="sm" className="rounded-lg">
                      <Volume2 className="w-4 h-4 mr-2" />
                      Listen
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Help
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Display */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">
                      Question 1: Which of the following best describes Artificial Intelligence?
                    </h3>
                    <div className="space-y-3">
                      {[
                        "A computer program that can learn and make decisions",
                        "A type of advanced calculator",
                        "A robot that looks like a human",
                        "A database management system"
                      ].map((option, index) => (
                        <label key={index} className="flex items-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
                          <input 
                            type="radio" 
                            name="question1" 
                            className="mr-4 w-4 h-4 text-blue-600"
                          />
                          <span className="text-slate-800">{String.fromCharCode(65 + index)}. {option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-6 border-t">
                    <Button variant="outline" className="rounded-xl">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <div className="text-sm text-slate-600">
                      Progress: 4% completed
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                      Next Question
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Access Panel */}
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="p-4 h-auto flex-col space-y-2 rounded-xl">
                <Mic className="w-6 h-6 text-blue-600" />
                <span className="text-sm">Voice Answer</span>
              </Button>
              <Button variant="outline" className="p-4 h-auto flex-col space-y-2 rounded-xl">
                <Type className="w-6 h-6 text-green-600" />
                <span className="text-sm">Large Text</span>
              </Button>
              <Button variant="outline" className="p-4 h-auto flex-col space-y-2 rounded-xl">
                <Eye className="w-6 h-6 text-purple-600" />
                <span className="text-sm">High Contrast</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPortal;